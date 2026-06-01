import type { ApiTaskResponse } from '../api/tasks';
import type { ApiDailyReflectionResponse } from '../types/dailyReflectionApi';
import { HOURS_IN_DAY, type ChartWorkloadCategory } from '../constants/charts';
import { apiTypeNameToTaskTypeLabel } from '../api/taskTypeMap';
import type { BenefitWorkloadPoint } from '../mocks/benefitWorkloadMock';
import { getDaysInMonth } from '../mocks/benefitWorkloadMock';
import type { ApiTimeLogRow } from '../types/timeLogApi';
import type { DayTimelineSegment } from '../mocks/dayTimelineMock';
import type { WeekBalanceEntry } from '../mocks/weekBalanceMock';

function isoDayPrefix(iso: string): string {
  return iso.trim().slice(0, 10);
}

function clamp05(n: number): number {
  return Math.min(5, Math.max(0, Math.round(Number(n))));
}

function parseDayInMonth(
  dateStr: string,
  year: number,
  monthIndex0: number,
): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  if (y !== year || mo !== monthIndex0) return null;
  return d;
}

/**
 * Тот же смысл, что и загрузка с сервера в `fetchBenefitWorkloadForMonth`,
 * но без HTTP: из массива рефлексий в серия для графика.
 */
export function dailyReflectionRowsToBenefitWorkloadSeries(
  rows: ApiDailyReflectionResponse[],
  userId: string,
  year: number,
  monthIndex0: number,
): BenefitWorkloadPoint[] {
  const dayCount = getDaysInMonth(year, monthIndex0);
  if (!userId || dayCount < 1) return [];

  const byDay = new Map<number, BenefitWorkloadPoint>();

  for (const row of rows) {
    if (row.userId !== userId) continue;
    const day = parseDayInMonth(row.date, year, monthIndex0);
    if (day === null || day < 1 || day > dayCount) continue;
    byDay.set(day, {
      day,
      benefit: clamp05(row.valueLevel),
      workload: clamp05(row.stressLevel),
    });
  }

  if (byDay.size === 0) return [];

  return Array.from({ length: dayCount }, (_, i) => {
    const day = i + 1;
    return byDay.get(day) ?? { day, benefit: 0, workload: 0 };
  });
}

/** Подпись типа задачи (как в task-widget) → категория графиков «Прогресс». */
export function taskTypeLabelToChartCategory(label: string): ChartWorkloadCategory {
  switch (label) {
    case 'Задачи':
      return 'task';
    case 'Обсуждения':
      return 'discussion';
    case 'Рутина':
      return 'routine';
    case 'Обучение':
      return 'education';
    case 'Прочее':
      return 'other';
    default:
      return 'other';
  }
}

/**
 * Секунды от полуночи для одних суток. Учитываются доли секунды (напр. `12:30:45.678`
 * или фрагмент ISO после `T`).
 */
function parseClockToSecondsSinceMidnight(s: string): number {
  const t = s.trim();
  let part = t;
  if (t.includes('T')) {
    const afterT = t.split('T')[1] ?? '';
    part = afterT.split(/[Z+-]/)[0]?.trim() ?? afterT;
  }
  const segments = part.split(':');
  if (segments.length < 2) return 0;
  const hh = Number(segments[0]);
  const mm = Number(segments[1]);
  const secRaw = segments.length > 2 ? segments.slice(2).join(':') : '0';
  const sec = parseFloat(secRaw.replace(/[^\d.-]/g, '')) || 0;
  if (!Number.isFinite(hh) || !Number.isFinite(mm) || !Number.isFinite(sec)) return 0;
  return hh * 3600 + mm * 60 + sec;
}

/** Длительность интервала в часах (одни сутки, end > start). Учёт по секундам, с долями. */
export function timeLogDurationHours(startTime: string, endTime: string): number {
  const a = parseClockToSecondsSinceMidnight(startTime);
  const b = parseClockToSecondsSinceMidnight(endTime);
  const d = (b - a) / 3600;
  return d > 0 && Number.isFinite(d) ? d : 0;
}

function taskCategoryForLog(log: ApiTimeLogRow, taskById: Map<string, ApiTaskResponse>): ChartWorkloadCategory {
  const task = taskById.get(String(log.taskId).toLowerCase());
  const label = apiTypeNameToTaskTypeLabel(task?.typeName);
  return taskTypeLabelToChartCategory(label);
}

export function timeLogsToDayTimelineSegments(
  logs: ApiTimeLogRow[],
  taskById: Map<string, ApiTaskResponse>,
  dayIso: string,
): DayTimelineSegment[] {
  const day = isoDayPrefix(dayIso);
  const forDay = logs
    .filter((l) => isoDayPrefix(l.date) === day)
    .sort((a, b) => parseClockToSecondsSinceMidnight(a.startTime) - parseClockToSecondsSinceMidnight(b.startTime));

  return forDay.map((log) => ({
    id: log.id,
    category: taskCategoryForLog(log, taskById),
    hours: timeLogDurationHours(log.startTime, log.endTime),
  })).filter((s) => s.hours > 0);
}

/**
 * «Хронология дня» из таймлогов: доли шкалы по числу ЗАВЕРШЁННЫХ за день задач каждого типа
 * (как и сессионный вариант `aggregateSessionCompletionsToDayTimeline`, но источник — таймлоги).
 * Завершённая за день задача = уникальная задача с таймлогом этого дня и снимком прогресса 100%.
 */
export function timeLogsToDayCompletionSegments(
  logs: ApiTimeLogRow[],
  taskById: Map<string, ApiTaskResponse>,
  dayIso: string,
): DayTimelineSegment[] {
  const day = isoDayPrefix(dayIso);
  const completedCategoryByTask = new Map<string, ChartWorkloadCategory>();
  for (const log of logs) {
    if (isoDayPrefix(log.date) !== day) continue;
    const snap = typeof log.progressSnapshot === 'number' ? log.progressSnapshot : Number(log.progressSnapshot);
    if (snap !== 100) continue;
    const taskKey = String(log.taskId).toLowerCase();
    if (!completedCategoryByTask.has(taskKey)) {
      completedCategoryByTask.set(taskKey, taskCategoryForLog(log, taskById));
    }
  }
  const total = completedCategoryByTask.size;
  if (total === 0) return [];

  const byCat = new Map<ChartWorkloadCategory, number>();
  for (const cat of completedCategoryByTask.values()) {
    byCat.set(cat, (byCat.get(cat) ?? 0) + 1);
  }

  const out: DayTimelineSegment[] = [];
  for (const cat of DAY_TIMELINE_CATEGORY_ORDER) {
    const n = byCat.get(cat) ?? 0;
    if (n === 0) continue;
    out.push({
      id: `day-${day}-${cat}`,
      category: cat,
      hours: (n / total) * HOURS_IN_DAY,
      completedInCategory: n,
      completedDayTotal: total,
    });
  }
  return out;
}

/**
 * Протягивает суммарную длительность сегментов до суток (как распределение «Хронология дня» по завершённым задачам),
 * сохраняя пропорции миксов категорий — нужно для просмотра коллеги по таймлогам.
 */
export function stretchDayTimelineSegmentsToFullDay(segments: DayTimelineSegment[]): DayTimelineSegment[] {
  const raw = segments.reduce((sum, s) => sum + s.hours, 0);
  if (raw <= 0 || !Number.isFinite(raw)) return [];
  const factor = HOURS_IN_DAY / raw;
  return segments.map((s) => ({
    ...s,
    hours: s.hours * factor,
    completedInCategory: undefined,
    completedDayTotal: undefined,
  }));
}

export function timeLogsToWeekBalanceEntries(
  logs: ApiTimeLogRow[],
  taskById: Map<string, ApiTaskResponse>,
  weekStartIso: string,
  weekEndIso: string,
): WeekBalanceEntry[] {
  const start = isoDayPrefix(weekStartIso);
  const end = isoDayPrefix(weekEndIso);
  const totals = new Map<ChartWorkloadCategory, number>();

  for (const log of logs) {
    const d = isoDayPrefix(log.date);
    if (d < start || d > end) continue;
    const cat = taskCategoryForLog(log, taskById);
    const h = timeLogDurationHours(log.startTime, log.endTime);
    if (h <= 0) continue;
    totals.set(cat, (totals.get(cat) ?? 0) + h);
  }

  const out: WeekBalanceEntry[] = [];
  for (const [category, hours] of totals) {
    if (hours > 0) out.push({ category, hours });
  }
  return out;
}

export function mondayOfWeekLocal(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dw = x.getDay();
  const diff = dw === 0 ? -6 : 1 - dw;
  x.setDate(x.getDate() + diff);
  return x;
}

export function formatLocalDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Понедельник…воскресенье текущей календарной недели (локальное время). */
export function calendarWeekBoundsLocal(now: Date): { start: string; end: string } {
  const mon = mondayOfWeekLocal(now);
  const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
  return { start: formatLocalDateIso(mon), end: formatLocalDateIso(sun) };
}

/** Порядок полосок на «Хронологии дня» (по выполненным задачам). */
const DAY_TIMELINE_CATEGORY_ORDER: ChartWorkloadCategory[] = [
  'task',
  'discussion',
  'routine',
  'education',
  'other',
];

/**
 * Доли полосы по числу **выполненных сегодня** задач каждого типа (сумма «весов» = сутки).
 */
export function aggregateSessionCompletionsToDayTimeline(
  records: { dateIso: string; category: ChartWorkloadCategory }[],
  todayIso: string,
): DayTimelineSegment[] {
  const day = isoDayPrefix(todayIso);
  const today = records.filter((r) => isoDayPrefix(r.dateIso) === day);
  if (today.length === 0) return [];

  const byCat = new Map<ChartWorkloadCategory, number>();
  for (const r of today) {
    byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1);
  }
  const total = today.length;
  const out: DayTimelineSegment[] = [];
  for (const cat of DAY_TIMELINE_CATEGORY_ORDER) {
    const n = byCat.get(cat) ?? 0;
    if (n === 0) continue;
    out.push({
      id: `day-${day}-${cat}`,
      category: cat,
      hours: (n / total) * HOURS_IN_DAY,
      completedInCategory: n,
      completedDayTotal: total,
    });
  }
  return out;
}

/**
 * Распределение **числа выполненных за календарную неделю** задач по категориям (как «Хронология дня»).
 */
export function aggregateSessionCompletionsToWeekBalance(
  records: { dateIso: string; category: ChartWorkloadCategory }[],
  weekStartIso: string,
  weekEndIso: string,
): WeekBalanceEntry[] {
  const start = isoDayPrefix(weekStartIso);
  const end = isoDayPrefix(weekEndIso);
  const inWeek = records.filter((r) => {
    const d = isoDayPrefix(r.dateIso);
    return d >= start && d <= end;
  });
  if (inWeek.length === 0) return [];

  const byCat = new Map<ChartWorkloadCategory, number>();
  for (const r of inWeek) {
    byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1);
  }

  const out: WeekBalanceEntry[] = [];
  for (const cat of DAY_TIMELINE_CATEGORY_ORDER) {
    const n = byCat.get(cat) ?? 0;
    if (n > 0) {
      out.push({ category: cat, hours: n, valueUnit: 'tasks' });
    }
  }
  return out;
}

/** Отображение суммарных часов из таймлогов: без потери смысла секунд (до ~мс, лишние нули убираются). */
export function formatTimeLoggedHoursForDisplay(hours: number): string {
  if (!Number.isFinite(hours)) return '0';
  const s = hours.toFixed(6).replace(/\.?0+$/, '');
  return s === '' ? '0' : s;
}
