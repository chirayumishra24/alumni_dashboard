import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { parseCSV, cleanSheetData, toFirestorePayload, type RawSheetRow } from '@/lib/sheetCleaner';
import { invalidateAlumniCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Full sheet sync may take time

const SHEET_CSV_URL =
  process.env.GOOGLE_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1LJXBnAM-8t8cuBQ8jeE3m5vo1YWuLlbYn2dY3F1GQ60/gviz/tq?tqx=out:csv&gid=1703773069';

/**
 * GET /api/cron/sync-sheets
 * Full-pull from Google Sheets CSV every 6 hours (or on-demand).
 * Protected by CRON_SECRET query param.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Validate cron secret
    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 1: Fetch from Google Sheets / Apps Script Web App
    const isJsonEndpoint = SHEET_CSV_URL.includes('/macros/s/') || SHEET_CSV_URL.includes('/exec');
    const response = await fetch(SHEET_CSV_URL, {
      headers: isJsonEndpoint ? { 'Accept': 'application/json' } : { 'Accept': 'text/csv' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch sheet: ${response.status} ${response.statusText}` },
        { status: 502 }
      );
    }

    // Step 2: Parse raw rows
    let rawRows: RawSheetRow[] = [];
    if (isJsonEndpoint) {
      rawRows = await response.json() as RawSheetRow[];
    } else {
      const csvText = await response.text();
      rawRows = parseCSV(csvText);
    }

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in sheet' }, { status: 422 });
    }

    // Step 3: Clean the data
    const cleanedRecords = cleanSheetData(rawRows);

    // Step 4: Upsert into Firestore
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const record of cleanedRecords) {
      try {
        const { userId, profileId, userData, profileData } = toFirestorePayload(record);

        // Check if profile already exists by dedupKey
        const existingQuery = await firestore
          .collection('alumni_profiles')
          .where('dedupKey', '==', record.dedupKey)
          .limit(1)
          .get();

        if (!existingQuery.empty) {
          const existingDoc = existingQuery.docs[0];
          const existingData = existingDoc.data();

          // Build incremental update
          const updates: Record<string, unknown> = {};
          if (profileData.company && profileData.company !== existingData.company) updates.company = profileData.company;
          if (profileData.role && profileData.role !== existingData.role) updates.role = profileData.role;
          if (profileData.phone && profileData.phone !== existingData.phone) updates.phone = profileData.phone;
          if (profileData.bio && profileData.bio !== existingData.bio) updates.bio = profileData.bio;
          if (profileData.skills && profileData.skills !== existingData.skills) updates.skills = profileData.skills;
          if (profileData.program && profileData.program !== 'General' && profileData.program !== existingData.program) updates.program = profileData.program;

          if (userData.email && !userData.email.includes('@placeholder.local') && userData.email !== existingData.user?.email) {
            updates.user = { ...existingData.user, email: userData.email };
            updates.isEmailVerified = true;
            const existingUserId = existingData.userId;
            if (existingUserId) {
              await firestore.collection('users').doc(existingUserId).update({ email: userData.email });
            }
          }

          if (Object.keys(updates).length > 0) {
            updates.lastSyncedAt = new Date().toISOString();
            await existingDoc.ref.update(updates);
            updated++;
          } else {
            skipped++;
          }
        } else {
          // Create new
          const userRef = firestore.collection('users').doc(userId);
          await userRef.set(userData);

          const profileRef = firestore.collection('alumni_profiles').doc(profileId);
          await profileRef.set({
            ...profileData,
            lastSyncedAt: new Date().toISOString(),
          });
          created++;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`"${record.name}": ${msg}`);
      }
    }

    // Invalidate cache
    invalidateAlumniCache();

    return NextResponse.json({
      success: true,
      source: 'google_sheet_csv',
      totalRows: rawRows.length,
      cleanedRecords: cleanedRecords.length,
      created,
      updated,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron sync-sheets error:', error);
    return NextResponse.json(
      { error: 'Failed to sync from Google Sheets' },
      { status: 500 }
    );
  }
}
