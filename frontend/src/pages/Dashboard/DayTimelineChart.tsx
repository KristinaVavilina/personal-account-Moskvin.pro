import { CHART_CATEGORY_LABELS, HOURS_IN_DAY } from '../../constants';
import type { DayTimelineSegment } from '../../mocks/dayTimelineMock';
import { buildDayTimelineAriaLabel, formatHoursRu } from '../../utils';

interface DayTimelineChartProps {
  segments: DayTimelineSegment[];
}

export const DayTimelineChart = ({ segments }: DayTimelineChartProps) => {
  const totalRaw = segments.reduce((s, x) => s + x.hours, 0);
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
            title={`${CHART_CATEGORY_LABELS[s.category]}, ${formatHoursRu(s.hours)}`}
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
