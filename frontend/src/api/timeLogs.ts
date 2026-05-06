import type { ApiTimeLogRow } from '../types/timeLogApi';
import { USE_PROGRESS_MOCK } from '../config/progressSource';
import {
  getMockApiTimeLogsInRange,
} from '../mocks/progressDashboardMock';
import { resolveDevUserId } from './devUser';
import { readJson } from './http';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Границы текущего календарного месяца в формате YYYY-MM-DD. */
export function monthBoundsIso(year: number, monthIndex0: number): { start: string; end: string } {
  const start = `${year}-${pad2(monthIndex0 + 1)}-01`;
  const lastDay = new Date(year, monthIndex0 + 1, 0).getDate();
  const end = `${year}-${pad2(monthIndex0 + 1)}-${pad2(lastDay)}`;
  return { start, end };
}

/**
 * GET /api/TimeLog/user/{userId}?startDate&endDate (DateOnly YYYY-MM-DD).
 */
export async function fetchTimeLogsForDateRange(
  startDate: string,
  endDate: string,
): Promise<ApiTimeLogRow[]> {
  if (USE_PROGRESS_MOCK) {
    const userId = await resolveDevUserId();
    if (!userId) return [];
    return getMockApiTimeLogsInRange(userId, startDate, endDate);
  }
  const userId = await resolveDevUserId();
  if (!userId) return [];

  const qs = new URLSearchParams({ startDate, endDate });
  const res = await fetch(`/api/TimeLog/user/${encodeURIComponent(userId)}?${qs}`);
  const raw = await readJson<ApiTimeLogRow[]>(res);
  return Array.isArray(raw) ? raw : [];
}

/**
 * Таймлоги указанного пользователя за интервал DateOnly (`GET /api/TimeLog/user/{userId}?startDate&endDate`).
 * В режиме моков — те же офлайн-данные, что и для дашборда, но scoped по `targetUserId`.
 */
export async function fetchTimeLogsForUserDateRange(
  targetUserId: string,
  startDate: string,
  endDate: string,
): Promise<ApiTimeLogRow[]> {
  if (USE_PROGRESS_MOCK) {
    return getMockApiTimeLogsInRange(targetUserId, startDate, endDate);
  }
  const qs = new URLSearchParams({ startDate, endDate });
  const res = await fetch(`/api/TimeLog/user/${encodeURIComponent(targetUserId)}?${qs}`);
  const raw = await readJson<ApiTimeLogRow[]>(res);
  return Array.isArray(raw) ? raw : [];
}


/**
 * Таймлоги пользователя (см. `resolveDevUserId`) за текущий календарный месяц.
 */
export async function fetchTimeLogsForCurrentMonth(): Promise<ApiTimeLogRow[]> {
  const d = new Date();
  const { start, end } = monthBoundsIso(d.getFullYear(), d.getMonth());
  return fetchTimeLogsForDateRange(start, end);
}
