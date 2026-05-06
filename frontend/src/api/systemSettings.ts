import { readJson } from './http';

/** Ответ GET /api/System (ключ — `id`). */
export interface ApiSystemSettingResponse {
  id: string;
  value: string | null;
  description: string | null;
}

export interface ApiSystemSettingWriteRequest {
  value?: string | null;
  description?: string | null;
}

export async function fetchSystemSettings(): Promise<ApiSystemSettingResponse[]> {
  const res = await fetch('/api/System');
  const raw = await readJson<ApiSystemSettingResponse[]>(res);
  return Array.isArray(raw) ? raw : [];
}

export async function fetchSystemSettingById(id: string): Promise<ApiSystemSettingResponse> {
  const res = await fetch(`/api/System/${encodeURIComponent(id)}`);
  return readJson<ApiSystemSettingResponse>(res);
}

export async function createSystemSetting(body: ApiSystemSettingWriteRequest): Promise<string> {
  const res = await fetch('/api/System', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<string>(res);
}

export async function updateSystemSetting(
  id: string,
  body: ApiSystemSettingWriteRequest,
): Promise<void> {
  const res = await fetch(`/api/System/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await readJson<string>(res);
}

export async function deleteSystemSetting(id: string): Promise<void> {
  const res = await fetch(`/api/System/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await readJson<string>(res);
}
