export const ADMIN_SESSION_COOKIE = 'ccgs_admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function getAdminSessionToken() {
  const expectedPassword = process.env.ADMIN_PASSWORD || 'ccgs2026';
  return process.env.ADMIN_SESSION_TOKEN || `ccgs-admin-session-${expectedPassword}`;
}
