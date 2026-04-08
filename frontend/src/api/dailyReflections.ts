import type { BenefitWorkloadPoint } from '../mocks/benefitWorkloadMock';
import { getDaysInMonth } from '../mocks/benefitWorkloadMock';
import { resolveDevUserId } from './devUser';
import { readJson } from './http';

export interface ApiDailyReflectionResponse {
  id: string;
  userId: string;
  /** DateOnly, обычно "YYYY-MM-DD" */
  date: string;
  stressLevel: number;
  valueLevel: number;
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
 * Точки графика «польза / загруженность» за календарный месяц из DailyReflection.
 * Польза ← valueLevel, загруженность ← stressLevel. Дни без записи — 0/0.
 * Если за месяц нет ни одной рефлексии у пользователя — пустой массив (пустой виджет).
 */
export async function fetchBenefitWorkloadForMonth(
  year: number,
  monthIndex0: number,
): Promise<BenefitWorkloadPoint[]> {
  const userId = await resolveDevUserId();
  const dayCount = getDaysInMonth(year, monthIndex0);
  if (!userId || dayCount < 1) return [];

  const res = await fetch('/api/DailyReflection');
  const all = await readJson<ApiDailyReflectionResponse[]>(res);
  if (!Array.isArray(all)) return [];

  const byDay = new Map<number, BenefitWorkloadPoint>();

  for (const row of all) {
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
