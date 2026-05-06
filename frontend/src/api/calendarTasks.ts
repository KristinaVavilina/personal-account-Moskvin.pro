import type { CalendarTaskRow } from '../utils/calendarGantt';
import { USE_PROGRESS_MOCK } from '../config/progressSource';
import {
  getDemoScopedMockTasks,
} from '../mocks/progressDashboardMock';
import { mockTaskTypes, type MockTask } from '../mocks/apiMockData';
import type { ApiTimeLogRow } from '../types/timeLogApi';
import { resolveDevUserId } from './devUser';
import { fetchTimeLogsForDateRange, fetchTimeLogsForUserDateRange } from './timeLogs';
import {
  type ApiTaskResponse,
  fetchUserTasksRaw,
  normalizeTaskProgress,
} from './tasks';

const INACTIVE_ARCHIVED_SENTINEL = '0001-01-01T00:00:00.000Z';

function formatLocalDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function hasMeaningfulArchivedAt(s: string | undefined): boolean {
  if (!s || typeof s !== 'string') return false;
  const d = new Date(s.trim());
  if (Number.isNaN(d.getTime())) return false;
  return d.getUTCFullYear() >= 1900;
}

function aggregateLogBoundsByTaskId(
  logs: ApiTimeLogRow[],
): Map<string, { min: string; max: string }> {
  const m = new Map<string, { min: string; max: string }>();
  for (const row of logs) {
    const d = row.date;
    if (!d) continue;
    const cur = m.get(row.taskId);
    if (!cur) m.set(row.taskId, { min: d, max: d });
    else {
      if (d < cur.min) cur.min = d;
      if (d > cur.max) cur.max = d;
    }
  }
  return m;
}

function mockTaskToCalendarRow(t: MockTask): CalendarTaskRow {
  return {
    id: t.id,
    typeName: mockTaskTypes.find((tt) => tt.id === t.typeId)?.name ?? null,
    title: t.title,
    currentProgress: t.currentProgress,
    isArchivedComplete: t.isArchived,
    createdAt: t.createdAt,
    archivedAt: t.archivedAt,
  };
}

function apiTaskToCalendarRow(
  t: ApiTaskResponse,
  fromDoneList: boolean,
  bounds: { min: string; max: string } | undefined,
  todayStr: string,
): CalendarTaskRow {
  const prog = normalizeTaskProgress(t.currentProgress);
  const apiCreated =
    typeof t.createdAt === 'string' &&
    t.createdAt.trim().length > 0 &&
    !Number.isNaN(new Date(t.createdAt).getTime());

  let createdAt: string;
  if (apiCreated) {
    createdAt = t.createdAt!.trim();
  } else if (bounds) {
    createdAt = `${bounds.min}T00:00:00`;
  } else {
    createdAt = `${todayStr}T00:00:00`;
  }

  let archivedAt: string;
  if (!fromDoneList) {
    archivedAt = INACTIVE_ARCHIVED_SENTINEL;
  } else if (hasMeaningfulArchivedAt(t.archivedAt)) {
    archivedAt = t.archivedAt!.trim();
  } else if (bounds) {
    archivedAt = `${bounds.max}T00:00:00`;
  } else {
    archivedAt = `${todayStr}T00:00:00`;
  }

  return {
    id: t.id,
    typeName: t.typeName,
    title: t.title,
    currentProgress: prog,
    isArchivedComplete: fromDoneList,
    createdAt,
    archivedAt,
  };
}

/**
 * Задачи для календаря-Ганта: активные + архив/завершённые.
 * Даты: из ответа Task (если появятся), иначе по крайним датам таймлогов за последние годы.
 */
export async function fetchCalendarTaskRows(now = new Date()): Promise<CalendarTaskRow[]> {
  if (USE_PROGRESS_MOCK) {
    const uid = await resolveDevUserId();
    if (!uid) return [];
    /** Единственная строка на id (защита от дублей в данных при тех же ключах React). */
    const byId = new Map<string, CalendarTaskRow>();
    for (const t of getDemoScopedMockTasks(uid, now).filter((x) => x.userId === uid)) {
      byId.set(t.id, mockTaskToCalendarRow(t));
    }
    return [...byId.values()];
  }

  const uid = await resolveDevUserId();
  if (!uid) return [];

  const [active, archived] = await Promise.all([
    fetchUserTasksRaw(uid, false),
    fetchUserTasksRaw(uid, true),
  ]);

  const startYear = Math.max(now.getFullYear() - 5, 2000);
  const endStr = formatLocalDateISO(now);
  const logs = await fetchTimeLogsForDateRange(`${startYear}-01-01`, endStr);
  const bounds = aggregateLogBoundsByTaskId(logs);

  const merged = new Map<string, CalendarTaskRow>();
  /** Сначала активные, затем архив — при совпадении id остаётся запись из архива. */
  for (const t of active) {
    merged.set(
      t.id,
      apiTaskToCalendarRow(t, false, bounds.get(t.id), endStr),
    );
  }
  for (const t of archived) {
    merged.set(
      t.id,
      apiTaskToCalendarRow(t, true, bounds.get(t.id), endStr),
    );
  }
  return [...merged.values()];
}

/**
 * То же, что `fetchCalendarTaskRows`, но для выбранного `viewUserId` (экран коллеги / бэк без dev user).
 */
export async function fetchCalendarTaskRowsForUser(
  viewUserId: string,
  now = new Date(),
): Promise<CalendarTaskRow[]> {
  if (USE_PROGRESS_MOCK) {
    const byId = new Map<string, CalendarTaskRow>();
    for (const t of getDemoScopedMockTasks(viewUserId, now).filter((x) => x.userId === viewUserId)) {
      byId.set(t.id, mockTaskToCalendarRow(t));
    }
    return [...byId.values()];
  }

  const [active, archived] = await Promise.all([
    fetchUserTasksRaw(viewUserId, false),
    fetchUserTasksRaw(viewUserId, true),
  ]);

  const startYear = Math.max(now.getFullYear() - 5, 2000);
  const endStr = formatLocalDateISO(now);
  const logs = await fetchTimeLogsForUserDateRange(viewUserId, `${startYear}-01-01`, endStr);
  const bounds = aggregateLogBoundsByTaskId(logs);

  const merged = new Map<string, CalendarTaskRow>();
  for (const t of active) {
    merged.set(
      t.id,
      apiTaskToCalendarRow(t, false, bounds.get(t.id), endStr),
    );
  }
  for (const t of archived) {
    merged.set(
      t.id,
      apiTaskToCalendarRow(t, true, bounds.get(t.id), endStr),
    );
  }
  return [...merged.values()];
}
