import type { ApiTimeLogRow } from '../types/timeLogApi';
import type { StoredReportEntry } from '../types/reportEntry';
import { formatReportCalendarDate } from '../utils/reportCalendarLabel';
import { monthBoundsIso } from '../api/timeLogs';
import { mockTasks } from './apiMockData';
import {
  getMockApiTimeLogsInRange,
  PROGRESS_MOCK_DEFAULT_USER_ID,
} from './progressDashboardMock';

export type { ApiTimeLogRow };

export interface ReportWidgetItem {
  id: string;
  title: string;
  text: string;
  badge: string;
  time: string;
  /** Только для записей из локального стора — по клику открывается редактирование. */
  editable?: boolean;
}

export interface ReportWidgetGroup {
  id: string;
  date: string;
  items: ReportWidgetItem[];
}

function formatTimePart(t: string): string {
  const s = t.trim();
  if (s.includes('T')) {
    const part = s.split('T')[1]?.slice(0, 5);
    return part && part.length >= 5 ? part : '00:00';
  }
  return s.slice(0, 5);
}

function formatTimeRange(start: string, end: string): string {
  return `${formatTimePart(start)} - ${formatTimePart(end)}`;
}

/** Объединение ответа API и локально сохранённых таймлогов за интервал [monthStart, monthEnd]. Локальные id перекрывают совпадения. */
export function mergeMonthApiTimeLogsWithLocal(
  apiLogs: ApiTimeLogRow[],
  localEntries: StoredReportEntry[],
  monthStart: string,
  monthEnd: string,
): Array<ApiTimeLogRow | StoredReportEntry> {
  const start = monthStart.slice(0, 10);
  const end = monthEnd.slice(0, 10);
  const inMonth = (d: string) => {
    const k = d.slice(0, 10);
    return k >= start && k <= end;
  };
  const localInMonth = localEntries.filter((e) => inMonth(e.date));
  const byId = new Map<string, ApiTimeLogRow | StoredReportEntry>();
  for (const l of apiLogs) {
    if (inMonth(l.date)) byId.set(l.id, l);
  }
  for (const l of localInMonth) {
    byId.set(l.id, l);
  }
  return [...byId.values()];
}

function logTitle(log: ApiTimeLogRow | StoredReportEntry, titleByTaskId: Map<string, string>): string {
  const s = log as StoredReportEntry;
  if (s.taskTitle?.trim()) return s.taskTitle.trim();
  return titleByTaskId.get(log.taskId) ?? log.taskId;
}

export function buildReportGroupsFromApiLogs(
  logs: Array<ApiTimeLogRow | StoredReportEntry>,
  localEntryIds: Set<string>,
  /** Подстановка заголовков (например с GET /api/Task/user/…) поверх имен из общих mockTasks. */
  extraTaskTitles?: Map<string, string>,
): ReportWidgetGroup[] {
  const titleByTaskId = new Map(mockTasks.map((t) => [t.id, t.title]));
  if (extraTaskTitles) {
    for (const [id, title] of extraTaskTitles) {
      titleByTaskId.set(id, title);
    }
  }
  const byDate = new Map<string, Array<ApiTimeLogRow | StoredReportEntry>>();
  for (const log of logs) {
    const key = log.date.slice(0, 10);
    const list = byDate.get(key) ?? [];
    list.push(log);
    byDate.set(key, list);
  }
  const dates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));
  return dates.map((date) => ({
    id: date,
    date: formatReportCalendarDate(date),
    items: (byDate.get(date) ?? []).map((log) => {
      const progress = log.progressSnapshot ?? 0;
      return {
        id: log.id,
        title: logTitle(log, titleByTaskId),
        text: log.comment?.trim() ? log.comment.trim() : 'Комментарий не указан.',
        badge: `Выполнено: ${progress}%`,
        time: formatTimeRange(log.startTime, log.endTime),
        editable: localEntryIds.has(log.id),
      };
    }),
  }));
}

/** Группы по офлайн-мокам за текущий месяц (те же данные, что при USE_PROGRESS_MOCK для TimeLog). */
export function getReportGroupsFromMocks(): ReportWidgetGroup[] {
  const d = new Date();
  const { start, end } = monthBoundsIso(d.getFullYear(), d.getMonth());
  const logs = getMockApiTimeLogsInRange(PROGRESS_MOCK_DEFAULT_USER_ID, start, end, d);
  return buildReportGroupsFromApiLogs(logs, new Set());
}
