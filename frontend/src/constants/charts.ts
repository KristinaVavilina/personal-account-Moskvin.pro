/** Категории на графиках баланса недели и хронологии дня. */
export type ChartWorkloadCategory =
  | 'task'
  | 'discussion'
  | 'other'
  | 'education'
  | 'routine';

/** Сутки на шкале «Хронология дня». */
export const HOURS_IN_DAY = 24;

/** Подписи категорий на графиках (множественное число). */
export const CHART_CATEGORY_LABELS: Record<ChartWorkloadCategory, string> = {
  task: 'Задачи',
  discussion: 'Обсуждения',
  other: 'Прочее',
  education: 'Обучение',
  routine: 'Рутина',
};

export const WEEK_BALANCE_CATEGORY_FILL: Record<ChartWorkloadCategory, string> = {
  task: 'var(--category-task)',
  discussion: 'var(--category-discussion)',
  other: 'var(--category-other)',
  education: 'var(--category-education)',
  routine: 'var(--category-routine)',
};
