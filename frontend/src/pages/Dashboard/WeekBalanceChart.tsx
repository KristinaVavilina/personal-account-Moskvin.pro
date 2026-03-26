import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { ChartWorkloadCategory } from '../../constants';
import {
  CHART_CATEGORY_LABELS,
  WEEK_BALANCE_CATEGORY_FILL,
} from '../../constants';
import type { WeekBalanceEntry } from '../../mocks/weekBalanceMock';
import { RECHARTS_NUNITO_TOOLTIP_STYLE } from '../../utils';

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
      ? `Распределение ${total} ч по категориям за неделю`
      : 'Нет данных по балансу недели';

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
        <div className="balance-chart__recharts">
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
                formatter={(value, name) => [`${Number(value)} ч`, String(name)]}
                contentStyle={{ ...RECHARTS_NUNITO_TOOLTIP_STYLE }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="balance-chart__center" aria-hidden="true">
        <span className="balance-chart__total">{total > 0 ? total : '—'}</span>
        <span className="balance-chart__unit">часов</span>
      </div>
    </div>
  );
};
