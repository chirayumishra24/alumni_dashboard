/**
 * sheetCleaner.ts
 * Transforms raw Google Spreadsheet rows into clean, Firestore-ready alumni objects.
 * Handles: title-casing, email sanitisation, phone extraction, junk filtering,
 * role-from-phone migration, and em-dash/underscore stripping.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface RawSheetRow {
  'S.no.'?: string | number;
  'Alumni Name'?: string;
  'Education'?: string;
  'Institution'?: string;
  'Working experience'?: string;
  'Currently working'?: string;
  'Email ID'?: string;
  'Personal Contact No.'?: string;
  'School'?: string;
  // Also accept lowercased / camelCase keys from Apps Script
  [key: string]: string | number | undefined;
}

export interface CleanAlumniRecord {
  name: string;
  email: string | null;
  education: string | null;
  institution: string | null;
  experience: string | null;
  currentRole: string | null;
  currentCompany: string | null;
  phone: string | null;
  school: string;
  /** Compound dedup key: lowercased name + school */
  dedupKey: string;
}

// ── Junk Patterns ────────────────────────────────────────────────────────────

const JUNK_VALUES = new Set(['—', '–', '-', '_', '', 'null', 'undefined', 'n/a', 'na', 'nil']);

/** Phone-column strings that are actually roles/status notes, not phone numbers */
const PHONE_JUNK_PATTERNS = [
  /not\s*(?:in\s*use|working)/i,
  /call\s*not\s*received/i,
  /will\s*text/i,
  /all\s*the\s*no/i,
  /details?\s*later/i,
];

/** Regex for a plausible Indian / international phone number */
const VALID_PHONE_RE = /^\+?[\d][\d\s\-()]{6,}$/;

/** Regex for a plausible email (loose) */
const VALID_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Return `null` if the value is a junk placeholder, otherwise the trimmed string.
 */
function stripJunk(value: string | number | undefined | null): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (JUNK_VALUES.has(str.toLowerCase())) return null;
  if (str.length === 0) return null;
  return str;
}

/**
 * Convert an ALL-CAPS or mixed string to Title Case.
 * "SAMEER TANEJA" → "Sameer Taneja"
 * "Dr. Aakash Sharma" → "Dr. Aakash Sharma" (unchanged)
 */
function toTitleCase(name: string): string {
  // Only apply if the name looks ALL-CAPS (more than 60% uppercase letters)
  const letters = name.replace(/[^a-zA-Z]/g, '');
  const upperCount = (letters.match(/[A-Z]/g) || []).length;
  if (letters.length > 0 && upperCount / letters.length > 0.6) {
    return name
      .toLowerCase()
      .replace(/(?:^|\s|[-.])\w/g, (match) => match.toUpperCase());
  }
  return name;
}

/**
 * Clean an email address: strip `www.` prefix, lowercase, validate.
 */
function cleanEmail(raw: string | null): string | null {
  if (!raw) return null;
  let email = raw.trim().toLowerCase();
  // Strip www. prefix (common typo in the sheet)
  email = email.replace(/^www\./, '');
  if (!VALID_EMAIL_RE.test(email)) return null;
  return email;
}

/**
 * Extract a valid phone number, or detect an embedded role/note.
 * Returns `{ phone, extractedRole }`.
 */
function cleanPhone(raw: string | null): { phone: string | null; extractedRole: string | null } {
  if (!raw) return { phone: null, extractedRole: null };
  const str = raw.trim();

  // Check if it's a known junk note
  for (const pattern of PHONE_JUNK_PATTERNS) {
    if (pattern.test(str)) return { phone: null, extractedRole: null };
  }

  // If it looks like a real phone number, keep it
  if (VALID_PHONE_RE.test(str)) {
    return { phone: str.replace(/[\s\-()]/g, ''), extractedRole: null };
  }

  // Otherwise it's probably a role/profession stored in the wrong column
  // e.g. "Assistant Commandant (ICG)", "Civil Engineer, PD Core", "CA/CS Final"
  if (str.length > 3 && /[a-zA-Z]/.test(str)) {
    return { phone: null, extractedRole: str };
  }

  return { phone: null, extractedRole: null };
}

/**
 * Parse "Currently working" field into role + company.
 * Patterns:
 *   "Software Engineer at Google" → role="Software Engineer", company="Google"
 *   "J.P. Morgan"                → role=null, company="J.P. Morgan"
 *   "Operations Analyst at Wayfair" → role="Operations Analyst", company="Wayfair"
 */
function parseCurrentlyWorking(value: string | null): { role: string | null; company: string | null } {
  if (!value) return { role: null, company: null };

  // Try "Role at Company" pattern
  const atMatch = value.match(/^(.+?)\s+at\s+(.+)$/i);
  if (atMatch) {
    return { role: atMatch[1].trim(), company: atMatch[2].trim() };
  }

  // If it contains a comma, try "Role, Company"
  const commaMatch = value.match(/^(.+?),\s*(.+)$/);
  if (commaMatch) {
    return { role: commaMatch[1].trim(), company: commaMatch[2].trim() };
  }

  // Could be just a company name or just a role
  return { role: null, company: value };
}

// ── Main Cleaner ─────────────────────────────────────────────────────────────

/**
 * Clean a single raw sheet row into a structured alumni record.
 * Returns `null` if the row has no usable name (completely junk).
 */
export function cleanSheetRow(raw: RawSheetRow): CleanAlumniRecord | null {
  // Resolve column names (handle both exact and flexible key matching)
  const rawName = stripJunk(raw['Alumni Name'] || raw['alumni name'] || raw['name']);
  if (!rawName) return null; // Name is mandatory

  const name = toTitleCase(rawName);
  const education = stripJunk(raw['Education'] || raw['education']);
  const institution = stripJunk(raw['Institution'] || raw['institution']);
  const experience = stripJunk(raw['Working experience'] || raw['working experience']);
  const currentlyWorking = stripJunk(raw['Currently working'] || raw['currently working']);
  const rawEmail = stripJunk(raw['Email ID'] || raw['email id'] || raw['email']);
  const rawPhone = stripJunk(raw['Personal Contact No.'] || raw['personal contact no.'] || raw['phone']);
  const school = stripJunk(raw['School'] || raw['school']) || 'CCHS';

  // Clean email
  const email = cleanEmail(rawEmail);

  // Clean phone — extract embedded roles
  const { phone, extractedRole } = cleanPhone(rawPhone);

  // Parse "Currently working" into role + company
  const { role: parsedRole, company: parsedCompany } = parseCurrentlyWorking(currentlyWorking);

  // Determine final role: prefer parsed role from "Currently working",
  // fall back to role extracted from phone column
  const currentRole = parsedRole || extractedRole || null;
  const currentCompany = parsedCompany || null;

  // Build dedup key
  const dedupKey = `${name.toLowerCase().replace(/\s+/g, '_')}__${school.toUpperCase()}`;

  return {
    name,
    email,
    education,
    institution,
    experience,
    currentRole,
    currentCompany,
    phone,
    school: school.toUpperCase(),
    dedupKey,
  };
}

/**
 * Clean an array of raw sheet rows. Filters out junk rows and deduplicates.
 * Later occurrences of the same dedupKey are merged (non-null fields win).
 */
export function cleanSheetData(rows: RawSheetRow[]): CleanAlumniRecord[] {
  const dedupMap = new Map<string, CleanAlumniRecord>();

  for (const raw of rows) {
    const cleaned = cleanSheetRow(raw);
    if (!cleaned) continue;

    const existing = dedupMap.get(cleaned.dedupKey);
    if (existing) {
      // Merge: non-null fields from the newer row take precedence
      dedupMap.set(cleaned.dedupKey, {
        ...existing,
        email: cleaned.email || existing.email,
        education: cleaned.education || existing.education,
        institution: cleaned.institution || existing.institution,
        experience: cleaned.experience || existing.experience,
        currentRole: cleaned.currentRole || existing.currentRole,
        currentCompany: cleaned.currentCompany || existing.currentCompany,
        phone: cleaned.phone || existing.phone,
      });
    } else {
      dedupMap.set(cleaned.dedupKey, cleaned);
    }
  }

  return Array.from(dedupMap.values());
}

// ── CSV Parser (for cron full-pull) ──────────────────────────────────────────

/**
 * Parse a CSV string (from Google Sheets export) into RawSheetRow[].
 * Handles quoted fields with commas and newlines.
 */
export function parseCSV(csv: string): RawSheetRow[] {
  const lines = csv.split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: RawSheetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: RawSheetRow = {};
    headers.forEach((header, idx) => {
      row[header.trim().replace(/^"|"$/g, '')] = (values[idx] || '').replace(/^"|"$/g, '');
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ── Firestore Record Builder ─────────────────────────────────────────────────

/**
 * Convert a CleanAlumniRecord into the shape expected by Firestore
 * (matching the existing alumni_profiles + users collection structure).
 */
export function toFirestorePayload(record: CleanAlumniRecord) {
  const userId = `sheet_${record.dedupKey}`;
  const profileId = `sheet_profile_${record.dedupKey}`;

  const userData = {
    id: userId,
    email: record.email || `${record.dedupKey}@placeholder.local`,
    name: record.name,
    role: 'ALUMNI',
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(record.name)}&background=6b1d2f&color=fff&size=120&bold=true`,
  };

  const bio = [record.experience, record.education]
    .filter(Boolean)
    .join(' • ') || null;

  const skills = [record.education, record.experience]
    .filter(Boolean)
    .join(', ') || 'Alumni';

  const profileData = {
    id: profileId,
    userId,
    batch: 0, // Sheet doesn't have batch year
    program: record.education || 'General',
    school: record.school,
    company: record.currentCompany || record.institution || '',
    role: record.currentRole || '',
    industry: record.education || 'General',
    country: 'India',
    city: 'Jaipur',
    skills,
    isVerified: true, // Admin-managed sheet → auto-verified
    isEmailVerified: !!record.email,
    isMentor: false,
    profileComplete: record.email ? 60 : 40,
    user: userData,
    linkedin: '',
    phone: record.phone || '',
    bio: bio || '',
    source: 'google_sheet', // Track provenance
    dedupKey: record.dedupKey,
  };

  return { userId, profileId, userData, profileData };
}
