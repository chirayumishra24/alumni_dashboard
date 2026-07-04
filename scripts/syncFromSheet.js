/**
 * syncFromSheet.js
 * One-time (or repeated) standalone script to import all alumni from the
 * Google Sheet into Firestore. Uses the same cleaning logic as the API routes.
 *
 * Usage: node scripts/syncFromSheet.js
 */

const { initializeApp, cert } = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

const db = getFirestore();

// ── Inline cleaning logic (mirrors sheetCleaner.ts) ──────────────────────────

const JUNK_VALUES = new Set(['—', '–', '-', '_', '', 'null', 'undefined', 'n/a', 'na', 'nil']);

const PHONE_JUNK_PATTERNS = [
  /not\s*(?:in\s*use|working)/i,
  /call\s*not\s*received/i,
  /will\s*text/i,
  /all\s*the\s*no/i,
  /details?\s*later/i,
];

const VALID_PHONE_RE = /^\+?[\d][\d\s\-()]{6,}$/;
const VALID_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stripJunk(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (JUNK_VALUES.has(str.toLowerCase())) return null;
  if (str.length === 0) return null;
  return str;
}

function toTitleCase(name) {
  const letters = name.replace(/[^a-zA-Z]/g, '');
  const upperCount = (letters.match(/[A-Z]/g) || []).length;
  if (letters.length > 0 && upperCount / letters.length > 0.6) {
    return name.toLowerCase().replace(/(?:^|\s|[-.])\w/g, (m) => m.toUpperCase());
  }
  return name;
}

function cleanEmail(raw) {
  if (!raw) return null;
  let email = raw.trim().toLowerCase();
  email = email.replace(/^www\./, '');
  if (!VALID_EMAIL_RE.test(email)) return null;
  return email;
}

function cleanPhone(raw) {
  if (!raw) return { phone: null, extractedRole: null };
  const str = raw.trim();
  for (const p of PHONE_JUNK_PATTERNS) {
    if (p.test(str)) return { phone: null, extractedRole: null };
  }
  if (VALID_PHONE_RE.test(str)) return { phone: str.replace(/[\s\-()]/g, ''), extractedRole: null };
  if (str.length > 3 && /[a-zA-Z]/.test(str)) return { phone: null, extractedRole: str };
  return { phone: null, extractedRole: null };
}

function parseCurrentlyWorking(value) {
  if (!value) return { role: null, company: null };
  const atMatch = value.match(/^(.+?)\s+at\s+(.+)$/i);
  if (atMatch) return { role: atMatch[1].trim(), company: atMatch[2].trim() };
  const commaMatch = value.match(/^(.+?),\s*(.+)$/);
  if (commaMatch) return { role: commaMatch[1].trim(), company: commaMatch[2].trim() };
  return { role: null, company: value };
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(csv) {
  const lines = csv.split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h.trim().replace(/^"|"$/g, '')] = (values[idx] || '').replace(/^"|"$/g, ''); });
    rows.push(row);
  }
  return rows;
}

// ── Main Import ──────────────────────────────────────────────────────────────

async function main() {
  const SHEET_URL = process.env.GOOGLE_SHEET_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/1LJXBnAM-8t8cuBQ8jeE3m5vo1YWuLlbYn2dY3F1GQ60/gviz/tq?tqx=out:csv&gid=1703773069';

  const isJsonEndpoint = SHEET_URL.includes('/macros/s/') || SHEET_URL.includes('/exec');
  console.log(`📥 Fetching Google Sheet data (${isJsonEndpoint ? 'JSON' : 'CSV'})...`);
  
  const res = await fetch(SHEET_URL);
  if (!res.ok) {
    console.log(`Failed to fetch sheet: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  let rawRows = [];
  if (isJsonEndpoint) {
    rawRows = await res.json();
  } else {
    const csvText = await res.text();
    rawRows = parseCSV(csvText);
  }
  console.log(`📊 Parsed ${rawRows.length} raw rows from sheet`);

  // Clean all rows
  const dedupMap = new Map();
  let junkCount = 0;

  for (const raw of rawRows) {
    const rawName = stripJunk(raw['Alumni Name']);
    if (!rawName) { junkCount++; continue; }

    const name = toTitleCase(rawName);
    const education = stripJunk(raw['Education']);
    const institution = stripJunk(raw['Institution']);
    const experience = stripJunk(raw['Working experience']);
    const currentlyWorking = stripJunk(raw['Currently working']);
    const rawEmail = stripJunk(raw['Email ID']);
    const rawPhone = stripJunk(raw['Personal Contact No.']);
    const school = stripJunk(raw['School']) || 'CCHS';

    const email = cleanEmail(rawEmail);
    const { phone, extractedRole } = cleanPhone(rawPhone);
    const { role: parsedRole, company: parsedCompany } = parseCurrentlyWorking(currentlyWorking);

    const dedupKey = `${name.toLowerCase().replace(/\s+/g, '_')}__${school.toUpperCase()}`;

    const record = {
      name,
      email,
      education,
      institution,
      experience,
      currentRole: parsedRole || extractedRole || null,
      currentCompany: parsedCompany || null,
      phone,
      school: school.toUpperCase(),
      dedupKey,
    };

    // Merge duplicates
    if (dedupMap.has(dedupKey)) {
      const existing = dedupMap.get(dedupKey);
      dedupMap.set(dedupKey, {
        ...existing,
        email: record.email || existing.email,
        education: record.education || existing.education,
        institution: record.institution || existing.institution,
        experience: record.experience || existing.experience,
        currentRole: record.currentRole || existing.currentRole,
        currentCompany: record.currentCompany || existing.currentCompany,
        phone: record.phone || existing.phone,
      });
    } else {
      dedupMap.set(dedupKey, record);
    }
  }

  const cleanedRecords = Array.from(dedupMap.values());
  console.log(`🧹 Cleaned: ${cleanedRecords.length} valid records (${junkCount} junk rows filtered)`);

  // Upsert into Firestore
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors = [];

  for (const record of cleanedRecords) {
    try {
      const userId = `sheet_${record.dedupKey}`;
      const profileId = `sheet_profile_${record.dedupKey}`;

      const userData = {
        id: userId,
        email: record.email || `${record.dedupKey}@placeholder.local`,
        name: record.name,
        role: 'ALUMNI',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(record.name)}&background=6b1d2f&color=fff&size=120&bold=true`,
      };

      const bio = [record.experience, record.education].filter(Boolean).join(' • ') || null;
      const skills = [record.education, record.experience].filter(Boolean).join(', ') || 'Alumni';

      const profileData = {
        id: profileId,
        userId,
        batch: 0,
        program: record.education || 'General',
        school: record.school,
        company: record.currentCompany || record.institution || '',
        role: record.currentRole || '',
        industry: record.education || 'General',
        country: 'India',
        city: 'Jaipur',
        skills,
        isVerified: true,
        isEmailVerified: !!record.email,
        isMentor: false,
        profileComplete: record.email ? 60 : 40,
        user: userData,
        linkedin: '',
        phone: record.phone || '',
        bio: bio || '',
        source: 'google_sheet',
        dedupKey: record.dedupKey,
        lastSyncedAt: new Date().toISOString(),
      };

      // Check if already exists
      const existingQuery = await db.collection('alumni_profiles')
        .where('dedupKey', '==', record.dedupKey)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        const existingDoc = existingQuery.docs[0];
        const existingData = existingDoc.data();
        const updates = {};

        if (profileData.company && profileData.company !== existingData.company) updates.company = profileData.company;
        if (profileData.role && profileData.role !== existingData.role) updates.role = profileData.role;
        if (profileData.phone && profileData.phone !== existingData.phone) updates.phone = profileData.phone;
        if (profileData.bio && profileData.bio !== existingData.bio) updates.bio = profileData.bio;
        if (profileData.skills && profileData.skills !== existingData.skills) updates.skills = profileData.skills;

        if (userData.email && !userData.email.includes('@placeholder.local') && userData.email !== existingData.user?.email) {
          updates.user = { ...existingData.user, email: userData.email };
          updates.isEmailVerified = true;
        }

        if (Object.keys(updates).length > 0) {
          updates.lastSyncedAt = new Date().toISOString();
          await existingDoc.ref.update(updates);
          updated++;
          console.log(`  ✏️  Updated: ${record.name}`);
        } else {
          skipped++;
        }
      } else {
        await db.collection('users').doc(userId).set(userData);
        await db.collection('alumni_profiles').doc(profileId).set(profileData);
        created++;
        console.log(`  ✅ Created: ${record.name} (${record.school})`);
      }
    } catch (err) {
      errors.push(`${record.name}: ${err.message}`);
      console.error(`  ❌ Error: ${record.name}: ${err.message}`);
    }
  }

  console.log('\n════════════════════════════════════════');
  console.log('  📋 SYNC REPORT');
  console.log('════════════════════════════════════════');
  console.log(`  Total raw rows:      ${rawRows.length}`);
  console.log(`  Cleaned records:     ${cleanedRecords.length}`);
  console.log(`  Created:             ${created}`);
  console.log(`  Updated:             ${updated}`);
  console.log(`  Skipped (unchanged): ${skipped}`);
  console.log(`  Errors:              ${errors.length}`);
  if (errors.length > 0) {
    console.log('\n  Errors:');
    errors.forEach(e => console.log(`    - ${e}`));
  }
  console.log('════════════════════════════════════════\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
