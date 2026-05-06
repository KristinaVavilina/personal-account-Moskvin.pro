import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import taskTypeIcon from '../../assets/icons/task-type-icon.svg';
import backArrowIcon from '../../assets/icons/dropdown-arrow-icon.svg';
import { pluralRuTasks } from '../../utils';
import { formatLocalDateIso } from '../../utils/progressDashboardTransform';
import {
  ROUTE,
  DEFAULT_PROFILE_AVATAR_URL,
  TASK_CATEGORY_LABELS,
  TASK_DETAILS_PLACEHOLDER,
  type Tab,
  type GanttTask,
} from '../../constants';
import type { BenefitWorkloadPoint } from '../../mocks/benefitWorkloadMock';
import type { DayTimelineSegment } from '../../mocks/dayTimelineMock';
import type { WeekBalanceEntry } from '../../mocks/weekBalanceMock';
import { fetchEmployeesDirectory, type ApiUserResponse } from '../../api/users';
import { apiTaskToListItem, fetchUserTasksRaw } from '../../api/tasks';
import type { TaskListItem } from '../../components/layout/taskListTypes';
import {
  fetchEmployeeBenefitWorkloadForMonth,
  fetchEmployeeCompletedTasksCountForMonth,
  fetchEmployeeDayTimelineSegments,
  fetchEmployeeWeekBalance,
} from '../../api/employeeProgress';
import { BenefitWorkloadChart } from '../Dashboard/BenefitWorkloadChart';
import { DayTimelineChart } from '../Dashboard/DayTimelineChart';
import { WeekBalanceChart } from '../Dashboard/WeekBalanceChart';
import { CalendarPage } from '../Dashboard/CalendarPage';
import { PageTabs } from '../../components/layout/PageTabs';
import { TaskViewModal } from '../../components/layout/TaskViewModal';
import { EmployeeReportReadonly } from './EmployeeReportReadonly';
import '../../components/layout/PageTabs.scss';
import '../../components/layout/TaskPanel.scss';
import '../Dashboard/Progress.scss';
import '../Dashboard/Calendar.scss';
import './Employees.scss';

/** Список как у `TaskPanel`: клик открывает модалку только для просмотра (без редактирования). */
function EmployeeTaskListBody({
  tasks,
  loading,
  onSelectTask,
}: {
  tasks: TaskListItem[];
  loading: boolean;
  onSelectTask: (task: TaskListItem) => void;
}) {
  if (loading) return null;

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <span className="task-list-empty__icon">📭</span>
        <span>Список заданий пуст</span>
      </div>
    );
  }
  return (
    <ul className="task-list">
      {tasks.map((t) => (
        <li
          key={t.id}
          className="task-item"
          role="button"
          tabIndex={0}
          aria-label={`Открыть задание: ${t.name}`}
          onClick={() => onSelectTask(t)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectTask(t);
            }
          }}
        >
          <div className="task-item__icon-wrapper">
            <div className="task-item__icon">
              <img src={taskTypeIcon} alt="" />
            </div>
          </div>
          <div className="task-item__content">
            <p className="task-item__name">{t.name}</p>
            <div className="task-item__progress-bar">
              <div
                className="task-item__progress-line"
                style={{ width: `${t.progress}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export const EmployeeStatisticsPage = () => {
  const { userId: rawUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const userId = rawUserId ? decodeURIComponent(rawUserId) : '';

  const [row, setRow] = useState<ApiUserResponse | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaMissing, setMetaMissing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [statsCount, setStatsCount] = useState<number | null>(null);
  const [chartData, setChartData] = useState<BenefitWorkloadPoint[]>([]);
  const [timelineSegments, setTimelineSegments] = useState<DayTimelineSegment[]>([]);
  const [weekBalanceData, setWeekBalanceData] = useState<WeekBalanceEntry[]>([]);
  const [employeeTab, setEmployeeTab] = useState<Tab>('progress');
  const [calendarTask, setCalendarTask] = useState<GanttTask | null>(null);
  const [viewTask, setViewTask] = useState<TaskListItem | null>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewTask(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  useEffect(() => {
    if (employeeTab === 'calendar') setViewTask(null);
  }, [employeeTab]);

  useEffect(() => {
    if (!userId) {
      setMetaLoading(false);
      setMetaMissing(true);
      return;
    }

    let cancelled = false;
    (async () => {
      setMetaLoading(true);
      setMetaMissing(false);
      try {
        const list = await fetchEmployeesDirectory();
        const found = list.find((u) => u.id === userId) ?? null;
        if (!cancelled) {
          setRow(found);
          setMetaMissing(!found);
        }
      } catch {
        if (!cancelled) {
          setRow(null);
          setMetaMissing(true);
        }
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !row) return;

    let cancelled = false;
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    const todayIso = formatLocalDateIso(d);

    (async () => {
      setLoading(true);
      setBootError(null);
      setTasks([]);
      setStatsCount(null);
      setChartData([]);
      setTimelineSegments([]);
      setWeekBalanceData([]);
      try {
        const [tasksRaw, n, bw, tl, wb] = await Promise.all([
          fetchUserTasksRaw(row.id, false),
          fetchEmployeeCompletedTasksCountForMonth(row.id, y, m),
          fetchEmployeeBenefitWorkloadForMonth(row.id, y, m),
          fetchEmployeeDayTimelineSegments(row.id, todayIso),
          fetchEmployeeWeekBalance(row.id, d),
        ]);
        if (cancelled) return;
        setTasks(tasksRaw.map(apiTaskToListItem));
        setStatsCount(n);
        setChartData(bw);
        setTimelineSegments(tl);
        setWeekBalanceData(wb);
      } catch (e) {
        if (!cancelled) {
          setBootError(e instanceof Error ? e.message : 'Не удалось загрузить данные');
          setTasks([]);
          setStatsCount(null);
          setChartData([]);
          setTimelineSegments([]);
          setWeekBalanceData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, row]);

  const statsMonthLabel = useMemo(() => {
    const d = new Date();
    const raw = d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    return raw ? raw.charAt(0).toLocaleUpperCase('ru-RU') + raw.slice(1) : raw;
  }, []);

  const employeeInfoSection = useMemo(() => {
    if (!row) return null;
    return (
      <section className="employees-info-widget" aria-label="Карточка сотрудника">
        <p className="employees-info-widget__caption">Просмотр информации по сотруднику:</p>
        <div className="employees-info-widget__profile">
          <div className="employees-info-widget__avatar-wrap">
            <img
              src={row.photoUrl || DEFAULT_PROFILE_AVATAR_URL}
              alt=""
              className="employees-info-widget__avatar"
            />
          </div>
          <div className="employees-info-widget__text">
            <div className="employees-info-widget__name">{row.fullName}</div>
            <div className="employees-info-widget__position">
              {row.positionName ?? 'Должность не указана'}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="employees-info-widget__back"
          onClick={() => navigate(ROUTE.EMPLOYEES)}
        >
          <img src={backArrowIcon} alt="" className="employees-info-widget__back-icon" />
          К списку сотрудников
        </button>
      </section>
    );
  }, [row, navigate]);

  if (!userId || metaMissing) {
    return <Navigate to={ROUTE.EMPLOYEES} replace />;
  }

  if (metaLoading || !row) {
    return (
      <main className="main-content employees-statistics employees-statistics--boot">
        <div className="employees-page__surface employees-statistics__boot-surface">
          <div className="employees-page__spinner" aria-label="Загрузка" />
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="main-content employees-statistics">
        {bootError && (
          <div className="employees-statistics__banner-error" role="alert">
            {bootError}
          </div>
        )}

        <PageTabs
          activeTab={employeeTab}
          onTabChange={(t) => {
            setEmployeeTab(t);
            if (t !== 'calendar') setCalendarTask(null);
          }}
        />

        {/* Как у `DashboardTabsPage`: активная вкладка + `dashboard-progress-keepalive` */}
        <div
          className="dashboard-progress-keepalive"
          style={{ display: employeeTab === 'progress' ? 'flex' : 'none' }}
        >
          <div className="dashboard-grid">
            <div className="widget widget--timeline">
              <p className="widget__title">Хронология дня</p>
              <div className="widget__content">
                {loading && <div className="widget__spinner" aria-label="Загрузка" />}
                {!loading && timelineSegments.length === 0 && (
                  <div className="widget__content-empty">
                    <span className="widget__content-empty-icon">📭</span>
                    <span>За сегодня нет выполненных заданий</span>
                  </div>
                )}
                {!loading && timelineSegments.length > 0 && (
                  <DayTimelineChart segments={timelineSegments} />
                )}
              </div>
              {!loading && timelineSegments.length > 0 && (
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
              {loading && <div className="widget__spinner" aria-label="Загрузка" />}
              <p className="widget__title">В этом месяце выполнено заданий</p>
              <div className="widget__content">
                {!loading && statsCount !== null && (
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
                {!loading && statsCount === null && (
                  <div className="widget__content-empty">
                    <span className="widget__content-empty-icon">📭</span>
                    <span>Нет данных за этот месяц</span>
                  </div>
                )}
              </div>
              {!loading && statsCount !== null && (
                <p className="widget-stats__month">{statsMonthLabel}</p>
              )}
            </div>

            <div className="widget widget--chart">
              {loading && <div className="widget__spinner" aria-label="Загрузка" />}
              <p className="widget__title">График пользы и загруженности</p>
              <div className="widget__content">
                {!loading && chartData.length === 0 && (
                  <div className="widget__content-empty">
                    <span className="widget__content-empty-icon">📭</span>
                    <span>Нет данных для отображения</span>
                  </div>
                )}
                {!loading && chartData.length > 0 && (
                  <BenefitWorkloadChart data={chartData} />
                )}
              </div>
              {!loading && chartData.length > 0 && (
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
                {loading && <div className="widget__spinner" aria-label="Загрузка" />}
                {!loading && weekBalanceData.length === 0 && (
                  <div className="widget__content-empty">
                    <span className="widget__content-empty-icon">📭</span>
                    <span>Нет выполненных заданий на этой неделе</span>
                  </div>
                )}
                {!loading && weekBalanceData.length > 0 && (
                  <WeekBalanceChart data={weekBalanceData} />
                )}
              </div>
              {!loading && weekBalanceData.length > 0 && (
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
        </div>

        {employeeTab === 'reporting' && <EmployeeReportReadonly userId={row.id} />}
        {employeeTab === 'calendar' && (
          <CalendarPage
            viewUserId={row.id}
            onTaskSelect={(t) => setCalendarTask(t)}
            selectedTaskId={calendarTask?.id ?? null}
          />
        )}
      </main>

      {employeeTab === 'calendar' ? (
        <aside className="employees-statistics__calendar-rail" aria-label="Задание и сотрудник">
          <div className="task-details" aria-label="Подробности по заданию">
            <h2 className="task-details__title">Подробности по заданию</h2>

            {calendarTask ? (
              <>
                <div className="task-details__meta">
                  <div className="task-details__meta-row">
                    <p className="task-details__meta-label">Прогресс выполнения:</p>
                    <div className="task-details__meta-value">{calendarTask.progress}%</div>
                  </div>
                  <div className="task-details__meta-row">
                    <p className="task-details__meta-label">Тип задания:</p>
                    <div className="task-details__meta-value">
                      {TASK_CATEGORY_LABELS[calendarTask.category]}
                    </div>
                  </div>
                </div>
                <div className="task-details__description">{calendarTask.name}</div>
              </>
            ) : (
              <div className="task-details__placeholder">{TASK_DETAILS_PLACEHOLDER}</div>
            )}
          </div>
          {employeeInfoSection}
        </aside>
      ) : (
        <div className="task-panel employees-statistics__rail" aria-label="Список заданий и сотрудник">
          <div className="task-widget">
            {loading && (
              <div className="task-widget__spinner" aria-label="Загрузка" />
            )}
            <h2 className="task-widget__title">Список заданий</h2>

            <div className="task-list-wrapper">
              <div className="task-list-viewport">
                <EmployeeTaskListBody tasks={tasks} loading={loading} onSelectTask={setViewTask} />
              </div>
              <div className="task-widget__inner-shadow" aria-hidden />
            </div>
          </div>
          {employeeInfoSection}
        </div>
      )}

      {viewTask && (
        <TaskViewModal task={viewTask} onClose={() => setViewTask(null)} />
      )}
    </>
  );
};
