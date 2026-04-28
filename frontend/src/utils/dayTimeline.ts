import type { DayTimelineSegment } from '../mocks/dayTimelineMock';
import { CHART_CATEGORY_LABELS, HOURS_IN_DAY } from '../constants/charts';

export function formatHoursRu(h: number): string {
  if (Number.isInteger(h)) return `${h} ч`;
  return `${h.toFixed(1).replace('.', ',')} ч`;
}

export function buildDayTimelineAriaLabel(
  segments: DayTimelineSegment[],
  total: number,
): string {
  const parts = segments.map(
    (s) => `${CHART_CATEGORY_LABELS[s.category]} ${formatHoursRu(s.hours)}`,
  );
  const rest = Math.max(0, HOURS_IN_DAY - total);
  if (rest > 0) parts.push(`свободно ${formatHoursRu(rest)}`);
  return `Хронология дня за 24 часа: ${parts.join(', ')}`;
}
