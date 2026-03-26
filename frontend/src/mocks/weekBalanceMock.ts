/** Доли времени по категориям за неделю (часы) — для виджета «Баланс недели» */

export type WeekBalanceCategory = 'task' | 'discussion' | 'other' | 'education' | 'routine';

export interface WeekBalanceEntry {
  category: WeekBalanceCategory;
  hours: number;
}

export const mockWeekBalance: WeekBalanceEntry[] = [
  { category: 'task', hours: 18 },
  { category: 'discussion', hours: 6 },
  { category: 'other', hours: 2 },
  { category: 'education', hours: 5 },
  { category: 'routine', hours: 4 },
];
