import type { DayTimelineSegment } from '../mocks/dayTimelineMock';
import { CHART_CATEGORY_LABELS, HOURS_IN_DAY } from '../constants/charts';

export function formatHoursRu(h: number): string {
  if (Number.isInteger(h)) return `${h} ч`;
  return `${h.toFixed(1).replace('.', ',')} ч`;
}

function segmentAriaPart(s: DayTimelineSegment): string {
  if (s.completedInCategory != null && s.completedDayTotal != null) {
    const pct = Math.round((s.hours / HOURS_IN_DAY) * 100);
    return `${CHART_CATEGORY_LABELS[s.category]} ${s.completedInCategory} из ${s.completedDayTotal} завершённых (${pct}% полосы)`;
  }
  return `${CHART_CATEGORY_LABELS[s.category]} ${formatHoursRu(s.hours)}`;
}

export function buildDayTimelineAriaLabel(
  segments: DayTimelineSegment[],
  total: number,
): string {
  const parts = segments.map(segmentAriaPart);
  const rest = Math.max(0, HOURS_IN_DAY - total);
  if (rest > 0) parts.push(`свободно ${formatHoursRu(rest)}`);
  const prefix =
    segments.length > 0 && segments[0].completedDayTotal != null
      ? 'Хронология дня по выполненным задачам: '
      : 'Хронология дня за 24 часа: ';
  return `${prefix}${parts.join(', ')}`;
}
