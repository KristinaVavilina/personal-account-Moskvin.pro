import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchActiveTasksForDashboard } from '../../api/tasks';
import { PageTabs } from '../../components/layout/PageTabs';
import { TaskPanel } from '../../components/layout/TaskPanel';
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
  const [tasksError, setTasksError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTasksLoading(true);
      setTasksError(null);
      try {
        const list = await fetchActiveTasksForDashboard();
        if (!cancelled) setTaskWidgetItems(list);
      } catch (e) {
        if (!cancelled) {
          setTasksError(e instanceof Error ? e.message : 'Не удалось загрузить задания');
        }
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

        {activeTab === 'progress' && <ProgressPage />}
        {activeTab === 'reporting'  && <ReportingPage />}
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
        <>
          {tasksError && (
            <aside className="task-panel-api-error" role="alert">
              {tasksError}
            </aside>
          )}
          <TaskPanel
            tasks={taskWidgetItems}
            isLoading={tasksLoading}
            initialArchivedEmpty
            actionButtonLabel={
              activeTab === 'reporting' ? TASK_PANEL_ACTION_REPORT : TASK_PANEL_ACTION_ARCHIVE
            }
            debugAlertState={DEBUG_DASHBOARD_ALERT_STATE}
          />
        </>
      )}
    </>
  );
};
