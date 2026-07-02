import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { sendRegistrationEmail } from '@/lib/email';
import { unstable_cache, revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

const getCachedAlumni = unstable_cache(
  async (school: string | null) => {
    const alumniRef = firestore.collection('alumni_profiles');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let list: any[] = [];

    if (school === 'CCHS') {
      const snapshot = await alumniRef
        .where('school', '==', 'CCHS')
        .where('isVerified', '==', true)
        .get();
      list = snapshot.docs
        .map((doc: QueryDocumentSnapshot) => doc.data());
    } else if (school === 'CCWS') {
      const snapshot = await alumniRef
        .where('school', '==', 'CCWS')
        .where('isVerified', '==', true)
        .get();
      list = snapshot.docs
        .map((doc: QueryDocumentSnapshot) => doc.data());
    } else if (school === 'CCIS') {
      // CCIS displays data for both CCHS and CCWS, top 25 profiles each on page 1
      const [cchsSnapshot, ccwsSnapshot] = await Promise.all([
        alumniRef
          .where('school', '==', 'CCHS')
          .where('isVerified', '==', true)
          .get(),
        alumniRef
          .where('school', '==', 'CCWS')
          .where('isVerified', '==', true)
          .get()
      ]);

      const cchsTop = cchsSnapshot.docs
        .map((doc: QueryDocumentSnapshot) => doc.data())
        .sort((a: { batch?: number }, b: { batch?: number }) => (b.batch || 0) - (a.batch || 0))
        .slice(0, 25);
      const ccwsTop = ccwsSnapshot.docs
        .map((doc: QueryDocumentSnapshot) => doc.data())
        .sort((a: { batch?: number }, b: { batch?: number }) => (b.batch || 0) - (a.batch || 0))
        .slice(0, 25);
      list = [...cchsTop, ...ccwsTop];
    } else {
      // Return all verified if no school parameter specified
      const snapshot = await alumniRef
        .where('isVerified', '==', true)
        .get();
      list = snapshot.docs
        .map((doc: QueryDocumentSnapshot) => doc.data());
    }

    if (school !== 'CCIS') {
      list.sort((a: { batch?: number }, b: { batch?: number }) => (b.batch || 0) - (a.batch || 0));
    }

    return list;
  },
  ['alumni-list-cache'],
  { revalidate: 300, tags: ['alumni'] }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const school = searchParams.get('school'); // e.g. "CCHS", "CCWS", "CCIS"

    const list = await getCachedAlumni(school);

    // Strip phone field from public view and ensure top-level avatar/avatarUrl fields exist for external consumer compatibility
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const publicList = list.map(({ phone, ...rest }) => {
      const avUrl = (rest.user?.avatarUrl && rest.user.avatarUrl.startsWith('http'))
        ? rest.user.avatarUrl
        : `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`;
      return {
        ...rest,
        avatar: avUrl,
        avatarUrl: avUrl,
      };
    });

    const response = NextResponse.json(publicList);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('Group Firestore API GET Error: ', error);
    return NextResponse.json({ error: 'Failed to fetch group alumni' }, { status: 500 });
  }
}

// Handle Alumni Self-Registration via POST
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, batch, program, school, company, role, skills, linkedin, phone, city, avatarUrl, bio } = body;

    if (!name || !email || !batch || !program || !school || !skills) {
      return NextResponse.json({ error: 'Missing required registration fields' }, { status: 400 });
    }

    // Check if user already exists in Firestore
    const userQuery = await firestore.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!userQuery.empty) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Create the User first in Firestore
    const userRef = firestore.collection('users').doc();
    const userId = userRef.id;
    const userData = {
      id: userId,
      email,
      name,
      role: 'ALUMNI',
      avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120` // Use uploaded avatarUrl or default placeholder
    };
    await userRef.set(userData);

    // Create the Alumni Profile (Unverified by default) in Firestore
    const profileRef = firestore.collection('alumni_profiles').doc();
    const profileId = profileRef.id;
    const profileData = {
      id: profileId,
      userId,
      batch: Number(batch),
      program,
      school,
      company: company || '',
      role: role || '',
      industry: skills.split(',')[0]?.trim() || 'General',
      country: 'India', // Default to India
      city: city || 'Mumbai',
      skills,
      isVerified: false,
      isMentor: false,
      profileComplete: bio ? 55 : 40,
      user: userData,
      linkedin: linkedin || '',
      phone: phone || '',
      bio: bio || ''
    };
    await profileRef.set(profileData);

    // Create widget testimonial placeholder in Firestore
    const testimonialRef = firestore.collection('widget_testimonials').doc();
    await testimonialRef.set({
      id: testimonialRef.id,
      alumniProfileId: profileId,
      quote: `${name} registered as a graduate from Batch of ${batch}.`,
      isApproved: false,
      alumni: profileData
    });

    // Trigger automatic registration received email in background
    try {
      await sendRegistrationEmail(email, name, school);
    } catch (err) {
      console.error('Failed to send registration email:', err);
    }

    // Revalidate cache on new registration
    revalidateTag('alumni');

    const response = NextResponse.json({ success: true, profile: profileData });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('Registration Firestore Error: ', error);
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
