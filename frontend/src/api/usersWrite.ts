/**
 * CRUD /api/User (тела как `UserRequest` на бэке).
 * GET по id может пересекаться с маршрутом `{archive}` у `UserController`; предпочтительно `fetchUserFromList`.
 */
import type { ApiUserResponse } from '../types/userApi';
import { normalizeDirectoryUser } from './users';
import { readJson } from './http';

export interface ApiUserWriteRequest {
  email: string;
  password?: string | null;
  fullName: string;
  photoUrl?: string | null;
  role: number;
  positionId?: number | null;
}

export async function fetchUserFromList(userId: string): Promise<ApiUserResponse | null> {
  const res = await fetch('/api/User');
  const raw = await readJson<unknown>(res);
  if (!Array.isArray(raw)) return null;
  for (const row of raw) {
    const u = normalizeDirectoryUser(row);
    if (u && u.id.toLowerCase() === userId.toLowerCase()) return u;
  }
  return null;
}

/** Попытка GET /api/User/{id}; при ошибке маршрута или 404 — null. */
export async function tryFetchUserById(userId: string): Promise<ApiUserResponse | null> {
  try {
    const res = await fetch(`/api/User/${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const raw = (await res.json()) as unknown;
    return normalizeDirectoryUser(raw);
  } catch {
    return null;
  }
}

export async function createUser(body: ApiUserWriteRequest): Promise<string> {
  const res = await fetch('/api/User', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<string>(res);
}

export async function updateUser(userId: string, body: ApiUserWriteRequest): Promise<void> {
  const res = await fetch(`/api/User/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await readJson<string>(res);
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`/api/User/${encodeURIComponent(userId)}`, { method: 'DELETE' });
  await readJson<string>(res);
}
