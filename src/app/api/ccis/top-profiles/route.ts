import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

interface AlumniProfileDoc {
  id?: string;
  isVerified?: boolean;
  isMentor?: boolean;
  profileComplete?: number;
  country?: string;
  company?: string;
  role?: string;
  bio?: string;
  batch?: string;
  program?: string;
  school?: string;
  skills?: string;
  city?: string;
  linkedin?: string;
  user?: {
    name?: string;
    avatarUrl?: string;
    email?: string;
  };
}

const PROMINENT_ENTITIES = ['google', 'microsoft', 'meta', 'apple', 'tesla', 'amazon', 'deloitte', 'ey', 'tcs', 'ias', 'ips', 'aiims'];

export async function GET() {
  try {
    const snapshot = await firestore
      .collection('alumni_profiles')
      .where('isVerified', '==', true)
      .get();

    const profiles = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as AlumniProfileDoc);

    // Heuristics-based scoring for the "best" profiles
    const scoredProfiles = profiles.map((p: AlumniProfileDoc) => {
      let score = p.profileComplete || 0;

      // Prioritize international profiles for CCIS (global footprint)
      const country = (p.country || '').trim().toLowerCase();
      if (country && country !== 'india') {
        score += 100;
      }

      // Prioritize mentors
      if (p.isMentor) {
        score += 50;
      }

      // Prioritize completeness of employment detail
      const company = (p.company || '').trim().toLowerCase();
      const role = (p.role || '').trim().toLowerCase();
      if (company && role) {
        score += 30;
      }

      // Boost for prominent entities
      const hasProminentCompany = PROMINENT_ENTITIES.some(entity => company.includes(entity));
      const hasProminentRole = PROMINENT_ENTITIES.some(entity => role.includes(entity));
      if (hasProminentCompany || hasProminentRole) {
        score += 20;
      }

      // Boost for bio presence
      if ((p.bio || '').trim().length > 20) {
        score += 15;
      }

      // Small recency factor to break ties (newer batches preferred)
      const batchYear = Number(p.batch) || 2000;
      score += (batchYear - 2000) * 0.1;

      return { profile: p, score };
    });

    // Sort by score descending and take top 30
    scoredProfiles.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
    const top30 = scoredProfiles.slice(0, 30).map((item: { profile: AlumniProfileDoc }) => item.profile);

    // Cleanse sensitive fields (like phone, private email) and map to clean payload
    const publicList = top30.map((p: AlumniProfileDoc) => {
      const name = p.user?.name || 'Alumni';
      const avUrl = (p.user?.avatarUrl && (p.user.avatarUrl.startsWith('http') || p.user.avatarUrl.startsWith('data:image/')))
        ? p.user.avatarUrl
        : `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`;

      return {
        id: p.id,
        name: name,
        batch: p.batch,
        program: p.program,
        school: p.school,
        company: p.company || '',
        role: p.role || '',
        skills: p.skills || '',
        bio: p.bio || '',
        city: p.city || '',
        country: p.country || 'India',
        linkedin: p.linkedin || '',
        avatar: avUrl,
        avatarUrl: avUrl,
      };
    });

    const response = NextResponse.json(publicList);

    // Enable CORS for CCIS integration
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Cache control
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return response;
  } catch (error) {
    console.error('CCIS Top Profiles GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch top profiles' }, { status: 500 });
  }
}

export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
