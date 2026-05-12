import type { TaskListItem } from '../components/layout/taskListTypes';
import { USE_PROGRESS_MOCK } from '../config';
import {
  getMockUserTasksApi,
  mockCompletedTasksCountForCalendarMonth,
} from '../mocks/progressDashboardMock';
import { resolveDevUserId } from './devUser';
import { readJson } from './http';
import { monthBoundsIso } from './timeLogs';
import { apiTypeNameToTaskTypeLabel } from './taskTypeMap';

/** Ответ API задачи (camelCase, как у System.Text.Json по умолчанию). */
export interface ApiTaskResponse {
  id: string;
  userId: string;
  typeName?: string | null;
  title: string;
  description?: string | null;
  currentProgress: number | string;
  /** Когда бэкенд начнёт отдавать даты в TaskResponse — календарь подхватит без доработок. */
  createdAt?: string;
  archivedAt?: string;
  isArchived?: boolean;
}

const PROGRESS_STEPS = [0, 20, 40, 60, 70, 90, 100] as const;

export function normalizeTaskProgress(raw: number | string): number {
  const n = typeof raw === 'string' ? parseInt(raw, 10) : raw;
  if (!Number.isFinite(n)) return 0;
  const allowed = PROGRESS_STEPS as readonly number[];
  if (allowed.includes(n)) return n;
  return allowed.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a));
}

export function apiTaskToListItem(t: ApiTaskResponse): TaskListItem {
  return {
    id: t.id,
    name: t.title,
    progress: normalizeTaskProgress(t.currentProgress),
    description: t.description ?? '',
    taskType: apiTypeNameToTaskTypeLabel(t.typeName),
  };
}

/**
 * GET /api/Task/user/{userId}?isArchived
 * Сырые объекты задач (для маппинга типов к графикам «Прогресс»).
 */
export async function fetchUserTasksRaw(
  userId: string,
  isArchived: boolean,
): Promise<ApiTaskResponse[]> {
  if (USE_PROGRESS_MOCK) {
    return getMockUserTasksApi(userId, isArchived);
  }
  const tasksRes = await fetch(
    `/api/Task/user/${encodeURIComponent(userId)}?${new URLSearchParams({
      isArchived: String(isArchived),
    })}`,
  );
  const raw = await readJson<ApiTaskResponse[]>(tasksRes);
  return Array.isArray(raw) ? raw : [];
}

/**
 * Активные задания пользователя для task-widget.
 * Пользователь: `import.meta.env.VITE_DEV_USER_ID` или первый из GET /api/User.
 */
export async function fetchActiveTasksForDashboard(): Promise<TaskListItem[]> {
  const userId = await resolveDevUserId();
  if (!userId) return [];

  const raw = await fetchUserTasksRaw(userId, false);
  return raw.map(apiTaskToListItem);
}

/**
 * GET /api/Task/user/{userId}/completed-count?startDate&endDate
 * Даты — границы календарного месяца (YYYY-MM-DD). Пользователь: VITE_DEV_USER_ID или первый из /api/User.
 */
export async function fetchCompletedTasksCountForMonth(
  year: number,
  monthIndex0: number,
): Promise<number> {
  if (USE_PROGRESS_MOCK) {
    const userId = await resolveDevUserId();
    if (!userId) return 0;
    return mockCompletedTasksCountForCalendarMonth(userId, year, monthIndex0);
  }
  const userId = await resolveDevUserId();
  if (!userId) return 0;

  const { start, end } = monthBoundsIso(year, monthIndex0);
  const qs = new URLSearchParams({ startDate: start, endDate: end });
  const res = await fetch(
    `/api/Task/user/${encodeURIComponent(userId)}/completed-count?${qs}`,
  );
  const n = await readJson<number>(res);
  if (typeof n !== 'number' || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

/** Тело POST/PUT Task (как `TaskRequest` на бэке). */
export interface ApiTaskWriteRequest {
  userId: string;
  typeId?: string | null;
  title: string;
  description?: string | null;
  currentProgress: number;
}

export async function fetchTaskById(taskId: string): Promise<ApiTaskResponse> {
  const res = await fetch(`/api/Task/${encodeURIComponent(taskId)}`);
  return readJson<ApiTaskResponse>(res);
}

export async function createTask(body: ApiTaskWriteRequest): Promise<string> {
  const res = await fetch('/api/Task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<string>(res);
}

export async function updateTask(taskId: string, body: ApiTaskWriteRequest): Promise<void> {
  const res = await fetch(`/api/Task/${encodeURIComponent(taskId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await readJson<string>(res);
}

export async function deleteTask(taskId: string): Promise<void> {
  const res = await fetch(`/api/Task/${encodeURIComponent(taskId)}`, { method: 'DELETE' });
  await readJson<string>(res);
}
