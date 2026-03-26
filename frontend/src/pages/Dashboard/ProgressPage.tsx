import { useMemo } from 'react';
import { createMockBenefitWorkloadForMonth } from '../../mocks/benefitWorkloadMock';
import { mockDayTimelineSegments } from '../../mocks/dayTimelineMock';
import { mockCompletedTasksThisMonth } from '../../mocks/monthStatsMock';
import { mockWeekBalance } from '../../mocks/weekBalanceMock';
import { pluralRuTasks } from '../../utils';
import { BenefitWorkloadChart } from './BenefitWorkloadChart';
import { DayTimelineChart } from './DayTimelineChart';
import { WeekBalanceChart } from './WeekBalanceChart';
import './Progress.scss';

const isTimelineLoading = false;

const statsData: number | null = mockCompletedTasksThisMonth;
const isStatsLoading = false;

const isChartLoading = false;

const isBalanceLoading = false;

export const ProgressPage = () => {
  const benefitWorkloadData = useMemo(() => {
    const d = new Date();
    return createMockBenefitWorkloadForMonth(d.getFullYear(), d.getMonth());
  }, []);

  const statsMonthLabel = useMemo(() => {
    const d = new Date();
    const raw = d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    return raw ? raw.charAt(0).toLocaleUpperCase('ru-RU') + raw.slice(1) : raw;
  }, []);

  return (
    <div className="dashboard-grid">
      <div className="widget widget--timeline">
        {isTimelineLoading && (
          <div className="widget__spinner" aria-label="Загрузка" />
        )}
        <p className="widget__title">Хронология дня</p>
        <div className="widget__content">
          {!isTimelineLoading && mockDayTimelineSegments.length === 0 && (
            <div className="widget__content-empty">
              <span className="widget__content-empty-icon">📭</span>
              <span>За сегодня нет данных</span>
            </div>
          )}
          {!isTimelineLoading && mockDayTimelineSegments.length > 0 && (
            <DayTimelineChart segments={mockDayTimelineSegments} />
          )}
        </div>
        {!isTimelineLoading && mockDayTimelineSegments.length > 0 && (
          <div className="legend-list">
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--task" />
              <span>Задачи</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--discussion" />
              <span>Обсуждения</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--other" />
              <span>Прочее</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--education" />
              <span>Обучение</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--routine" />
              <span>Рутина</span>
            </div>
          </div>
        )}
      </div>

      <div className="widget widget--stats">
        {isStatsLoading && (
          <div className="widget__spinner" aria-label="Загрузка" />
        )}
        <p className="widget__title">В этом месяце выполнено заданий</p>
        <div className="widget__content">
          {!isStatsLoading && statsData === null && (
            <div className="widget__content-empty">
              <span className="widget__content-empty-icon">📭</span>
              <span>Нет данных за этот месяц</span>
            </div>
          )}
          {!isStatsLoading && statsData !== null && (
            <div
              className="stats-chart"
              role="img"
              aria-label={`${statsData} ${pluralRuTasks(statsData)} за ${statsMonthLabel}`}
            >
              <div className="stats-chart__disc" aria-hidden="true">
                <span className="stats-chart__value">{statsData}</span>
              </div>
            </div>
          )}
        </div>
        {!isStatsLoading && statsData !== null && (
          <p className="widget-stats__month">{statsMonthLabel}</p>
        )}
      </div>

      <div className="widget widget--chart">
        {isChartLoading && (
          <div className="widget__spinner" aria-label="Загрузка" />
        )}
        <p className="widget__title">График пользы и загруженности</p>
        <div className="widget__content">
          {!isChartLoading && benefitWorkloadData.length === 0 && (
            <div className="widget__content-empty">
              <span className="widget__content-empty-icon">📭</span>
              <span>Нет данных для отображения</span>
            </div>
          )}
          {!isChartLoading && benefitWorkloadData.length > 0 && (
            <BenefitWorkloadChart data={benefitWorkloadData} />
          )}
        </div>
        {!isChartLoading && benefitWorkloadData.length > 0 && (
          <div className="legend-list">
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--discussion" />
              <span>Польза</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--danger" />
              <span>Загруженность</span>
            </div>
          </div>
        )}
      </div>

      <div className="widget widget--balance">
        {isBalanceLoading && (
          <div className="widget__spinner" aria-label="Загрузка" />
        )}
        <p className="widget__title">Баланс недели</p>
        <div className="widget__content">
          {!isBalanceLoading && mockWeekBalance.length === 0 && (
            <div className="widget__content-empty">
              <span className="widget__content-empty-icon">📭</span>
              <span>Нет данных за эту неделю</span>
            </div>
          )}
          {!isBalanceLoading && mockWeekBalance.length > 0 && (
            <WeekBalanceChart data={mockWeekBalance} />
          )}
        </div>
        {!isBalanceLoading && mockWeekBalance.length > 0 && (
          <div className="legend-list">
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--task" />
              <span>Задачи</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--discussion" />
              <span>Обсуждения</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--other" />
              <span>Прочее</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--education" />
              <span>Обучение</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--routine" />
              <span>Рутина</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
