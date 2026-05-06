/** Точки для графика «Польза / Загруженность» (по дням периода, шкала 0–5) */

export interface BenefitWorkloadPoint {
  day: number;
  /** 0…5, целые */
  benefit: number;
  /** 0…5, целые */
  workload: number;
}

/** Число дней в календарном месяце (monthIndex: 0 = январь) */
export function getDaysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

/** Целое 0…5 для шкалы графика */
function clampInt05(n: number): number {
  return Math.min(5, Math.max(0, Math.round(n)));
}

/**
 * Мок: ровно `dayCount` точек с day = 1…dayCount (например, 28/29/30/31 для месяца).
 */
export function createMockBenefitWorkload(dayCount: number): BenefitWorkloadPoint[] {
  if (dayCount < 1) return [];
  return Array.from({ length: dayCount }, (_, i) => {
    const t = i;
    const benefit = 2.6 + Math.sin(t / 4.2) * 2.1 + Math.sin(t / 2.4) * 0.45;
    const workload = 2.3 + Math.cos(t / 3.6) * 1.9 + Math.sin(t / 5.5) * 0.55;
    return {
      day: i + 1,
      benefit: clampInt05(benefit),
      workload: clampInt05(workload),
    };
  });
}

/** Детерминированный «шум», чтобы серии пользователей расходились (мок офлайна). */
function mockSeriesMix(key: string, channel: number): number {
  let h = 2166136261 >>> 0;
  const str = `${key}#${channel}`;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h / 4294967296;
}

/** Мок за указанный календарный месяц (`diversityKey` — обычно `userId` для различных профилей). */
export function createMockBenefitWorkloadForMonth(
  year: number,
  monthIndex0: number,
  diversityKey?: string,
): BenefitWorkloadPoint[] {
  const dayCount = getDaysInMonth(year, monthIndex0);
  if (!diversityKey || !diversityKey.trim()) return createMockBenefitWorkload(dayCount);

  const key = `${year}-${monthIndex0 + 1}|${diversityKey.trim()}`;
  const shift = mockSeriesMix(key, 1) * 6 + mockSeriesMix(key, 2) * 11;
  const ampB = 1.35 + mockSeriesMix(key, 3) * 2.55;
  const ampW = 1.08 + mockSeriesMix(key, 4) * 2.85;
  const skew = mockSeriesMix(key, 5) * 4.2 - 2.05;

  return Array.from({ length: dayCount }, (_, i) => {
    const t = i + shift;
    const dayPhase = `${key}|${i}`;
    const benefit =
      2.45 +
      ampB * Math.sin(t / (2.95 + mockSeriesMix(dayPhase, 6) * 4.2)) +
      (skew * Math.sin(i / (5.5 + mockSeriesMix(dayPhase, 17) * 4))) / 12;
    const workload =
      2.05 -
      skew * 0.12 +
      ampW *
        Math.cos(t / (3.05 + mockSeriesMix(dayPhase, 8) * 3.1) + mockSeriesMix(key, 14) * 2.44);
    return { day: i + 1, benefit: clampInt05(benefit), workload: clampInt05(workload) };
  });
}
