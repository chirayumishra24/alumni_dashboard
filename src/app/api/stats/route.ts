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

    const iitRegex = /\b(iit|aiims|bits|iim|nlu|strathclyde|nmims|escp|kth|lsr|technology|medical|sciences|law|university|college|institute)\b/i;
    const entRegex = /\b(founder|ceo|co-founder|entrepreneur|partner|owner|proprietor|president|director|lead|chief|manager|head)\b/i;
    const govRegex = /\b(diplomat|ifs|ias|ips|upsc|government|ministry|civil|defense|army|navy|air force|police|tax|commissioner|officer|advocate|court|lieutenant)\b/i;

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

    // Get sorted dynamic top companies
    const topCompanies = Object.entries(companyCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const stats = {
      iitAiims: iitAiimsCount,
      entrepreneurs: entrepreneursCount,
      government: governmentCount,
      topCompanies: topCompanies.slice(0, 15)
    };

    const nocache = searchParams.get('nocache') === 'true';

    const response = NextResponse.json(stats);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (nocache) {
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    } else {
      response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    }

    return response;
  } catch (error) {
    console.error('Stats API GET Error: ', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
