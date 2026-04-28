import { resolveDevUserId } from './devUser';
import { readJson } from './http';
import type { ApiTimeLogRow } from '../mocks/reportGroupsFromMocks';

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
 * Таймлоги первого пользователя (или VITE_DEV_USER_ID) за текущий месяц.
 * GET /api/TimeLog/user/{userId}?startDate&endDate
 */
export async function fetchTimeLogsForCurrentMonth(): Promise<ApiTimeLogRow[]> {
  const userId = await resolveDevUserId();
  if (!userId) return [];

  const d = new Date();
  const { start, end } = monthBoundsIso(d.getFullYear(), d.getMonth());
  const qs = new URLSearchParams({ startDate: start, endDate: end });
  const res = await fetch(`/api/TimeLog/user/${encodeURIComponent(userId)}?${qs}`);
  const raw = await readJson<ApiTimeLogRow[]>(res);
  return Array.isArray(raw) ? raw : [];
}
