export type Tab = 'progress' | 'reporting' | 'calendar';

export const PAGE_TAB_ITEMS: { id: Tab; label: string }[] = [
  { id: 'progress', label: 'Статистика' },
  { id: 'reporting', label: 'Отчёт' },
  { id: 'calendar', label: 'Календарь' },
];
