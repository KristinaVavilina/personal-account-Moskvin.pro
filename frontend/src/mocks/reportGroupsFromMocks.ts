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

function formatTimeRange(start: string, end: string): string {
  const hhmm = (t: string) => t.slice(0, 5);
  return `${hhmm(start)} - ${hhmm(end)}`;
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
