import { readJson } from './http';

export interface ApiPositionResponse {
  id: number;
  title: string;
}

export interface ApiPositionWriteRequest {
  title: string;
}

export async function fetchPositions(): Promise<ApiPositionResponse[]> {
  const res = await fetch('/api/Position');
  const raw = await readJson<ApiPositionResponse[]>(res);
  return Array.isArray(raw) ? raw : [];
}

export async function fetchPositionById(id: number): Promise<ApiPositionResponse> {
  const res = await fetch(`/api/Position/${id}`);
  return readJson<ApiPositionResponse>(res);
}

export async function createPosition(body: ApiPositionWriteRequest): Promise<number> {
  const res = await fetch('/api/Position', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<number>(res);
}

export async function updatePosition(id: number, body: ApiPositionWriteRequest): Promise<void> {
  const res = await fetch(`/api/Position/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await readJson<string>(res);
}

export async function deletePosition(id: number): Promise<void> {
  const res = await fetch(`/api/Position/${id}`, { method: 'DELETE' });
  await readJson<string>(res);
}
