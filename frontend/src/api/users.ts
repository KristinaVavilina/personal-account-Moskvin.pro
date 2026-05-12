import { readJson } from './http';
import { USE_EMPLOYEES_MOCK } from '../config';
import { getMockEmployeesDirectory } from '../mocks/employeesDirectoryMock';
import type { ApiUserResponse } from '../types/userApi';

/** Минимальные поля GET /api/User для выбора dev-пользователя (как раньше). */
export interface ApiUserRow {
  id: string;
  email?: string;
  fullName?: string;
}

/** Полный объект пользователя как в UserResponse на бэке. */
export type { ApiUserResponse } from '../types/userApi';

export async function fetchUsers(): Promise<ApiUserRow[]> {
  const res = await fetch('/api/User');
  const raw = await readJson<ApiUserRow[]>(res);
  return Array.isArray(raw) ? raw : [];
}

/** Одна запись `UserResponse` из JSON (GET /api/User, элемент списка). */
export function normalizeDirectoryUser(raw: unknown): ApiUserResponse | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === 'string' ? r.id : null;
  const email = typeof r.email === 'string' ? r.email : '';
  const fullName = typeof r.fullName === 'string' ? r.fullName : '';
  if (!id || !fullName) return null;
  const role = typeof r.role === 'number' && Number.isFinite(r.role) ? r.role : 0;
  return {
    id,
    email,
    fullName,
    photoUrl: typeof r.photoUrl === 'string' ? r.photoUrl : (r.photoUrl as null | undefined),
    role,
    positionName:
      typeof r.positionName === 'string' ? r.positionName : (r.positionName as null | undefined),
    passwordHash:
      typeof r.passwordHash === 'string'
        ? r.passwordHash
        : r.passwordHash === null
          ? null
          : undefined,
  };
}

/**
 * Список сотрудников для каталога (только просмотр).
 * GET /api/User — как у BaseController.GetAll().
 */
export async function fetchEmployeesDirectory(): Promise<ApiUserResponse[]> {
  if (USE_EMPLOYEES_MOCK) {
    return getMockEmployeesDirectory();
  }
  const res = await fetch('/api/User');
  const raw = await readJson<unknown>(res);
  if (!Array.isArray(raw)) return [];
  const out: ApiUserResponse[] = [];
  for (const row of raw) {
    const u = normalizeDirectoryUser(row);
    if (u) out.push(u);
  }
  return out;
}
