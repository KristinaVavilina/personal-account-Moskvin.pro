import { getDevUserIdOverride, PROGRESS_MOCK_DEFAULT_USER_ID, USE_PROGRESS_MOCK } from '../config';
import { readJson } from './http';

/** Первый пользователь из API или dev-override. При `USE_PROGRESS_MOCK` — без запроса к /api/User. */
export async function resolveDevUserId(): Promise<string | null> {
  const fromEnv = getDevUserIdOverride();
  if (fromEnv) return fromEnv;

  if (USE_PROGRESS_MOCK) {
    return PROGRESS_MOCK_DEFAULT_USER_ID;
  }

  const res = await fetch('/api/User');
  const users = await readJson<Array<{ id: string }>>(res);
  if (!Array.isArray(users) || !users.length) return null;
  return users[0].id;
}
