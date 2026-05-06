/** Подписи даты отчёта (карточка виджета, модалки). Инпут DateOnly — `YYYY-MM-DD`. */

const MONTHS_SHORT_GENITIVE: Record<number, string> = {
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

export function formatReportCalendarDate(iso: string): string {
  const [ys, ms, ds] = iso.trim().slice(0, 10).split('-');
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  const monthLabel = MONTHS_SHORT_GENITIVE[m] ?? ms ?? '';
  return `${d} ${monthLabel} ${y}`;
}
