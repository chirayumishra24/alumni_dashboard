import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

interface AlumniDoc {
  company?: string;
  role?: string;
  bio?: string | null;
  skills?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const school = searchParams.get('school'); // CCHS or CCWS

    const alumniRef = firestore.collection('alumni_profiles');
    let query = alumniRef.where('isVerified', '==', true);

    if (school === 'CCHS' || school === 'CCWS') {
      query = query.where('school', '==', school);
    }

    const snapshot = await query.get();
    const docs = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as AlumniDoc);

    // Calculate dynamic counts
    let iitAiimsCount = 0;
    let entrepreneursCount = 0;
    let governmentCount = 0;
    const companyCounts: { [key: string]: number } = {};

    const iitRegex = /\b(iit|aiims|bits|indian institute of technology|all india institute of medical sciences)\b/i;
    const entRegex = /\b(founder|ceo|co-founder|entrepreneur|partner|owner|proprietor|president)\b/i;
    const govRegex = /\b(diplomat|ifs|ias|ips|government|ministry|civil services|defense|army|navy|air force|police|income tax|commissioner|public services)\b/i;

    docs.forEach((doc: AlumniDoc) => {
      const company = doc.company || '';
      const role = doc.role || '';
      const bio = doc.bio || '';
      const skills = doc.skills || '';

      const fullText = `${company} ${role} ${bio} ${skills}`.toLowerCase();

      if (iitRegex.test(fullText)) iitAiimsCount++;
      if (entRegex.test(fullText)) entrepreneursCount++;
      if (govRegex.test(fullText)) governmentCount++;

      if (company.trim()) {
        const cleanCompany = company.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g," ");
        let normalized = cleanCompany;
        if (/google/i.test(cleanCompany)) normalized = 'Google';
        else if (/meta|facebook/i.test(cleanCompany)) normalized = 'Meta';
        else if (/kpmg/i.test(cleanCompany)) normalized = 'KPMG';
        else if (/amazon/i.test(cleanCompany)) normalized = 'Amazon';
        else if (/flipkart/i.test(cleanCompany)) normalized = 'Flipkart';
        else if (/microsoft/i.test(cleanCompany)) normalized = 'Microsoft';
        else if (/ey|ernst|young/i.test(cleanCompany)) normalized = 'Ernst & Young';
        else if (/deloitte/i.test(cleanCompany)) normalized = 'Deloitte';
        else if (/mckinsey/i.test(cleanCompany)) normalized = 'McKinsey';
        else if (/tcs|tata consultancy/i.test(cleanCompany)) normalized = 'TCS';
        else if (/infosys/i.test(cleanCompany)) normalized = 'Infosys';
        else if (/accenture/i.test(cleanCompany)) normalized = 'Accenture';
        
        companyCounts[normalized] = (companyCounts[normalized] || 0) + 1;
      }
    });

    // Baselines depending on school parameter
    let baseIIT = 68;
    let baseEnt = 35;
    let baseGov = 14;
    let defaultCompanies = [
      { name: 'Google', count: 4 },
      { name: 'Meta', count: 3 },
      { name: 'KPMG', count: 2 },
      { name: 'Amazon', count: 3 },
      { name: 'Flipkart', count: 3 },
      { name: 'Microsoft', count: 3 },
      { name: 'Ernst & Young', count: 5 },
      { name: 'Deloitte', count: 6 },
      { name: 'TCS', count: 8 },
      { name: 'McKinsey', count: 2 }
    ];

    if (school === 'CCHS') {
      baseIIT = 40;
      baseEnt = 20;
      baseGov = 8;
      defaultCompanies = [
        { name: 'Google', count: 2 },
        { name: 'Meta', count: 1 },
        { name: 'KPMG', count: 1 },
        { name: 'Amazon', count: 2 },
        { name: 'Flipkart', count: 2 },
        { name: 'Microsoft', count: 1 },
        { name: 'Ernst & Young', count: 3 },
        { name: 'Deloitte', count: 4 },
        { name: 'TCS', count: 5 }
      ];
    } else if (school === 'CCWS') {
      baseIIT = 28;
      baseEnt = 15;
      baseGov = 6;
      defaultCompanies = [
        { name: 'Google', count: 2 },
        { name: 'Meta', count: 2 },
        { name: 'KPMG', count: 1 },
        { name: 'Amazon', count: 2 },
        { name: 'Flipkart', count: 1 },
        { name: 'Microsoft', count: 2 },
        { name: 'Deloitte', count: 2 },
        { name: 'TCS', count: 3 }
      ];
    }

    // Merge calculated and defaults
    const topCompanies = Object.entries(companyCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const finalCompanies = [...defaultCompanies];
    topCompanies.forEach(tc => {
      const match = finalCompanies.find(fc => fc.name.toLowerCase() === tc.name.toLowerCase());
      if (match) {
        match.count += tc.count;
      } else {
        finalCompanies.push(tc);
      }
    });

    // Sort by count desc
    finalCompanies.sort((a, b) => b.count - a.count);

    const stats = {
      iitAiims: baseIIT + iitAiimsCount,
      entrepreneurs: baseEnt + entrepreneursCount,
      government: baseGov + governmentCount,
      topCompanies: finalCompanies.slice(0, 15)
    };

    const response = NextResponse.json(stats);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('Stats API GET Error: ', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
