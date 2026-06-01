/** Нормализация ввода «чч:мм» в строку времени как у API (`HH:mm:ss`). */
export function normalizeReportTimeForApi(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/u.exec(s);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
}

/** Отображение времени из API (`HH:mm:ss` или `HH:mm`) в поле ввода «чч:мм». */
export function apiTimeToHmInput(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  if (s.includes('T')) {
    const part = s.split('T')[1]?.slice(0, 5);
    return part && part.length >= 5 ? part : '';
  }
  return s.slice(0, 5);
}
