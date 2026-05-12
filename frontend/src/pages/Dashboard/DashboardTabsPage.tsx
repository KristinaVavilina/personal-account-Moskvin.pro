import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchActiveTasksForDashboard } from '../../api/tasks';
import { useProgressStatsSessionStore } from '../../store/useProgressStatsSessionStore';
import { useDayTimelineCompletionsStore } from '../../store/useDayTimelineCompletionsStore';
import { PageTabs } from '../../components/layout/PageTabs';
import { TaskPanel, type TaskPanelHandle } from '../../components/layout/TaskPanel';
import type { TaskListItem } from '../../components/layout/taskListTypes';
import type { GanttTask } from '../../constants';
import {
  DEBUG_DASHBOARD_ALERT_STATE,
  TASK_CATEGORY_LABELS,
  TASK_DETAILS_PLACEHOLDER,
  TASK_PANEL_ACTION_ARCHIVE,
  TASK_PANEL_ACTION_REPORT,
} from '../../constants';
import { type Tab, getInitialTab } from '../../utils';
import { ProgressPage } from './ProgressPage';
import { ReportingPage } from './ReportingPage';
import { CalendarPage } from './CalendarPage';
import './Calendar.scss';

export const DashboardTabsPage = () => {
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(() => getInitialTab(pathname));
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [taskWidgetItems, setTaskWidgetItems] = useState<TaskListItem[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [progressStatsRevision, setProgressStatsRevision] = useState(0);
  const taskPanelRef = useRef<TaskPanelHandle | null>(null);

  const refreshTasksAndProgressStatistics = useCallback(async (completedTask?: TaskListItem) => {
    if (completedTask?.progress === 100) {
      useDayTimelineCompletionsStore.getState().recordCompletedTask(completedTask);
      useProgressStatsSessionStore.getState().incrementCompletedMonthOptimistic();
    }
    setProgressStatsRevision((n) => n + 1);
    try {
      const list = await fetchActiveTasksForDashboard();
      setTaskWidgetItems(list);
    } catch {
      /* список заданий не трогаем */
    }
  }, []);

  const refreshTaskListOnly = useCallback(async () => {
    try {
      const list = await fetchActiveTasksForDashboard();
      setTaskWidgetItems(list);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTasksLoading(true);
      try {
        const list = await fetchActiveTasksForDashboard();
        if (!cancelled) setTaskWidgetItems(list);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setTasksLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleTaskSelect = useCallback((task: GanttTask) => {
    setSelectedTask(task);
  }, []);

  return (
    <>
      <main className="main-content">
        <PageTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Не размонтировать: иначе локальный стейт виджетов (в т.ч. widget--stats) обнуляется при смене вкладки.
            Обёртка с flex: 1 — как у прямого потомка .main-content, иначе .dashboard-grid не тянется на всю высоту. */}
        <div
          className="dashboard-progress-keepalive"
          style={{ display: activeTab === 'progress' ? 'flex' : 'none' }}
        >
          <ProgressPage statsRevision={progressStatsRevision} />
        </div>
        {activeTab === 'reporting' && <ReportingPage taskPanelRef={taskPanelRef} />}
        {activeTab === 'calendar' && (
          <CalendarPage
            onTaskSelect={handleTaskSelect}
            selectedTaskId={selectedTask?.id ?? null}
          />
        )}
      </main>

      {activeTab === 'calendar' ? (
        <aside className="task-details" aria-label="Подробности по заданию">
          <h2 className="task-details__title">Подробности по заданию</h2>

          {selectedTask ? (
            <>
              <div className="task-details__meta">
                <div className="task-details__meta-row">
                  <p className="task-details__meta-label">Прогресс выполнения:</p>
                  <div className="task-details__meta-value">{selectedTask.progress}%</div>
                </div>
                <div className="task-details__meta-row">
                  <p className="task-details__meta-label">Тип задания:</p>
                  <div className="task-details__meta-value">
                    {TASK_CATEGORY_LABELS[selectedTask.category]}
                  </div>
                </div>
              </div>

              <div className="task-details__description">
                {selectedTask.name}
              </div>
            </>
          ) : (
            <div className="task-details__placeholder">
              {TASK_DETAILS_PLACEHOLDER}
            </div>
          )}
        </aside>
      ) : (
        <TaskPanel
          ref={taskPanelRef}
          tasks={taskWidgetItems}
          isLoading={tasksLoading}
          initialArchivedEmpty
          onTaskListRefresh={refreshTaskListOnly}
          actionButtonLabel={
            activeTab === 'reporting' ? TASK_PANEL_ACTION_REPORT : TASK_PANEL_ACTION_ARCHIVE
          }
          onTaskCompletedStatisticsRefresh={refreshTasksAndProgressStatistics}
          debugAlertState={DEBUG_DASHBOARD_ALERT_STATE}
        />
      )}
    </>
  );
};
