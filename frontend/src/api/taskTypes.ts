import { readJson } from './http';

/** Ответ GET /api/TaskType (camelCase). */
export interface ApiTaskTypeResponse {
  id: number;
  name: string;
  color: string;
}

export async function fetchTaskTypes(): Promise<ApiTaskTypeResponse[]> {
  const res = await fetch('/api/TaskType');
  const raw = await readJson<ApiTaskTypeResponse[]>(res);
  return Array.isArray(raw) ? raw : [];
}
