/**
 * cleanOldData.js
 * Removes all alumni_profiles and users that were NOT imported from the Google Sheet.
 * Sheet-imported records have `source: 'google_sheet'` — everything else gets deleted.
 */

const { initializeApp, cert } = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});

const db = getFirestore();

async function main() {
  console.log('🔍 Scanning alumni_profiles for old/seeded records...\n');

  const allProfiles = await db.collection('alumni_profiles').get();
  let deleteCount = 0;
  let keepCount = 0;
  const userIdsToDelete = [];

  for (const doc of allProfiles.docs) {
    const data = doc.data();

    if (data.source === 'google_sheet') {
      keepCount++;
      continue;
    }

    // This is old seeded data — delete it
    console.log(`  🗑️  Deleting: ${data.user?.name || data.id} (${data.school || '?'}) [old seed]`);
    userIdsToDelete.push(data.userId);

    // Delete associated widget testimonials
    const widgets = await db.collection('widget_testimonials')
      .where('alumniProfileId', '==', doc.id)
      .get();
    for (const w of widgets.docs) {
      await w.ref.delete();
    }

    // Delete the profile
    await doc.ref.delete();
    deleteCount++;
  }

  // Delete orphaned user docs
  for (const userId of userIdsToDelete) {
    if (!userId) continue;
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      // Don't delete the admin user
      if (userData?.role === 'ADMIN') {
        console.log(`  ⏭️  Keeping admin user: ${userData.name}`);
        continue;
      }
      await userDoc.ref.delete();
      console.log(`  🗑️  Deleted user: ${userId}`);
    }
  }

  console.log('\n════════════════════════════════════════');
  console.log('  📋 CLEANUP REPORT');
  console.log('════════════════════════════════════════');
  console.log(`  Deleted (old seed):    ${deleteCount}`);
  console.log(`  Kept (Google Sheet):   ${keepCount}`);
  console.log('════════════════════════════════════════\n');

  process.exit(0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
