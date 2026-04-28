import type { BenefitWorkloadPoint } from '../mocks/benefitWorkloadMock';
import { getDaysInMonth } from '../mocks/benefitWorkloadMock';

export interface ChartDayOverride {
  year: number;
  monthIndex: number;
  day: number;
  benefit: number;
  workload: number;
}

/** Слияние ответа API с точкой «сегодня» из модалки отчётности. */
export function mergeBenefitWorkloadWithLocalOverride(
  apiData: BenefitWorkloadPoint[],
  year: number,
  monthIndex: number,
  override: ChartDayOverride | null,
): BenefitWorkloadPoint[] {
  const dayCount = getDaysInMonth(year, monthIndex);
  if (dayCount < 1) return [];
  if (apiData.length === 0 && !override) return [];

  let base: BenefitWorkloadPoint[];
  if (apiData.length === dayCount) {
    base = apiData.map((p) => ({ ...p }));
  } else {
    base = Array.from({ length: dayCount }, (_, i) => ({
      day: i + 1,
      benefit: 0,
      workload: 0,
    }));
    for (const p of apiData) {
      if (p.day >= 1 && p.day <= dayCount) {
        base[p.day - 1] = { ...p };
      }
    }
  }

  if (
    override &&
    override.year === year &&
    override.monthIndex === monthIndex &&
    override.day >= 1 &&
    override.day <= dayCount
  ) {
    const i = override.day - 1;
    base[i] = { day: override.day, benefit: override.benefit, workload: override.workload };
  }

  return base;
}
