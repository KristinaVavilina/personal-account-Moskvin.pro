import type { ApiTaskResponse } from '../api/tasks';
import { apiTypeNameToTaskTypeLabel } from '../api/taskTypeMap';
import type { ChartWorkloadCategory } from '../constants/charts';
import type { DayTimelineCompletionRecord } from '../store/useDayTimelineCompletionsStore';
import { createMockBenefitWorkloadForMonth } from './benefitWorkloadMock';
import { mockTaskTypes, mockTasks, MOCK_CATALOG_USER_IDS, TaskProgressEnum, type MockTask } from './apiMockData';
import type { ApiDailyReflectionResponse } from '../types/dailyReflectionApi';
import type { ApiTimeLogRow } from '../types/timeLogApi';
import {
  calendarWeekBoundsLocal,
  formatLocalDateIso,
  taskTypeLabelToChartCategory,
} from '../utils/progressDashboardTransform';

export { PROGRESS_MOCK_DEFAULT_USER_ID } from '../config';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function mockReflectionId(year: number, monthIndex0: number, day: number): string {
  const n = year * 400 + monthIndex0 * 40 + day;
  const hex = n.toString(16).padStart(12, '0').slice(-12);
  return `f6000000-0000-4000-8000-${hex}`;
}

function timeLogUuid(sequence: number): string {
  const tail = (0xd40000000000 + sequence).toString(16).padStart(12, '0').slice(-12);
  return `d4000000-0000-4000-8000-${tail}`;
}

/** Дата YYYY-MM-DD по локальному календарю (день обрезается к последнему в месяце). */
function dateIsoLocal(year: number, monthIndex0: number, day: number): string {
  const capped = Math.min(day, new Date(year, monthIndex0 + 1, 0).getDate());
  return `${year}-${pad2(monthIndex0 + 1)}-${pad2(capped)}`;
}


function nextMonthYear(y: number, monthIndex0: number): { ny: number; nm0: number } {
  if (monthIndex0 === 11) return { ny: y + 1, nm0: 0 };
  return { ny: y, nm0: monthIndex0 + 1 };
}

function monthCalendarAtOffset(now: Date, monthsAgo: number): { y: number; m0: number } {
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  return { y: d.getFullYear(), m0: d.getMonth() };
}

function lastDayOfMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

type DemoArchRecipe =
  | { k: 'slice'; mAgo: number; d0: number; d1: number }
  | { k: 'span'; sMago: number; eMago: number; d0: number; d1: number }
  | { k: 'intoNext'; d0: number; d1: number };

/**
 * Порядок как у завершённых задач в `mockTasks` после активных (10 шт.).
 * Разнообразие: один месяц, сквозные интервалы между месяцами, архив в следующем месяце.
 */
const DEMO_ARCHIVED_RECIPES = [
  { k: 'span', sMago: 1, eMago: 0, d0: 22, d1: 18 },
  { k: 'intoNext', d0: 7, d1: 14 },
  { k: 'slice', mAgo: 4, d0: 15, d1: 23 },
  { k: 'slice', mAgo: 3, d0: 2, d1: 11 },
  { k: 'slice', mAgo: 5, d0: 20, d1: 28 },
  { k: 'span', sMago: 4, eMago: 2, d0: 5, d1: 25 },
  { k: 'span', sMago: 3, eMago: 0, d0: 8, d1: 16 },
  { k: 'slice', mAgo: 2, d0: 1, d1: 19 },
  { k: 'slice', mAgo: 1, d0: 12, d1: 27 },
  { k: 'slice', mAgo: 0, d0: 3, d1: 20 },
] as const satisfies readonly DemoArchRecipe[];

function demoArchivedTimestamps(now: Date, r: DemoArchRecipe): { createdAt: string; archivedAt: string } {
  const tailC = 'T10:00:00.000Z';
  const tailA = 'T17:00:00.000Z';
  if (r.k === 'slice') {
    const { y, m0 } = monthCalendarAtOffset(now, r.mAgo);
    const ld = lastDayOfMonth(y, m0);
    let d0 = Math.min(r.d0, ld);
    let d1 = Math.min(r.d1, ld);
    if (d1 < d0) [d0, d1] = [d1, d0];
    return {
      createdAt: `${dateIsoLocal(y, m0, d0)}${tailC}`,
      archivedAt: `${dateIsoLocal(y, m0, d1)}${tailA}`,
    };
  }
  if (r.k === 'span') {
    const S = monthCalendarAtOffset(now, r.sMago);
    const E = monthCalendarAtOffset(now, r.eMago);
    const sd = Math.min(r.d0, lastDayOfMonth(S.y, S.m0));
    const ed = Math.min(r.d1, lastDayOfMonth(E.y, E.m0));
    return {
      createdAt: `${dateIsoLocal(S.y, S.m0, sd)}${tailC}`,
      archivedAt: `${dateIsoLocal(E.y, E.m0, ed)}${tailA}`,
    };
  }
  const { y, m0 } = monthCalendarAtOffset(now, 0);
  const { ny, nm0 } = nextMonthYear(y, m0);
  const sd = Math.min(r.d0, lastDayOfMonth(y, m0));
  const ed = Math.min(r.d1, lastDayOfMonth(ny, nm0));
  return {
    createdAt: `${dateIsoLocal(y, m0, sd)}${tailC}`,
    archivedAt: `${dateIsoLocal(ny, nm0, ed)}${tailA}`,
  };
}

const DEMO_CALENDAR_DATE_USERS = new Set<string>(MOCK_CATALOG_USER_IDS);

/**
 * Копия `mockTasks`: для каталоговых демо-пользователей пересчитывает `createdAt` / `archivedAt`
 * относительно `now` по задачам с `task.userId === userId`.
 */
export function getDemoScopedMockTasks(userId: string, now = new Date()): MockTask[] {
  const applyDemoDates = DEMO_CALENDAR_DATE_USERS.has(userId);

  let archivedRecipeIndex = 0;
  let activeIndex = 0;

  return mockTasks.map((t) => {
    if (!applyDemoDates || t.userId !== userId) {
      return { ...t };
    }

    const isArchivedComplete =
      t.isArchived && t.currentProgress === TaskProgressEnum.Completed;

    if (!isArchivedComplete) {
      const monthsBack = (activeIndex % 6) + 1;
      activeIndex += 1;
      const { y, m0 } = monthCalendarAtOffset(now, monthsBack);
      const ld = lastDayOfMonth(y, m0);
      const day = Math.min(ld, Math.max(1, 2 + ((activeIndex * 11) % ld)));
      return {
        ...t,
        createdAt: `${dateIsoLocal(y, m0, day)}T09:30:00.000Z`,
      };
    }

    const recipe = DEMO_ARCHIVED_RECIPES[archivedRecipeIndex % DEMO_ARCHIVED_RECIPES.length];
    archivedRecipeIndex += 1;
    return { ...t, ...demoArchivedTimestamps(now, recipe) };
  });
}

const DEMO_FILL_CATEGORIES: readonly ChartWorkloadCategory[] = [
  'task',
  'discussion',
  'routine',
  'education',
  'other',
];

function ensureDemoCompletionsToday(
  userId: string,
  now: Date,
  base: DayTimelineCompletionRecord[],
): DayTimelineCompletionRecord[] {
  const todayDay = formatLocalDateIso(now).slice(0, 10);
  if (base.some((r) => r.dateIso.slice(0, 10) === todayDay)) return base;

  const seed = mockSpreadSeed([userId, todayDay]);
  const n = 2 + (seed % 4);
  const extra: DayTimelineCompletionRecord[] = [];
  for (let i = 0; i < n; i++) {
    extra.push({
      id: `mock-tl-today-${userId}-${i}`,
      dateIso: formatLocalDateIso(now),
      category: DEMO_FILL_CATEGORIES[(seed + i * 19) % DEMO_FILL_CATEGORIES.length]!,
    });
  }
  return [...base, ...extra];
}

/**
 * События «завершил задачу» из демо-задач (дата архивации и тип задачи): тот же смысл, что записи в
 * `useDayTimelineCompletionsStore` на странице «Прогресс» для `aggregateSessionCompletionsTo*`.
 */
export function getMockTimelineCompletionRecordsForUser(
  userId: string,
  now = new Date(),
): DayTimelineCompletionRecord[] {
  const tasks = getDemoScopedMockTasks(userId, now);
  const out: DayTimelineCompletionRecord[] = [];
  let seq = 0;
  for (const t of tasks) {
    if (t.userId !== userId) continue;
    if (!(t.isArchived && t.currentProgress === TaskProgressEnum.Completed)) continue;

    const arch = t.archivedAt?.trim();
    if (!arch || arch.startsWith('0001-01-01')) continue;
    const d = new Date(arch);
    if (Number.isNaN(d.getTime())) continue;

    const typeName = mockTaskTypes.find((tt) => tt.id === t.typeId)?.name ?? '';
    const category = taskTypeLabelToChartCategory(apiTypeNameToTaskTypeLabel(typeName));

    out.push({
      id: `mock-tl-${userId}-${seq++}`,
      dateIso: formatLocalDateIso(d),
      category,
    });
  }
  return ensureDemoCompletionsToday(userId, now, out);
}

function mockSpreadSeed(strings: readonly string[]): number {
  let h = 5381 >>> 0;
  for (const part of strings) {
    for (let i = 0; i < part.length; i++) {
      h = (Math.imul(h, 31) >>> 0) + part.charCodeAt(i);
    }
    h >>>= 0;
  }
  return h >>> 0;
}

function seededRange(seed: number, salt: number, maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  const x = (Math.imul(seed ^ salt, 2654435761) >>> 0) % maxExclusive;
  return x as number;
}

/** Рефлексии в форме ответа API (как `GET /api/DailyReflection`). */
export function getMockDailyReflectionRowsForMonth(
  year: number,
  monthIndex0: number,
  userId: string,
): ApiDailyReflectionResponse[] {
  const points = createMockBenefitWorkloadForMonth(year, monthIndex0, userId);
  return points.map((p) => ({
    id: mockReflectionId(year, monthIndex0, p.day),
    userId,
    date: `${year}-${pad2(monthIndex0 + 1)}-${pad2(p.day)}`,
    stressLevel: p.workload,
    valueLevel: p.benefit,
  }));
}

function mockTaskToApiRow(t: MockTask): ApiTaskResponse {
  const typeRow = mockTaskTypes.find((tt) => tt.id === t.typeId);
  return {
    id: t.id,
    userId: t.userId,
    typeName: typeRow?.name ?? null,
    title: t.title,
    description: t.description,
    /** Как с бэка: enum сериализуется числом */
    currentProgress: t.currentProgress,
  };
}

/**
 * Задачи пользователя в форме `TaskResponse` (как GET /api/Task/user/...).
 * `isArchived` — опциональный фильтр, как у query `?isArchived=`.
 */
export function getMockUserTasksApi(
  userId: string,
  isArchived?: boolean,
  now = new Date(),
): ApiTaskResponse[] {
  const tasks = getDemoScopedMockTasks(userId, now);
  return tasks
    .filter((t) => {
      if (t.userId !== userId) return false;
      if (isArchived === undefined) return true;
      /* Как на бэке: «активные» без завершённых; архив — явный флаг или прогресс 100 %. */
      if (isArchived === false) {
        return !t.isArchived && t.currentProgress !== TaskProgressEnum.Completed;
      }
      if (isArchived === true) {
        return t.isArchived || t.currentProgress === TaskProgressEnum.Completed;
      }
      return t.isArchived === isArchived;
    })
    .map(mockTaskToApiRow);
}

/**
 * Таймлоги за календарный месяц: по одному интервалу на активную задачу, даты в пределах месяца,
 * время в формате `HH:mm:ss[.fff]` как у TimeOnly на бэке.
 */
function clockFromMinuteOfDay(mins: number): string {
  const m = Math.max(0, Math.min(mins, 24 * 60 - 1));
  const h = Math.floor(m / 60);
  const min = Math.floor(m % 60);
  const secPick = seededRange(m * 997, h ^ min, 50);
  if (secPick < 17) return `${pad2(h)}:${pad2(min)}:${pad2(secPick)}.375`;
  return `${pad2(h)}:${pad2(min)}:${pad2(seededRange(secPick, mins, 55))}`;
}

/** Развернутые комментарии для просмотра отчётов и демонстрационного GET TimeLog в моках. */
const REPORT_TIME_LOG_COMMENT_PRESETS = [
  'Учёт интервала: зафиксированы временные блоки под сводную отчётность руководителя.',
  'Краткая фиксация: синхронизация статусов и приоритетов на вторую половину дня.',
  'Работа по задаче: код-ревью, поправлены замечания по именованию и границам модулей.',
  'Коммуникации: созвон с заказчиком, согласованы два следующих этапа и критерии приёмки.',
  'Подготовка демонстрации: собран скринкаст сценариев и короткий чеклист для тестирования.',
  'Анализ: разбор логов API, найдены повторяющиеся ошибки валидации и место узкого фильтра.',
  'Рефакторинг без смены поведения: вынесены повторяющиеся условия в общий слой утилит.',
  'Документация: обновлены инструкции по конфигурации деплоя и переменные окружения для QA.',
  'Тестирование: регресс по авторизации после смены политики пароля; зафиксированы пробелы.',
  'Поддержка: разбор тикетов после релиза, ответ клиенту с временным обходным сценарием.',
  'Планирование: оценка трудозатрат на следующий спринт и уточнение зависимостей задач.',
  'Исследование: прототип интеграции с третьей стороной, зафиксированы ограничения Sandbox.',
] as const;

/** Несколько интервалов на задачу, дни и время разносятся по `userId` — для календаря и хронологии. */
export function buildApiTimeLogsForMonth(
  userId: string,
  year: number,
  monthIndex0: number,
  tasks: MockTask[],
  now = new Date(),
): ApiTimeLogRow[] {
  const active = tasks.filter(
    (t) =>
      t.userId === userId &&
      !t.isArchived &&
      t.currentProgress !== TaskProgressEnum.Completed,
  );
  const lastDay = new Date(year, monthIndex0 + 1, 0).getDate();
  const out: ApiTimeLogRow[] = [];
  if (lastDay < 1) return out;

  const seedBase = mockSpreadSeed([userId, `${year}-${monthIndex0 + 1}`, tasks.length.toString()]);
  const inThisMonth = now.getFullYear() === year && now.getMonth() === monthIndex0;
  const todayDom = inThisMonth ? now.getDate() : -1;

  let seq = 0;
  for (let ti = 0; ti < active.length; ti++) {
    const t = active[ti];
    const chunkCount = 1 + seededRange(seedBase, ti * 131071 + 9176, 4);
    for (let j = 0; j < chunkCount; j++) {
      const salt = seedBase ^ (ti * 524287 + j * 12289);

      let dayPick = 1 + seededRange(salt + 809, ti * j + j, lastDay);

      const roll = seededRange(salt + 40111, ti + j + 701, 100);
      if (inThisMonth && todayDom > 0) {
        if (roll < 38) dayPick = Math.min(Math.max(todayDom, 1), lastDay);
        else if (roll < 55) {
          dayPick = Math.min(Math.max(todayDom - 1 + (seededRange(salt + 903, ti, 3) - 1), 1), lastDay);
        }
      }
      dayPick = Math.min(Math.max(1, dayPick), lastDay);
      const date = `${year}-${pad2(monthIndex0 + 1)}-${pad2(dayPick)}`;

      const lastMinuteAllowed = 23 * 60 + 55;

      const durMinRaw = 40 + seededRange(salt + 2203, seq * 59, 200);
      const durMin = Math.max(40, durMinRaw);

      const earliest = 8 * 60 + seededRange(seedBase ^ salt, ti * 997 + seq, 90);
      const latestStartHard = Math.min(21 * 60 + 30, lastMinuteAllowed - durMin - 24);
      if (latestStartHard <= earliest + 44) continue;

      const spanExclusive = Math.max(1, latestStartHard - earliest + 62);
      let startMin =
        earliest +
        seededRange(salt ^ seedBase ^ dayPick * 131, ti * seq + j * 4001 + dayPick, spanExclusive);
      startMin = Math.min(Math.max(earliest, startMin), latestStartHard);

      let endMin = startMin + durMin;
      if (endMin > lastMinuteAllowed) {
        startMin = Math.max(earliest, lastMinuteAllowed - durMin - 12);
        endMin = startMin + durMin;
      }

      endMin = Math.min(endMin, lastMinuteAllowed);
      if (endMin <= startMin + 34) continue;

      const startTime = clockFromMinuteOfDay(startMin);
      const endTime = clockFromMinuteOfDay(endMin);

      let comment: string | null = null;
      const presetPick = seededRange(salt, seq * 701, 100);
      if (presetPick < 88) {
        const idx = seededRange(
          salt ^ seq * 997,
          presetPick * 503,
          REPORT_TIME_LOG_COMMENT_PRESETS.length,
        );
        comment = REPORT_TIME_LOG_COMMENT_PRESETS[idx]!;
      }

      out.push({
        id: timeLogUuid(seq),
        taskId: t.id,
        userId,
        date,
        startTime,
        endTime,
        progressSnapshot: t.currentProgress,
        comment,
      });
      seq += 1;
    }
  }
  return out;
}

function monthsCoveringRange(startIso: string, endIso: string): Array<{ y: number; m: number }> {
  const result: Array<{ y: number; m: number }> = [];
  const ys = startIso.slice(0, 10);
  const ye = endIso.slice(0, 10);
  if (!ys || !ye || ys > ye) return result;

  let y = Number(ys.slice(0, 4));
  let m = Number(ys.slice(5, 7)) - 1;
  const endY = Number(ye.slice(0, 4));
  const endM = Number(ye.slice(5, 7)) - 1;

  while (y < endY || (y === endY && m <= endM)) {
    result.push({ y, m });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return result;
}

/** Таймлоги в форме API за диапазон дат (DateOnly), как GET /api/TimeLog/user/... */
export function getMockApiTimeLogsInRange(
  userId: string,
  startDate: string,
  endDate: string,
  now = new Date(),
): ApiTimeLogRow[] {
  const tasks = getDemoScopedMockTasks(userId, now);
  const start = startDate.slice(0, 10);
  const end = endDate.slice(0, 10);
  const all: ApiTimeLogRow[] = [];
  for (const { y, m } of monthsCoveringRange(start, end)) {
    all.push(...buildApiTimeLogsForMonth(userId, y, m, tasks, now));
  }
  return all.filter((log) => {
    const d = log.date.slice(0, 10);
    return d >= start && d <= end;
  });
}

/**
 * Логи за текущую календарную неделю (для проверок преобразований таймлогов).
 */
export function getMockTimeLogsForProgressCharts(userId: string, now = new Date()): ApiTimeLogRow[] {
  const { start, end } = calendarWeekBoundsLocal(now);
  return getMockApiTimeLogsInRange(userId, start, end, now);
}

function archivedDateInMonth(iso: string, year: number, monthIndex0: number): boolean {
  const m = /^(\d{4})-(\d{2})-/u.exec(iso.trim());
  if (!m) return false;
  return Number(m[1]) === year && Number(m[2]) - 1 === monthIndex0;
}

/**
 * Подсчёт «выполнено в месяце» по дате архивации (как типичный ответ /completed-count).
 */
export function mockCompletedTasksCountForCalendarMonth(
  userId: string,
  year: number,
  monthIndex0: number,
  now = new Date(),
): number {
  const tasks = getDemoScopedMockTasks(userId, now);
  let n = 0;
  for (const t of tasks) {
    if (t.userId !== userId) continue;
    if (t.currentProgress !== TaskProgressEnum.Completed) continue;
    if (!t.archivedAt || t.archivedAt.startsWith('0001-01-01')) continue;
    if (archivedDateInMonth(t.archivedAt, year, monthIndex0)) n += 1;
  }
  return n;
}

/**
 * GET /api/DailyReflection — данные за три календарных месяца (пред./тек./след. от `now`).
 */
export function getMockDailyReflectionApiPayload(userId: string, now = new Date()): ApiDailyReflectionResponse[] {
  const rows: ApiDailyReflectionResponse[] = [];
  for (let offset = -1; offset <= 1; offset += 1) {
    const anchor = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    rows.push(...getMockDailyReflectionRowsForMonth(anchor.getFullYear(), anchor.getMonth(), userId));
  }
  return rows.filter((r) => r.userId === userId);
}
