import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const school = searchParams.get('school'); // e.g. "CCHS", "CCWS", "CCIS"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let alumniList: any[] = [];

    if (school === 'CCHS') {
      alumniList = await prisma.alumniProfile.findMany({
        where: { school: 'CCHS', isVerified: true },
        include: { user: true },
        orderBy: [
          { batch: 'desc' },
          { id: 'desc' }
        ]
      });
    } else if (school === 'CCWS') {
      alumniList = await prisma.alumniProfile.findMany({
        where: { school: 'CCWS', isVerified: true },
        include: { user: true },
        orderBy: [
          { batch: 'desc' },
          { id: 'desc' }
        ]
      });
    } else if (school === 'CCIS') {
      // CCIS displays data for both CCHS and CCWS, top 25 profiles each on page 1
      const [cchsTop, ccwsTop] = await Promise.all([
        prisma.alumniProfile.findMany({
          where: { school: 'CCHS', isVerified: true },
          include: { user: true },
          orderBy: [
            { batch: 'desc' },
            { id: 'desc' }
          ],
          take: 25
        }),
        prisma.alumniProfile.findMany({
          where: { school: 'CCWS', isVerified: true },
          include: { user: true },
          orderBy: [
            { batch: 'desc' },
            { id: 'desc' }
          ],
          take: 25
        })
      ]);

      // Combine CCHS and CCWS top 25 profiles (total 50 profiles)
      alumniList = [...cchsTop, ...ccwsTop];
    } else {
      // Return all verified if no school parameter specified
      alumniList = await prisma.alumniProfile.findMany({
        where: { isVerified: true },
        include: { user: true },
        orderBy: [
          { batch: 'desc' },
          { id: 'desc' }
        ]
      });
    }

    const response = NextResponse.json(alumniList);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch (error) {
    console.error('Group API Error: ', error);
    return NextResponse.json({ error: 'Failed to fetch group alumni' }, { status: 500 });
  }
}

// Handle Alumni Self-Registration via POST
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, batch, program, school, company, role, skills } = body;

    if (!name || !email || !batch || !program || !school || !skills) {
      return NextResponse.json({ error: 'Missing required registration fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Create the User first
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role: 'ALUMNI',
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120` // Default placeholder avatar
      }
    });

    // Create the Alumni Profile (Unverified by default)
    const newProfile = await prisma.alumniProfile.create({
      data: {
        userId: newUser.id,
        batch: Number(batch),
        program,
        school,
        company: company || '',
        role: role || '',
        industry: skills.split(',')[0]?.trim() || 'General',
        country: 'India', // Default to India for self-registered profiles
        city: 'Mumbai', // Default to Mumbai
        skills,
        isVerified: false, // Explicitly unverified until Admin approves
        isMentor: false,
        profileComplete: 40
      },
      include: { user: true }
    });

    // Optional: Auto-create a widget entry
    await prisma.widgetSpeak.create({
      data: {
        alumniProfileId: newProfile.id,
        quote: `${name} registered as a graduate from Batch of ${batch}.`,
        isApproved: false
      }
    });

    const response = NextResponse.json({ success: true, profile: newProfile });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('Registration Error: ', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Support OPTIONS pre-flight for CORS
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
