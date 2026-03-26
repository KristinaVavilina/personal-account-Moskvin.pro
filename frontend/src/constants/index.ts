import { ROUTE } from './routes';

// ─── Типы ────────────────────────────────────────────────────────────────────

export type AlertState = 'time' | 'default' | 'done';

// ─── Время / дедлайн ─────────────────────────────────────────────────────────

export const DEADLINE_HOUR = 19;
export const RESET_HOUR = 0;

// ─── Маршрутизация ───────────────────────────────────────────────────────────

export const DASHBOARD_PATHS = [ROUTE.PROGRESS, ROUTE.REPORTING, ROUTE.CALENDAR] as const;

// ─── Календарь ───────────────────────────────────────────────────────────────

export const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export const MONTH_INDEX: Record<string, number> = Object.fromEntries(
  MONTHS.map((m, i) => [m, i]),
);

export const DAY_NAMES = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

// ─── Задания ─────────────────────────────────────────────────────────────────

export type TaskCategory = 'task' | 'discussion' | 'education' | 'routine' | 'other';

/** Полоса Ганта; id совпадает с задачей из API / mockTasks (как в task-widget). */
export interface GanttTask {
  id: string;
  name: string;
  category: TaskCategory;
  start: number;
  end: number;
  progress: number;
}

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  task: 'Задача',
  discussion: 'Обсуждение',
  education: 'Обучение',
  routine: 'Рутина',
  other: 'Прочее',
};

export const TASK_DETAILS_PLACEHOLDER = 'Нажмите на задание, чтобы увидеть подробности';
export const CALENDAR_PLACEHOLDER = 'Выберите месяц, чтобы просмотреть календарь';

export const TASK_TYPES = ['Задачи', 'Обсуждения', 'Рутина', 'Обучение', 'Прочее'];
export const TASK_PROGRESS = ['0%', '20%', '40%', '60%', '70%', '90%', '100%'];

// ─── Отчётность состояния ─────────────────────────────────────────────────────

export const BENEFIT_RATINGS = ['Низкая', 'Средняя', 'Высокая', 'Очень высокая'];
export const WORKLOAD_RATINGS = ['Низкая', 'Средняя', 'Высокая', 'Очень высокая'];

// ─── Вкладки дашборда / панель задач / моки UI ───────────────────────────────

export type { Tab } from './dashboardTabs';
export { PAGE_TAB_ITEMS } from './dashboardTabs';
export * from './routes';
export * from './charts';

export const TASK_PANEL_ACTION_ARCHIVE = 'Архив заданий';
export const TASK_PANEL_ACTION_REPORT = 'Заполнить отчётность';

export const DEFAULT_REPORT_MODAL_TASK_NAMES = [
  'Выполнить монтаж ролика',
  'Подготовить презентацию',
  'Обновить документацию',
] as const;

export const DEFAULT_PROFILE_AVATAR_URL =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=60';

/** Тестовый вход (заменить на API). */
export const MOCK_LOGIN_CREDENTIALS = { email: '123', password: '123' } as const;

/** rem — синхронизировать с Calendar.scss */
export const GANTT_BAR_HEIGHT_REM = 5.4;
export const GANTT_BAR_GAP_REM = 1.2;
export const GANTT_MIN_DAY_COL_WIDTH_REM = 4;

/** Отладка AlertMessage: null — авто; иначе принудительное состояние. */
export const DEBUG_DASHBOARD_ALERT_STATE: AlertState | null = null;
