import type { BenefitWorkloadPoint } from '../mocks/benefitWorkloadMock';
import { getDaysInMonth } from '../mocks/benefitWorkloadMock';
import { USE_PROGRESS_MOCK } from '../config/progressSource';
import {
  getMockApiTimeLogsInRange,
  getMockDailyReflectionRowsForMonth,
  getMockTimelineCompletionRecordsForUser,
  mockCompletedTasksCountForCalendarMonth,
} from '../mocks/progressDashboardMock';
import type { ApiDailyReflectionResponse } from '../types/dailyReflectionApi';
import type { ApiTimeLogRow } from '../types/timeLogApi';
import { readJson } from './http';
import { monthBoundsIso } from './timeLogs';
import {
  aggregateSessionCompletionsToDayTimeline,
  aggregateSessionCompletionsToWeekBalance,
  calendarWeekBoundsLocal,
  dailyReflectionRowsToBenefitWorkloadSeries,
  stretchDayTimelineSegmentsToFullDay,
  timeLogsToDayTimelineSegments,
  timeLogsToWeekBalanceEntries,
} from '../utils/progressDashboardTransform';
import type { DayTimelineSegment } from '../mocks/dayTimelineMock';
import type { WeekBalanceEntry } from '../mocks/weekBalanceMock';
import type { ApiTaskResponse } from './tasks';
import { fetchUserTasksRaw } from './tasks';

export async function fetchEmployeeCompletedTasksCountForMonth(
  userId: string,
  year: number,
  monthIndex0: number,
): Promise<number> {
  if (!userId) return 0;
  if (USE_PROGRESS_MOCK) {
    return mockCompletedTasksCountForCalendarMonth(userId, year, monthIndex0);
  }
  const { start, end } = monthBoundsIso(year, monthIndex0);
  const qs = new URLSearchParams({ startDate: start, endDate: end });
  const res = await fetch(`/api/Task/user/${encodeURIComponent(userId)}/completed-count?${qs}`);
  const n = await readJson<number>(res);
  return typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

export async function fetchEmployeeBenefitWorkloadForMonth(
  userId: string,
  year: number,
  monthIndex0: number,
): Promise<BenefitWorkloadPoint[]> {
  const dayCount = getDaysInMonth(year, monthIndex0);
  if (!userId || dayCount < 1) return [];

  if (USE_PROGRESS_MOCK) {
    const rows = getMockDailyReflectionRowsForMonth(year, monthIndex0, userId);
    return dailyReflectionRowsToBenefitWorkloadSeries(rows, userId, year, monthIndex0);
  }

  const res = await fetch('/api/DailyReflection');
  const all = await readJson<ApiDailyReflectionResponse[]>(res);
  if (!Array.isArray(all)) return [];
  return dailyReflectionRowsToBenefitWorkloadSeries(all, userId, year, monthIndex0);
}

async function fetchEmployeeTimeLogsInRangeRaw(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<ApiTimeLogRow[]> {
  if (!userId) return [];
  if (USE_PROGRESS_MOCK) {
    return getMockApiTimeLogsInRange(userId, startDate, endDate);
  }
  const qs = new URLSearchParams({ startDate, endDate });
  const res = await fetch(`/api/TimeLog/user/${encodeURIComponent(userId)}?${qs}`);
  const raw = await readJson<ApiTimeLogRow[]>(res);
  return Array.isArray(raw) ? raw : [];
}

/** Хронология дня для сотрудника: как «Прогресс» — доли категорий по числу завершений за день (мок через демо-задачи; API пока через таймлоги). */
export async function fetchEmployeeDayTimelineSegments(
  userId: string,
  dayIso: string,
): Promise<DayTimelineSegment[]> {
  if (USE_PROGRESS_MOCK) {
    const records = getMockTimelineCompletionRecordsForUser(userId);
    return aggregateSessionCompletionsToDayTimeline(records, dayIso.slice(0, 10));
  }

  const d = dayIso.slice(0, 10);
  const tasksRaw = await fetchUserTasksRaw(userId, false);
  const taskById = new Map<string, ApiTaskResponse>(tasksRaw.map((t) => [t.id, t]));
  const logs = await fetchEmployeeTimeLogsInRangeRaw(userId, d, d);
  return stretchDayTimelineSegmentsToFullDay(
    timeLogsToDayTimelineSegments(logs, taskById, dayIso),
  );
}

/** Баланс недели для сотрудника: как «Прогресс» — число завершений по категориям за календарную неделю (мок — демо-задачи; API — таймлоги). */
export async function fetchEmployeeWeekBalance(
  userId: string,
  now = new Date(),
): Promise<WeekBalanceEntry[]> {
  const { start, end } = calendarWeekBoundsLocal(now);

  if (USE_PROGRESS_MOCK) {
    const records = getMockTimelineCompletionRecordsForUser(userId, now);
    return aggregateSessionCompletionsToWeekBalance(records, start, end);
  }

  const tasksRaw = await fetchUserTasksRaw(userId, false);
  const taskById = new Map<string, ApiTaskResponse>(tasksRaw.map((t) => [t.id, t]));
  const logs = await fetchEmployeeTimeLogsInRangeRaw(userId, start, end);
  return timeLogsToWeekBalanceEntries(logs, taskById, start, end);
}
