import { useLayoutEffect, useRef, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { ChartWorkloadCategory } from '../../constants';
import {
  CHART_CATEGORY_LABELS,
  WEEK_BALANCE_CATEGORY_FILL,
} from '../../constants';
import type { WeekBalanceEntry } from '../../mocks/weekBalanceMock';
import { pluralRuTasks, RECHARTS_NUNITO_TOOLTIP_STYLE } from '../../utils';
import { formatTimeLoggedHoursForDisplay } from '../../utils/progressDashboardTransform';

type PieRow = {
  category: ChartWorkloadCategory;
  name: string;
  value: number;
  fill: string;
};

interface WeekBalanceChartProps {
  data: WeekBalanceEntry[];
}

export const WeekBalanceChart = ({ data }: WeekBalanceChartProps) => {
  const rechartsSlotRef = useRef<HTMLDivElement>(null);
  const [slotHasSize, setSlotHasSize] = useState(false);

  useLayoutEffect(() => {
    const el = rechartsSlotRef.current;
    if (!el) return;
    const run = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSlotHasSize(w > 0 && h > 0);
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const valueUnit = data[0]?.valueUnit ?? 'hours';
  const total = data.reduce((s, d) => s + d.hours, 0);

  const chartData: PieRow[] = data
    .filter((d) => d.hours > 0)
    .map((d) => ({
      category: d.category,
      name: CHART_CATEGORY_LABELS[d.category],
      value: d.hours,
      fill: WEEK_BALANCE_CATEGORY_FILL[d.category],
    }));

  const label =
    total > 0
      ? valueUnit === 'tasks'
        ? `Распределение ${total} ${pluralRuTasks(total)} по категориям за неделю`
        : `Распределение ${formatTimeLoggedHoursForDisplay(total)} ч по категориям за неделю`
      : 'Нет данных по балансу недели';

  const centerTotal =
    total > 0
      ? valueUnit === 'tasks'
        ? String(total)
        : formatTimeLoggedHoursForDisplay(total)
      : '—';

  return (
    <div className="balance-chart" role="img" aria-label={label}>
      {total <= 0 ? (
        <svg className="balance-chart__svg balance-chart__svg--empty" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx={50}
            cy={50}
            r={31}
            fill="none"
            stroke="var(--accent-light)"
            strokeWidth={14}
            opacity={0.25}
          />
        </svg>
      ) : (
        <div className="balance-chart__recharts" ref={rechartsSlotRef}>
          {slotHasSize && (
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={160}
              minHeight={160}
              initialDimension={{ width: 280, height: 280 }}
            >
              <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="52%"
                  outerRadius="82%"
                  paddingAngle={2}
                  stroke="var(--surface-inset)"
                  strokeWidth={2}
                  isAnimationActive
                >
                  {chartData.map((row) => (
                    <Cell key={row.category} fill={row.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    const v = Number(value);
                    const line =
                      valueUnit === 'tasks' ? `${v} ${pluralRuTasks(v)}` : `${formatTimeLoggedHoursForDisplay(v)} ч`;
                    return [line, String(name)];
                  }}
                  contentStyle={{ ...RECHARTS_NUNITO_TOOLTIP_STYLE }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
      <div className="balance-chart__center" aria-hidden="true">
        <span className="balance-chart__total">{centerTotal}</span>
        <span className="balance-chart__unit">{valueUnit === 'tasks' ? 'выполнено' : 'часов'}</span>
      </div>
    </div>
  );
};
