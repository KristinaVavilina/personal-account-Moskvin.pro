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

/** Мок за указанный календарный месяц (столько значений, сколько дней в месяце) */
export function createMockBenefitWorkloadForMonth(year: number, monthIndex0: number): BenefitWorkloadPoint[] {
  return createMockBenefitWorkload(getDaysInMonth(year, monthIndex0));
}
