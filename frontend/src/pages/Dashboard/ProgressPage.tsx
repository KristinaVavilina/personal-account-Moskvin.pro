import { useEffect, useMemo, useState } from 'react';
import { fetchBenefitWorkloadForMonth } from '../../api/dailyReflections';
import { fetchCompletedTasksCountForMonth } from '../../api/tasks';
import { useBenefitWorkloadLocalStore } from '../../store/useBenefitWorkloadLocalStore';
import type { BenefitWorkloadPoint } from '../../mocks/benefitWorkloadMock';
import { mergeBenefitWorkloadWithLocalOverride } from '../../utils/benefitWorkloadMerge';
import { mockDayTimelineSegments } from '../../mocks/dayTimelineMock';
import { mockWeekBalance } from '../../mocks/weekBalanceMock';
import { pluralRuTasks } from '../../utils';
import { BenefitWorkloadChart } from './BenefitWorkloadChart';
import { DayTimelineChart } from './DayTimelineChart';
import { WeekBalanceChart } from './WeekBalanceChart';
import './Progress.scss';

const isTimelineLoading = false;

const isBalanceLoading = false;

export const ProgressPage = () => {
  const [benefitWorkloadData, setBenefitWorkloadData] = useState<BenefitWorkloadPoint[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [statsCount, setStatsCount] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const todayOverride = useBenefitWorkloadLocalStore((s) => s.todayOverride);

  const chartDisplayData = useMemo(() => {
    const d = new Date();
    return mergeBenefitWorkloadWithLocalOverride(
      benefitWorkloadData,
      d.getFullYear(),
      d.getMonth(),
      todayOverride,
    );
  }, [benefitWorkloadData, todayOverride]);

  useEffect(() => {
    let cancelled = false;
    const d = new Date();
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    (async () => {
      setIsChartLoading(true);
      setChartError(null);
      try {
        const data = await fetchBenefitWorkloadForMonth(year, monthIndex);
        if (!cancelled) setBenefitWorkloadData(data);
      } catch (e) {
        if (!cancelled) {
          setChartError(e instanceof Error ? e.message : 'Не удалось загрузить график');
          setBenefitWorkloadData([]);
        }
      } finally {
        if (!cancelled) setIsChartLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const d = new Date();
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    (async () => {
      setIsStatsLoading(true);
      setStatsError(null);
      try {
        const n = await fetchCompletedTasksCountForMonth(year, monthIndex);
        if (!cancelled) setStatsCount(n);
      } catch (e) {
        if (!cancelled) {
          setStatsError(e instanceof Error ? e.message : 'Не удалось загрузить статистику');
          setStatsCount(null);
        }
      } finally {
        if (!cancelled) setIsStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
        {statsError && (
          <p className="widget__api-error" role="alert">
            {statsError}
          </p>
        )}
        <div className="widget__content">
          {!isStatsLoading && statsError && (
            <div className="widget__content-empty">
              <span className="widget__content-empty-icon">📭</span>
              <span>Нет данных за этот месяц</span>
            </div>
          )}
          {!isStatsLoading && !statsError && statsCount !== null && (
            <div
              className="stats-chart"
              role="img"
              aria-label={`${statsCount} ${pluralRuTasks(statsCount)} за ${statsMonthLabel}`}
            >
              <div className="stats-chart__disc" aria-hidden="true">
                <span className="stats-chart__value">{statsCount}</span>
              </div>
            </div>
          )}
        </div>
        {!isStatsLoading && !statsError && statsCount !== null && (
          <p className="widget-stats__month">{statsMonthLabel}</p>
        )}
      </div>

      <div className="widget widget--chart">
        {isChartLoading && (
          <div className="widget__spinner" aria-label="Загрузка" />
        )}
        <p className="widget__title">График пользы и загруженности</p>
        {chartError && (
          <p className="widget__api-error" role="alert">
            {chartError}
          </p>
        )}
        <div className="widget__content">
          {!isChartLoading && chartDisplayData.length === 0 && (
            <div className="widget__content-empty">
              <span className="widget__content-empty-icon">📭</span>
              <span>Нет данных для отображения</span>
            </div>
          )}
          {!isChartLoading && chartDisplayData.length > 0 && (
            <BenefitWorkloadChart data={chartDisplayData} />
          )}
        </div>
        {!isChartLoading && chartDisplayData.length > 0 && (
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
