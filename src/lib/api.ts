import { Category, Movie, Episode, User, SearchResponse } from '../types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const cache = new Map<string, { expiresAt: number; value: unknown }>();

const getPlatform = () => typeof window !== 'undefined' ? (localStorage.getItem('app_platform') || 'nflix') : 'nflix';

async function request<T>(path: string, ttlMs: number, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  const key = `${init?.method || 'GET'}:${path}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;

  const response = await fetch(`${apiBaseUrl}${path}`, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: unknown } | null;
    const message = typeof body?.message === 'string' ? body.message : `Request failed: ${response.status}`;
    throw new Error(message);
  }
  const value = await response.json() as T;
  
  if (cache.size >= 50) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  
  cache.set(key, { expiresAt: Date.now() + ttlMs, value });
  return value;
}

export const fetchFeaturedMovie = () => request<Movie | null>(`/movies/featured?platform=${getPlatform()}`, 120_000);
export const fetchCategories = () => request<Category[]>(`/movies/categories?platform=${getPlatform()}`, 120_000);
export const fetchTop10Movies = () => request<Movie[]>(`/movies/top10?platform=${getPlatform()}`, 120_000);
export const fetchMovieById = (id: string) => request<Movie>(`/movies/${id}?platform=${getPlatform()}`, 60_000);
export const fetchSeasonEpisodes = (id: string, season: number) => request<Episode[]>(`/movies/${id}/season/${season}?platform=${getPlatform()}`, 60_000);

export function searchMovies(query: string, genre?: string): Promise<SearchResponse> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (genre) params.set('genre', genre);
  params.set('platform', getPlatform());
  return request<SearchResponse>(`/movies/search?${params}`, 30_000);
}

export const fetchUser = () => request<User>('/user', 300_000);

/** Clears only user-related cache entries (mylist, preferences, profile) */
function invalidateUserCache() {
  for (const key of Array.from(cache.keys())) {
    if (key.includes('/user')) cache.delete(key);
  }
}

export async function toggleMyListApi(movieId: string): Promise<{ myList: string[]; isSaved: boolean }> {
  const result = await request<{ myList: string[]; isSaved: boolean }>('/user/mylist/toggle', 0, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movieId }),
  });
  invalidateUserCache();
  return result;
}

export async function updateUserPreferencesApi(preferences: import('../types').UserPreferences) {
  const result = await request<any>('/user/preferences', 0, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  invalidateUserCache();
  return result;
}

export async function switchProfileApi(profileId: string): Promise<import('../types').UserProfile> {
  const result = await request<import('../types').UserProfile>(`/user/profile/${profileId}`, 0, { method: 'POST' });
  invalidateUserCache();
  return result;
}
