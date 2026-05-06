import { CHART_CATEGORY_LABELS, HOURS_IN_DAY } from '../../constants/charts';
import type { DayTimelineSegment } from '../../mocks/dayTimelineMock';
import { buildDayTimelineAriaLabel, formatHoursRu } from '../../utils';

interface DayTimelineChartProps {
  segments: DayTimelineSegment[];
}

function segmentTitle(s: DayTimelineSegment): string {
  if (s.completedInCategory != null && s.completedDayTotal != null) {
    const pct = Math.round((s.hours / HOURS_IN_DAY) * 100);
    return `${CHART_CATEGORY_LABELS[s.category]}: ${s.completedInCategory} из ${s.completedDayTotal} (${pct}% полосы)`;
  }
  return `${CHART_CATEGORY_LABELS[s.category]}, ${formatHoursRu(s.hours)}`;
}

export const DayTimelineChart = ({ segments }: DayTimelineChartProps) => {
  const totalRaw = segments.reduce((sum, x) => sum + x.hours, 0);
  const scale = totalRaw > HOURS_IN_DAY ? HOURS_IN_DAY / totalRaw : 1;
  const totalShown = Math.min(totalRaw, HOURS_IN_DAY);
  const rest = Math.max(0, HOURS_IN_DAY - totalShown);

  return (
    <div
      className="timeline-chart"
      role="img"
      aria-label={buildDayTimelineAriaLabel(segments, totalShown)}
    >
      <div className="timeline-chart__track">
        {segments.map((s) => (
          <div
            key={s.id}
            className={`timeline-chart__segment timeline-chart__segment--${s.category}`}
            style={{ flexGrow: s.hours * scale, flexShrink: 1, flexBasis: 0 }}
            title={segmentTitle(s)}
          />
        ))}
        {rest > 0 && (
          <div
            className="timeline-chart__spacer"
            style={{ flexGrow: rest, flexShrink: 1, flexBasis: 0 }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
};
