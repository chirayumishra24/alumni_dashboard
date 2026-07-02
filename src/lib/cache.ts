// Shared server-side in-memory cache to guarantee instant cache updates and invalidation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cacheMap: { [key: string]: { data: any[]; timestamp: number } } = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getAlumniCache(school: string | null) {
  const key = school || 'all';
  const entry = cacheMap[key];
  if (entry && (Date.now() - entry.timestamp < CACHE_TTL)) {
    return entry.data;
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setAlumniCache(school: string | null, data: any[]) {
  const key = school || 'all';
  cacheMap[key] = {
    data,
    timestamp: Date.now()
  };
}

export function invalidateAlumniCache() {
  for (const key in cacheMap) {
    delete cacheMap[key];
  }
}
