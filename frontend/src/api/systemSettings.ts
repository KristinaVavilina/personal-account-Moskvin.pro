import { readJson } from './http';

/** Ответ GET /api/System (ключ — `id`). */
export interface ApiSystemSettingResponse {
  id: string;
  value: string | null;
  description: string | null;
}

export async function fetchSystemSettings(): Promise<ApiSystemSettingResponse[]> {
  const res = await fetch('/api/System');
  const raw = await readJson<ApiSystemSettingResponse[]>(res);
  return Array.isArray(raw) ? raw : [];
}
