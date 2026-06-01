import { TASK_TYPES } from '../constants';
import { readJson } from './http';

/** Цвета категорий при автосоздании через POST /api/TaskType (см. qa/fix_task_types.sql). */
const TASK_TYPE_CATEGORY_COLORS: Record<(typeof TASK_TYPES)[number], string> = {
  Задачи: '#4F46E5',
  Обсуждения: '#06B6D4',
  Рутина: '#84CC16',
  Обучение: '#F59E0B',
  Прочее: '#8B5CF6',
};

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

/** Подпись виджета → id типа на бэке (имена в справочнике совпадают с `TASK_TYPES`). */
export function taskTypeLabelToTypeIdString(
  types: ApiTaskTypeResponse[],
  label: string,
): string | null {
  const trimmed = label.trim();
  for (const t of types) {
    if (t.name.trim() === trimmed) return String(t.id);
  }
  return null;
}

/**
 * Возвращает id типа для подписи виджета; при отсутствии в справочнике создаёт запись на бэке.
 */
export async function ensureTaskTypeIdString(label: string): Promise<string> {
  let types = await fetchTaskTypes();
  const existing = taskTypeLabelToTypeIdString(types, label);
  if (existing) return existing;

  if (!(TASK_TYPES as readonly string[]).includes(label)) {
    throw new Error('Тип задания не найден на сервере');
  }

  const color =
    TASK_TYPE_CATEGORY_COLORS[label as (typeof TASK_TYPES)[number]] ?? '#6B7280';

  try {
    await createTaskType({ name: label, color });
  } catch {
    /* параллельное создание или гонка — перечитаем справочник */
  }

  types = await fetchTaskTypes();
  const id = taskTypeLabelToTypeIdString(types, label);
  if (!id) throw new Error('Тип задания не найден на сервере');
  return id;
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
