/** Виджет «Баланс недели»: часы из таймлогов (`valueUnit` по умолчанию) или число заданий (`tasks`). */

export type WeekBalanceCategory = 'task' | 'discussion' | 'other' | 'education' | 'routine';

export interface WeekBalanceEntry {
  category: WeekBalanceCategory;
  /** Для `tasks` — счётчик заданий; иначе часы. */
  hours: number;
  valueUnit?: 'hours' | 'tasks';
}

export const mockWeekBalance: WeekBalanceEntry[] = [
  { category: 'task', hours: 18 },
  { category: 'discussion', hours: 6 },
  { category: 'other', hours: 2 },
  { category: 'education', hours: 5 },
  { category: 'routine', hours: 4 },
];
