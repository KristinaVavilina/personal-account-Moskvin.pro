import { apiTypeNameToTaskTypeLabel } from '../api/taskTypeMap';
import { monthBoundsIso } from '../api/timeLogs';
import type { GanttTask, TaskCategory } from '../constants';
import type { ApiTimeLogRow } from '../types/timeLogApi';

/**
 * Данные задачи для Ганта календаря (мок или API + восстановление дат по таймлогам).
 */
export interface CalendarTaskRow {
  id: string;
  typeName?: string | null;
  title: string;
  currentProgress: number;
  /** Закрытая задача (архив / завершена) — полоса до даты конца, прогресс 100 % в UI. */
  isArchivedComplete: boolean;
  createdAt: string;
  archivedAt: string;
}

/**
 * Полосы: от локального дня начала задачи до архивации (завершённые) или до «сегодня» (идут).
 * Если задача создана до видимого месяца: старт по первому таймлогу месяца, иначе с 1-го числа (активные).
 * Завершённые: сегмент в каждом пересекаемом месяце (обрезка по видимым границам).
 * Задач с датой создания после today нет.
 */

function parseArchivedEnd(archivedAt: string): Date | null {
  const d = new Date(archivedAt);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getUTCFullYear() < 1900) return null;
  return d;
}

function localMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function typeNameToCategory(typeName: string | null | undefined): TaskCategory {
  const label = apiTypeNameToTaskTypeLabel(typeName);
  if (label === 'Задачи') return 'task';
  if (label === 'Обсуждения') return 'discussion';
  if (label === 'Обучение') return 'education';
  if (label === 'Рутина') return 'routine';
  return 'other';
}

/**
 * Первая дата таймлога задачи в пределах видимого календарного месяца.
 */
function earliestTaskLogDayInMonth(
  logs: ApiTimeLogRow[],
  taskId: string,
  monthFirstIso: string,
  monthLastIso: string,
): Date | undefined {
  let best: string | undefined;
  for (const row of logs) {
    if (row.taskId !== taskId) continue;
    const d = row.date.slice(0, 10);
    if (d < monthFirstIso || d > monthLastIso) continue;
    if (!best || d < best) best = d;
  }
  if (!best) return undefined;
  return localMidnight(new Date(`${best}T12:00:00`));
}


/** Пересечение [taskStart; taskEnd] с сеткой месяца; null — нет полосы в этом месяце. */
function monthBarRange(
  taskStartDay: Date,
  taskEndDay: Date,
  year: number,
  monthIndex: number,
  totalDays: number,
): { start: number; end: number } | null {
  const monthFirst = new Date(year, monthIndex, 1);
  const monthLast = new Date(year, monthIndex, totalDays);

  if (taskEndDay < monthFirst || taskStartDay > monthLast) return null;

  const start = taskStartDay < monthFirst ? 1 : taskStartDay.getDate();
  const end = taskEndDay > monthLast ? totalDays : taskEndDay.getDate();

  const s = Math.min(Math.max(1, start), totalDays);
  const e = Math.min(Math.max(1, end), totalDays);
  if (e < s) return null;
  return { start: s, end: e };
}

function toGanttTask(
  t: CalendarTaskRow,
  year: number,
  monthIndex: number,
  totalDays: number,
  now: Date,
  logsInVisibleMonth?: ApiTimeLogRow[],
): GanttTask | null {
  const created = new Date(t.createdAt);
  let taskStartDay = localMidnight(created);
  const todayStart = localMidnight(now);

  if (taskStartDay > todayStart) return null;

  const viewMonthStart = localMidnight(new Date(year, monthIndex, 1));
  const nowMonthStart = localMidnight(new Date(now.getFullYear(), now.getMonth(), 1));
  const viewingStrictlyPastCalendarMonth =
    viewMonthStart.getTime() < nowMonthStart.getTime();

  /** В прошлом месяце не показываем текущие (незавершённые) задачи — только архив того месяца. */
  if (viewingStrictlyPastCalendarMonth && !t.isArchivedComplete) {
    return null;
  }

  const archParsed = parseArchivedEnd(t.archivedAt);

  /**
   * Создана до этого месяца: если есть первый таймлог в месяце — старт по нему; иначе старт с 1-го числа
   * (полоса «продолжения» уже идущей задачи без учёта в этом месяце).
   */
  if (logsInVisibleMonth !== undefined) {
    const monthFirstDay = localMidnight(new Date(year, monthIndex, 1));
    const { start: mfIso, end: mlIso } = monthBoundsIso(year, monthIndex);
    if (taskStartDay < monthFirstDay) {
      const hit = earliestTaskLogDayInMonth(logsInVisibleMonth, t.id, mfIso, mlIso);
      if (hit) taskStartDay = hit;
      else if (!t.isArchivedComplete) taskStartDay = monthFirstDay;
    }
  }

  let taskEndDay = archParsed ? localMidnight(archParsed) : todayStart;
  if (taskEndDay > todayStart) taskEndDay = todayStart;

  if (taskEndDay < taskStartDay) return null;

  const range = monthBarRange(taskStartDay, taskEndDay, year, monthIndex, totalDays);
  if (!range) return null;

  const progress = t.isArchivedComplete ? 100 : t.currentProgress;

  return {
    id: t.id,
    name: t.title,
    category: typeNameToCategory(t.typeName),
    start: range.start,
    end: range.end,
    progress,
  };
}

function getDaysInMonth(monthIndex: number, year: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * `logsInVisibleMonth` — таймлоги только за видимый календарный месяц; если передан массив (даже []),
 * старт задач, созданных раньше этого месяца: по первому логу в месяце или с 1-го числа (активные).
 */
export function buildGanttTasksFromCalendarRows(
  rows: CalendarTaskRow[],
  year: number,
  monthIndex: number,
  now: Date = new Date(),
  logsInVisibleMonth?: ApiTimeLogRow[],
): GanttTask[] {
  const totalDays = getDaysInMonth(monthIndex, year);
  const out: GanttTask[] = [];
  for (const t of rows) {
    const row = toGanttTask(t, year, monthIndex, totalDays, now, logsInVisibleMonth);
    if (row) out.push(row);
  }
  out.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return a.name.localeCompare(b.name, 'ru');
  });
  return out;
}
