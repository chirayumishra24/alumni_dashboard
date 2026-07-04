import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { cleanSheetData, toFirestorePayload, type RawSheetRow } from '@/lib/sheetCleaner';
import { invalidateAlumniCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for large syncs

/**
 * POST /api/sync
 * Receives alumni data from Google Apps Script (onEdit / scheduled triggers).
 * Validates secret, cleans data, upserts into Firestore.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret, rows, fullSync } = body as {
      secret: string;
      rows: RawSheetRow[];
      fullSync?: boolean;
    };

    // Validate shared secret
    const expectedSecret = process.env.SYNC_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
    }

    // Clean the incoming data
    const cleanedRecords = cleanSheetData(rows);

    let synced = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const record of cleanedRecords) {
      try {
        const { userId, profileId, userData, profileData } = toFirestorePayload(record);

        // Check if a profile with this dedupKey already exists
        const existingQuery = await firestore
          .collection('alumni_profiles')
          .where('dedupKey', '==', record.dedupKey)
          .limit(1)
          .get();

        if (!existingQuery.empty) {
          // Update existing record (merge new non-null fields)
          const existingDoc = existingQuery.docs[0];
          const existingData = existingDoc.data();

          // Only update fields that are non-empty in the new data and differ
          const updates: Record<string, unknown> = {};
          if (profileData.company && profileData.company !== existingData.company) updates.company = profileData.company;
          if (profileData.role && profileData.role !== existingData.role) updates.role = profileData.role;
          if (profileData.phone && profileData.phone !== existingData.phone) updates.phone = profileData.phone;
          if (profileData.bio && profileData.bio !== existingData.bio) updates.bio = profileData.bio;
          if (profileData.skills && profileData.skills !== existingData.skills) updates.skills = profileData.skills;
          if (profileData.program && profileData.program !== 'General' && profileData.program !== existingData.program) updates.program = profileData.program;

          // Update user sub-object if email changed
          if (userData.email && !userData.email.includes('@placeholder.local') && userData.email !== existingData.user?.email) {
            updates.user = { ...existingData.user, email: userData.email };
            updates.isEmailVerified = true;

            // Also update the user doc
            const existingUserId = existingData.userId;
            if (existingUserId) {
              await firestore.collection('users').doc(existingUserId).update({
                email: userData.email,
              });
            }
          }

          if (Object.keys(updates).length > 0) {
            updates.lastSyncedAt = new Date().toISOString();
            await existingDoc.ref.update(updates);
            synced++;
          } else {
            skipped++;
          }
        } else {
          // Create new user + profile
          const userRef = firestore.collection('users').doc(userId);
          await userRef.set(userData);

          const profileRef = firestore.collection('alumni_profiles').doc(profileId);
          await profileRef.set({
            ...profileData,
            lastSyncedAt: new Date().toISOString(),
          });

          synced++;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to sync "${record.name}": ${msg}`);
      }
    }

    // Invalidate cache so dashboard picks up changes
    invalidateAlumniCache();

    return NextResponse.json({
      success: true,
      fullSync: !!fullSync,
      total: cleanedRecords.length,
      synced,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sheet Sync POST error:', error);
    return NextResponse.json(
      { error: 'Internal sync error' },
      { status: 500 }
    );
  }
}

// Support OPTIONS pre-flight for CORS (in case Apps Script sends preflight)
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
