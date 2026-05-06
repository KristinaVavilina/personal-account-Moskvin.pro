import { readJson } from './http';
import { apiTypeNameToTaskTypeLabel } from './taskTypeMap';

/** Ответ GET /api/TaskType (camelCase). */
export interface ApiTaskTypeResponse {
  id: number;
  name: string;
  color: string;
}

export interface ApiTaskTypeWriteRequest {
  name: string;
  color: string;
}

export async function fetchTaskTypes(): Promise<ApiTaskTypeResponse[]> {
  const res = await fetch('/api/TaskType');
  const raw = await readJson<ApiTaskTypeResponse[]>(res);
  return Array.isArray(raw) ? raw : [];
}

/** Сопоставление подписи виджета (после `apiTypeNameToTaskTypeLabel`) с числовым id типа на бэке. */
export function taskTypeLabelToTypeIdString(
  types: ApiTaskTypeResponse[],
  label: string,
): string | null {
  for (const t of types) {
    if (apiTypeNameToTaskTypeLabel(t.name) === label) return String(t.id);
  }
  return null;
}

export async function fetchTaskTypeById(id: number): Promise<ApiTaskTypeResponse> {
  const res = await fetch(`/api/TaskType/${id}`);
  return readJson<ApiTaskTypeResponse>(res);
}

export async function createTaskType(body: ApiTaskTypeWriteRequest): Promise<number> {
  const res = await fetch('/api/TaskType', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<number>(res);
}

export async function updateTaskType(id: number, body: ApiTaskTypeWriteRequest): Promise<void> {
  const res = await fetch(`/api/TaskType/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await readJson<string>(res);
}

export async function deleteTaskType(id: number): Promise<void> {
  const res = await fetch(`/api/TaskType/${id}`, { method: 'DELETE' });
  await readJson<string>(res);
}
