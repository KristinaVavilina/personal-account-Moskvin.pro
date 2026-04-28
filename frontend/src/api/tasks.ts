import type { TaskListItem } from '../components/layout/taskListTypes';
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
}

const PROGRESS_STEPS = [0, 20, 40, 60, 70, 90, 100] as const;

function normalizeProgress(raw: number | string): number {
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
    progress: normalizeProgress(t.currentProgress),
    description: t.description ?? '',
    taskType: apiTypeNameToTaskTypeLabel(t.typeName),
  };
}

/**
 * Активные задания пользователя для task-widget.
 * Пользователь: `import.meta.env.VITE_DEV_USER_ID` или первый из GET /api/User.
 */
export async function fetchActiveTasksForDashboard(): Promise<TaskListItem[]> {
  const userId = await resolveDevUserId();
  if (!userId) return [];

  const tasksRes = await fetch(
    `/api/Task/user/${encodeURIComponent(userId)}?${new URLSearchParams({ isArchived: 'false' })}`,
  );
  const raw = await readJson<ApiTaskResponse[]>(tasksRes);
  if (!Array.isArray(raw)) return [];
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
