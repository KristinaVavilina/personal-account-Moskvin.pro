import { readJson } from './http';

/** Первый пользователь из API или `VITE_DEV_USER_ID`. */
export async function resolveDevUserId(): Promise<string | null> {
  const fromEnv = import.meta.env.VITE_DEV_USER_ID?.trim();
  if (fromEnv) return fromEnv;

  const res = await fetch('/api/User');
  const users = await readJson<Array<{ id: string }>>(res);
  if (!Array.isArray(users) || !users.length) return null;
  return users[0].id;
}
