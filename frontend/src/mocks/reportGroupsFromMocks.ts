import { mockTasks, mockTimeLogs } from './apiMockData';

export interface ReportWidgetItem {
  id: string;
  title: string;
  text: string;
  badge: string;
  time: string;
}

export interface ReportWidgetGroup {
  id: string;
  date: string;
  items: ReportWidgetItem[];
}

const MONTHS_SHORT_GEN: Record<number, string> = {
  1: 'янв.',
  2: 'февр.',
  3: 'мар.',
  4: 'апр.',
  5: 'мая',
  6: 'июн.',
  7: 'июл.',
  8: 'авг.',
  9: 'сент.',
  10: 'окт.',
  11: 'нояб.',
  12: 'дек.',
};

function formatReportDate(iso: string): string {
  const [ys, ms, ds] = iso.split('-');
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  const monthLabel = MONTHS_SHORT_GEN[m] ?? ms;
  return `${d} ${monthLabel} ${y}`;
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

/** Ответ API TimeLog (camelCase). */
export interface ApiTimeLogRow {
  id: string;
  taskId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  progressSnapshot?: number | null;
  comment?: string | null;
}

/** Группы по дате из таймлогов API; заголовок — id задачи (временно). */
export function buildReportGroupsFromApiLogs(logs: ApiTimeLogRow[]): ReportWidgetGroup[] {
  const byDate = new Map<string, ApiTimeLogRow[]>();
  for (const log of logs) {
    const key = log.date.slice(0, 10);
    const list = byDate.get(key) ?? [];
    list.push(log);
    byDate.set(key, list);
  }
  const dates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));
  return dates.map((date) => ({
    id: date,
    date: formatReportDate(date),
    items: (byDate.get(date) ?? []).map((log) => {
      const progress = log.progressSnapshot ?? 0;
      return {
        id: log.id,
        title: log.taskId,
        text: log.comment?.trim() ? log.comment.trim() : 'Комментарий не указан.',
        badge: `Выполнено: ${progress}%`,
        time: formatTimeRange(log.startTime, log.endTime),
      };
    }),
  }));
}

/** Группы по дате (сначала более новые дни), элементы — записи учёта времени из моков */
export function getReportGroupsFromMocks(): ReportWidgetGroup[] {
  const taskById = new Map(mockTasks.map((t) => [t.id, t]));
  const byDate = new Map<string, typeof mockTimeLogs>();

  for (const log of mockTimeLogs) {
    const list = byDate.get(log.date) ?? [];
    list.push(log);
    byDate.set(log.date, list);
  }

  const dates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));

  return dates.map((date) => ({
    id: date,
    date: formatReportDate(date),
    items: (byDate.get(date) ?? []).map((log) => {
      const task = taskById.get(log.taskId);
      const progress = log.progressSnapshot ?? task?.currentProgress ?? 0;
      return {
        id: log.id,
        title: task?.title ?? 'Задача',
        text: log.comment?.trim() ? log.comment.trim() : 'Комментарий не указан.',
        badge: `Выполнено: ${progress}%`,
        time: formatTimeRange(log.startTime, log.endTime),
      };
    }),
  }));
}
