/* eslint-disable */
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { sendRegistrationEmail } from '@/lib/email';
import { getAlumniCache, setAlumniCache, invalidateAlumniCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const school = searchParams.get('school'); // e.g. "CCHS", "CCWS", "CCIS"

    const nocache = searchParams.get('nocache') === 'true';

    // Check custom server-side in-memory cache first
    const cachedList = nocache ? null : getAlumniCache(school);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let list: any[] = [];

    if (cachedList) {
      list = cachedList;
    } else {
      const alumniRef = firestore.collection('alumni_profiles');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fetchedList: any[] = [];

      const isOutsideIndia = (data: any) => {
        const country = data.country || '';
        return country.trim().toLowerCase() !== 'india' && country.trim() !== '';
      };

      if (school === 'CCHS') {
        const snapshot = await alumniRef
          .where('school', '==', 'CCHS')
          .where('isVerified', '==', true)
          .get();
        fetchedList = snapshot.docs
          .map((doc: QueryDocumentSnapshot) => doc.data());
      } else if (school === 'CCWS') {
        const snapshot = await alumniRef
          .where('school', '==', 'CCWS')
          .where('isVerified', '==', true)
          .get();
        fetchedList = snapshot.docs
          .map((doc: QueryDocumentSnapshot) => doc.data());
      } else if (school === 'CCIS') {
        // CCIS displays data for both CCHS and CCWS, top 30 profiles each on page 1
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
          .filter(isOutsideIndia)
          .sort((a: { batch?: number }, b: { batch?: number }) => (b.batch || 0) - (a.batch || 0))
          .slice(0, 30);
        const ccwsTop = ccwsSnapshot.docs
          .map((doc: QueryDocumentSnapshot) => doc.data())
          .filter(isOutsideIndia)
          .sort((a: { batch?: number }, b: { batch?: number }) => (b.batch || 0) - (a.batch || 0))
          .slice(0, 30);
        fetchedList = [...cchsTop, ...ccwsTop];
      } else {
        // Return all verified if no school parameter specified
        const snapshot = await alumniRef
          .where('isVerified', '==', true)
          .get();
        fetchedList = snapshot.docs
          .map((doc: QueryDocumentSnapshot) => doc.data());
      }

      if (school !== 'CCIS') {
        fetchedList.sort((a: { batch?: number }, b: { batch?: number }) => (b.batch || 0) - (a.batch || 0));
      }

      setAlumniCache(school, fetchedList);
      list = fetchedList;
    }

    // Strip phone field from public view and ensure top-level avatar/avatarUrl fields exist for external consumer compatibility
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const publicList = list.map(({ phone, ...rest }) => {
      const avUrl = (rest.user?.avatarUrl && (rest.user.avatarUrl.startsWith('http') || rest.user.avatarUrl.startsWith('data:image/')))
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
    
    if (nocache) {
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    } else {
      response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    }

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
      const existingUser = userQuery.docs[0];
      // Check if there is an associated alumni profile for this user
      const profileQuery = await firestore.collection('alumni_profiles')
        .where('userId', '==', existingUser.id)
        .limit(1)
        .get();

      if (!profileQuery.empty) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      } else {
        // If there's no alumni profile, delete the orphaned user doc to allow fresh registration
        await existingUser.ref.delete();
      }
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
      isEmailVerified: false, // Default isEmailVerified to false
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

    // Construct dynamic verification link using request origin
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const verificationLink = `${origin}/verify?id=${profileId}`;

    // Trigger automatic registration received email in background
    try {
      await sendRegistrationEmail(email, name, school, verificationLink);
    } catch (err) {
      console.error('Failed to send registration email:', err);
    }

    // Invalidate custom in-memory cache
    invalidateAlumniCache();

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
