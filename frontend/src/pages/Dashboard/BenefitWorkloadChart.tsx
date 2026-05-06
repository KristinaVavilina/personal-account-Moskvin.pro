import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BenefitWorkloadPoint } from '../../mocks/benefitWorkloadMock';
import {
  BENEFIT_WORKLOAD_LINE_SMOOTHING,
  computeBenefitLineStrokePx,
  RECHARTS_NUNITO_TOOLTIP_STYLE,
  RECHARTS_TICK_STYLE,
} from '../../utils';

function useBenefitLineStrokeWidth() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [strokeWidth, setStrokeWidth] = useState<number>(
    BENEFIT_WORKLOAD_LINE_SMOOTHING.strokeWidth,
  );
  /** Без этого Recharts спамит в консоль при `display: none` (вкладка «Прогресс» скрыта, но страница смонтирована). */
  const [hasLayoutSize, setHasLayoutSize] = useState(false);

  useLayoutEffect(() => {
    const { adaptiveStroke, strokeWidth: fixed } = BENEFIT_WORKLOAD_LINE_SMOOTHING;

    const run = () => {
      const el = chartRef.current;
      const w = el?.clientWidth ?? 0;
      const h = el?.clientHeight ?? 0;
      setHasLayoutSize(w > 0 && h > 0);
      if (adaptiveStroke.enabled) {
        setStrokeWidth(computeBenefitLineStrokePx(w));
      } else {
        setStrokeWidth(fixed);
      }
    };

    run();
    const el = chartRef.current;
    const ro = new ResizeObserver(run);
    if (el) ro.observe(el);
    window.addEventListener('resize', run);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', run);
    };
  }, []);

  return { strokeWidth, chartRef, hasLayoutSize };
}

interface BenefitWorkloadChartProps {
  data: BenefitWorkloadPoint[];
}

export const BenefitWorkloadChart = ({ data }: BenefitWorkloadChartProps) => {
  const { strokeWidth: lineStrokeWidth, chartRef, hasLayoutSize } = useBenefitLineStrokeWidth();

  const xDayMax = useMemo(
    () => (data.length === 0 ? 1 : Math.max(...data.map((p) => p.day))),
    [data],
  );

  if (data.length === 0) return null;

  return (
    <div
      ref={chartRef}
      className="benefit-chart"
      role="img"
      aria-label="График пользы и загруженности по дням"
    >
      {hasLayoutSize && (
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={200}
          minHeight={200}
          initialDimension={{ width: 400, height: 280 }}
        >
          <LineChart
            data={data}
            margin={{ top: 6, right: 4, left: 0, bottom: 4 }}
          >
            <XAxis
              dataKey="day"
              type="number"
              domain={[1, xDayMax]}
              ticks={[1, xDayMax]}
              axisLine={false}
              tickLine={false}
              tick={RECHARTS_TICK_STYLE}
              allowDecimals={false}
              padding={{ left: 4, right: 4 }}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              axisLine={false}
              tickLine={false}
              tick={RECHARTS_TICK_STYLE}
              width={28}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value, name) => [`${Math.round(Number(value))}`, String(name)]}
              labelFormatter={(d) => `День ${d}`}
              contentStyle={{ ...RECHARTS_NUNITO_TOOLTIP_STYLE }}
            />
            <Line
              type={BENEFIT_WORKLOAD_LINE_SMOOTHING.curveType}
              dataKey="benefit"
              name="Польза"
              stroke="var(--category-discussion)"
              strokeWidth={lineStrokeWidth}
              strokeLinecap={BENEFIT_WORKLOAD_LINE_SMOOTHING.strokeLinecap}
              strokeLinejoin={BENEFIT_WORKLOAD_LINE_SMOOTHING.strokeLinejoin}
              dot={false}
              activeDot={{ r: Math.max(3, lineStrokeWidth * 1.25), strokeWidth: 0 }}
              isAnimationActive
            />
            <Line
              type={BENEFIT_WORKLOAD_LINE_SMOOTHING.curveType}
              dataKey="workload"
              name="Загруженность"
              stroke="var(--danger)"
              strokeWidth={lineStrokeWidth}
              strokeLinecap={BENEFIT_WORKLOAD_LINE_SMOOTHING.strokeLinecap}
              strokeLinejoin={BENEFIT_WORKLOAD_LINE_SMOOTHING.strokeLinejoin}
              dot={false}
              activeDot={{ r: Math.max(3, lineStrokeWidth * 1.25), strokeWidth: 0 }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
