import { getDevUserIdOverride, PROGRESS_MOCK_DEFAULT_USER_ID, USE_PROFILE_MOCK } from '../config';
import type { ApiUserResponse } from '../types/userApi';
import { getMockUserProfileById } from '../mocks/profileMock';
import { resolveDevUserId } from './devUser';
import { readJson } from './http';
import { normalizeDirectoryUser } from './users';

async function resolveProfileUserId(): Promise<string | null> {
  if (USE_PROFILE_MOCK) {
    const fromEnv = getDevUserIdOverride();
    return fromEnv || PROGRESS_MOCK_DEFAULT_USER_ID;
  }
  return resolveDevUserId();
}

/**
 * Профиль пользователя для страницы «Профиль».
 * С бэка: GET /api/User (список) — выбор по id; отдельный GET по id в текущем API перекрыт маршрутом `{archive}`.
 */
export async function fetchCurrentUserProfile(): Promise<ApiUserResponse | null> {
  const userId = await resolveProfileUserId();
  if (!userId) return null;

  if (USE_PROFILE_MOCK) {
    return getMockUserProfileById(userId);
  }

  const res = await fetch('/api/User');
  const raw = await readJson<unknown>(res);
  if (!Array.isArray(raw)) return null;
  for (const row of raw) {
    const u = normalizeDirectoryUser(row);
    if (u && u.id.toLowerCase() === userId.toLowerCase()) return u;
  }
  return null;
}
