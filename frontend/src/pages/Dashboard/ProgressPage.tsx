import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchBenefitWorkloadForMonth } from '../../api/dailyReflections';
import { resolveDevUserId } from '../../api/devUser';
import { fetchCompletedTasksCountForMonth } from '../../api/tasks';
import { fetchTaskTypes } from '../../api/taskTypes';
import { fetchSystemSettings } from '../../api/systemSettings';
import { fetchUsers } from '../../api/users';
import { USE_PROGRESS_MOCK } from '../../config';
import {
  getMockDailyReflectionRowsForMonth,
  mockCompletedTasksCountForCalendarMonth,
} from '../../mocks/progressDashboardMock';
import type { BenefitWorkloadPoint } from '../../mocks/benefitWorkloadMock';
import { useBenefitWorkloadLocalStore } from '../../store/useBenefitWorkloadLocalStore';
import { useProgressStatsSessionStore } from '../../store/useProgressStatsSessionStore';
import { mergeBenefitWorkloadWithLocalOverride } from '../../utils/benefitWorkloadMerge';
import { pluralRuTasks } from '../../utils';
import {
  dailyReflectionRowsToBenefitWorkloadSeries,
  formatLocalDateIso,
} from '../../utils/progressDashboardTransform';
import { fetchEmployeeWeekBalance, fetchEmployeeDayTimelineSegments } from '../../api/employeeProgress';
import type { WeekBalanceEntry } from '../../mocks/weekBalanceMock';
import type { DayTimelineSegment } from '../../mocks/dayTimelineMock';
import { BenefitWorkloadChart } from './BenefitWorkloadChart';
import { DayTimelineChart } from './DayTimelineChart';
import { WeekBalanceChart } from './WeekBalanceChart';
import './Progress.scss';

/** Подтягивает read-only эндпоинты, чтобы они были «подключены» к фронту (кэш в памяти не храним). */
function prefetchProgressRelatedEndpoints(): void {
  if (USE_PROGRESS_MOCK) return;
  void Promise.all([
    fetchTaskTypes().catch(() => []),
    fetchSystemSettings().catch(() => []),
    fetchUsers().catch(() => []),
  ]);
}

export interface ProgressPageProps {
  /** Увеличивать при завершении задания (100%), чтобы заново подтянуть виджеты статистики. */
  statsRevision?: number;
}

export const ProgressPage = ({ statsRevision = 0 }: ProgressPageProps) => {
  const statsMonthKeyRef = useRef<string | null>(null);
  const completedCountServerPrevRef = useRef<number | null>(null);

  const [benefitWorkloadData, setBenefitWorkloadData] = useState<BenefitWorkloadPoint[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [statsCount, setStatsCount] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const todayOverride = useBenefitWorkloadLocalStore((s) => s.todayOverride);

  // «Хронология дня» — доли по числу завершённых сегодня задач (единый источник с разделом «Сотрудники»).
  const [timelineSegments, setTimelineSegments] = useState<DayTimelineSegment[]>([]);

  // «Баланс недели» — часы из таймлогов за календарную неделю (единый источник с разделом «Сотрудники»).
  const [weekBalanceData, setWeekBalanceData] = useState<WeekBalanceEntry[]>([]);

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
    prefetchProgressRelatedEndpoints();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const d = new Date();
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    (async () => {
      setIsChartLoading(true);
      setChartError(null);
      try {
        if (USE_PROGRESS_MOCK) {
          const uid = await resolveDevUserId();
          if (!uid) {
            if (!cancelled) setBenefitWorkloadData([]);
            return;
          }
          const rows = getMockDailyReflectionRowsForMonth(year, monthIndex, uid);
          const data = dailyReflectionRowsToBenefitWorkloadSeries(rows, uid, year, monthIndex);
          if (!cancelled) setBenefitWorkloadData(data);
          return;
        }
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
  }, [statsRevision]);

  useEffect(() => {
    let cancelled = false;
    const d = new Date();
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const monthKey = `${year}-${monthIndex}`;
    if (statsMonthKeyRef.current !== monthKey) {
      statsMonthKeyRef.current = monthKey;
      completedCountServerPrevRef.current = null;
      useProgressStatsSessionStore.getState().resetCompletedMonthOptimistic();
    }

    (async () => {
      setIsStatsLoading(true);
      setStatsError(null);
      try {
        const session = useProgressStatsSessionStore.getState();
        const prevServer = completedCountServerPrevRef.current;

        if (USE_PROGRESS_MOCK) {
          const uid = await resolveDevUserId();
          if (!uid) {
            if (!cancelled) setStatsCount(null);
            return;
          }
          const n = mockCompletedTasksCountForCalendarMonth(uid, year, monthIndex);
          if (prevServer !== null) session.consumeCompletedMonthOptimistic(n, prevServer);
          completedCountServerPrevRef.current = n;
          const optimistic = useProgressStatsSessionStore.getState().completedMonthOptimistic;
          if (!cancelled) setStatsCount(n + optimistic);
          return;
        }
        const n = await fetchCompletedTasksCountForMonth(year, monthIndex);
        if (cancelled) return;
        if (prevServer !== null) session.consumeCompletedMonthOptimistic(n, prevServer);
        completedCountServerPrevRef.current = n;
        const optimistic = useProgressStatsSessionStore.getState().completedMonthOptimistic;
        setStatsCount(n + optimistic);
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
  }, [statsRevision]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const uid = await resolveDevUserId();
        if (!uid) {
          if (!cancelled) {
            setWeekBalanceData([]);
            setTimelineSegments([]);
          }
          return;
        }
        const todayIso = formatLocalDateIso(new Date());
        const [wb, tl] = await Promise.all([
          fetchEmployeeWeekBalance(uid, new Date()),
          fetchEmployeeDayTimelineSegments(uid, todayIso),
        ]);
        if (!cancelled) {
          setWeekBalanceData(wb);
          setTimelineSegments(tl);
        }
      } catch {
        if (!cancelled) {
          setWeekBalanceData([]);
          setTimelineSegments([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [statsRevision]);

  const statsMonthLabel = useMemo(() => {
    const d = new Date();
    const raw = d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    return raw ? raw.charAt(0).toLocaleUpperCase('ru-RU') + raw.slice(1) : raw;
  }, []);

  return (
    <div className="dashboard-grid">
      <div className="widget widget--timeline">
        <p className="widget__title">Хронология дня</p>
        <div className="widget__content">
          {timelineSegments.length === 0 && (
            <div className="widget__content-empty">
              <span className="widget__content-empty-icon">📭</span>
              <span>За сегодня нет выполненных заданий</span>
            </div>
          )}
          {timelineSegments.length > 0 && (
            <DayTimelineChart segments={timelineSegments} />
          )}
        </div>
        {timelineSegments.length > 0 && (
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
        <p className="widget__title">Баланс недели</p>
        <div className="widget__content">
          {weekBalanceData.length === 0 && (
            <div className="widget__content-empty">
              <span className="widget__content-empty-icon">📭</span>
              <span>Нет выполненных заданий на этой неделе</span>
            </div>
          )}
          {weekBalanceData.length > 0 && (
            <WeekBalanceChart data={weekBalanceData} />
          )}
        </div>
        {weekBalanceData.length > 0 && (
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
