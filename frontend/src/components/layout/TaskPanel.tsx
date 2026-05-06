import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useReducer,
  useState,
} from 'react';
import taskTypeIcon from '../../assets/icons/task-type-icon.svg';
import { getActiveTaskListFromMocks } from '../../mocks/taskListFromMockTask';
import {
  createTask,
  deleteTask,
  fetchTaskById,
  updateTask,
} from '../../api/tasks';
import { createTimeLog } from '../../api/timeLogs';
import { fetchTaskTypes, taskTypeLabelToTypeIdString } from '../../api/taskTypes';
import { USE_PROGRESS_MOCK } from '../../config/progressSource';
import { resolveDevUserId } from '../../api/devUser';
import { normalizeReportTimeForApi } from '../../utils/reportTimeInput';
import { formatLocalDateIso } from '../../utils/progressDashboardTransform';
import { useReportEntriesStore } from '../../store/useReportEntriesStore';
import { AddTaskModal } from './AddTaskModal';
import { EditTaskModal } from './EditTaskModal';
import { ArchiveModal } from './ArchiveModal';
import { ReportModal, type ReportSavePayload } from './ReportModal';
import { AlertMessage } from './AlertMessage';
import {
  type AlertState,
  TASK_PANEL_ACTION_ARCHIVE,
  TASK_PANEL_ACTION_REPORT,
} from '../../constants';
import type { TaskListItem } from './taskListTypes';
import { createInitialTaskPanelState, taskPanelTasksReducer } from './taskPanelReducer';
import './TaskPanel.scss';

export type { ArchivedTaskRecord, TaskListItem } from './taskListTypes';

/** Синхронизация списка заданий с сохранением отчёта с вкладки «Отчёт». */
export type TaskPanelHandle = {
  getTaskById: (id: string) => TaskListItem | null;
  applyTaskUpdateFromReport: (payload: ReportSavePayload) => void;
};

interface TaskPanelProps {
  tasks?: TaskListItem[];
  isLoading?: boolean;
  /** Не подмешивать демо-архив из моков (данные с API). */
  initialArchivedEmpty?: boolean;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
  /** После успешной мутации задач/таймлогов на сервере — обновить список с API (без сброса виджетов прогресса). */
  onTaskListRefresh?: () => void | Promise<void>;
  /** При переводе задания в «выполнено» (100%) — обновление статистики и хронологии дня. */
  onTaskCompletedStatisticsRefresh?: (task: TaskListItem) => void;
  debugAlertState?: AlertState | null;
}

const defaultTasks: TaskListItem[] = getActiveTaskListFromMocks();

export const TaskPanel = forwardRef<TaskPanelHandle, TaskPanelProps>(function TaskPanel(
  {
    tasks = defaultTasks,
    isLoading = false,
    initialArchivedEmpty = false,
    actionButtonLabel = TASK_PANEL_ACTION_ARCHIVE,
    onActionButtonClick,
    onTaskCompletedStatisticsRefresh,
    onTaskListRefresh,
    debugAlertState = null,
  },
  ref,
) {
  const [panel, dispatch] = useReducer(
    taskPanelTasksReducer,
    { tasks, emptyArchive: initialArchivedEmpty },
    (init) => createInitialTaskPanelState(init.tasks, { emptyArchive: init.emptyArchive }),
  );
  const { taskList, archivedList } = panel;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskListItem | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    dispatch({ type: 'SYNC_TASKS', tasks });
  }, [tasks]);

  const getTaskById = useCallback(
    (id: string): TaskListItem | null => {
      const active = taskList.find((t) => t.id === id);
      if (active) return active;
      return archivedList.find((a) => a.task.id === id)?.task ?? null;
    },
    [taskList, archivedList],
  );

  const applyTaskUpdateFromReport = useCallback(
    (payload: ReportSavePayload) => {
      const found = getTaskById(payload.taskId);
      if (!found) return;
      const wasComplete = found.progress === 100;
      const updated: TaskListItem = {
        ...found,
        progress: payload.newProgress,
        description: payload.taskDescription,
        taskType: payload.taskType,
      };
      const inActive = taskList.some((t) => t.id === payload.taskId);
      if (inActive) {
        dispatch({ type: 'UPDATE_TASK', task: updated });
      } else {
        dispatch({ type: 'UPDATE_ARCHIVED_TASK', task: updated });
      }
      if (updated.progress === 100 && !wasComplete) {
        onTaskCompletedStatisticsRefresh?.(updated);
      }

      if (!USE_PROGRESS_MOCK) {
        void (async () => {
          try {
            const raw = await fetchTaskById(payload.taskId);
            const types = await fetchTaskTypes();
            const typeId = taskTypeLabelToTypeIdString(types, payload.taskType);
            if (!typeId) return;
            await updateTask(payload.taskId, {
              userId: raw.userId,
              typeId,
              title: found.name,
              description: payload.taskDescription,
              currentProgress: payload.newProgress,
            });
            await onTaskListRefresh?.();
          } catch {
            /* локальный стейт уже обновлён */
          }
        })();
      }
    },
    [getTaskById, taskList, onTaskCompletedStatisticsRefresh, onTaskListRefresh],
  );

  useImperativeHandle(
    ref,
    () => ({
      getTaskById,
      applyTaskUpdateFromReport,
    }),
    [getTaskById, applyTaskUpdateFromReport],
  );

  const archiveModalRows = archivedList.map((a) => ({
    id: a.task.id,
    name: a.task.name,
    daysLeft: a.daysLeft,
  }));

  const notifyIfCompleted = (task: TaskListItem) => {
    if (task.progress === 100) onTaskCompletedStatisticsRefresh?.(task);
  };

  const handleDeleteTask = async (id: string) => {
    const task = taskList.find((t) => t.id === id);
    if (!USE_PROGRESS_MOCK) {
      try {
        await deleteTask(id);
        await onTaskListRefresh?.();
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Не удалось удалить задание на сервере');
      }
      return;
    }
    dispatch({ type: 'DELETE_TO_ARCHIVE', id });
    if (task && task.progress === 100) onTaskCompletedStatisticsRefresh?.(task);
  };

  const handleRestoreTask = (id: string) => {
    dispatch({ type: 'RESTORE_FROM_ARCHIVE', id });
  };

  const handleReportSave = useCallback(
    async (payload: ReportSavePayload) => {
      const task = taskList.find((t) => t.id === payload.taskId);
      if (!task) return;

      const userId = await resolveDevUserId();

      const updated: TaskListItem = {
        ...task,
        progress: payload.newProgress,
        description: payload.taskDescription,
        taskType: payload.taskType,
      };

      if (!USE_PROGRESS_MOCK) {
        try {
          if (!userId) throw new Error('Не удалось определить пользователя');
          const raw = await fetchTaskById(payload.taskId);
          const types = await fetchTaskTypes();
          const typeId = taskTypeLabelToTypeIdString(types, payload.taskType);
          if (!typeId) throw new Error('Тип задания не найден на сервере');
          await updateTask(payload.taskId, {
            userId: raw.userId,
            typeId,
            title: task.name,
            description: payload.taskDescription,
            currentProgress: payload.newProgress,
          });
          const startT = normalizeReportTimeForApi(payload.timeStart);
          const endT = normalizeReportTimeForApi(payload.timeEnd);
          if (!startT || !endT) throw new Error('Некорректное время');
          const comment =
            payload.workDescription.trim() ||
            (payload.taskDescription.trim() ? payload.taskDescription.trim() : null);
          await createTimeLog({
            taskId: payload.taskId,
            userId,
            date: formatLocalDateIso(new Date()),
            startTime: startT,
            endTime: endT,
            progressSnapshot: payload.newProgress,
            comment,
          });
        } catch (e) {
          window.alert(e instanceof Error ? e.message : 'Ошибка сохранения отчёта на сервере');
          throw e;
        }
      }

      dispatch({ type: 'UPDATE_TASK', task: updated });

      const comment =
        payload.workDescription.trim() ||
        (payload.taskDescription.trim() ? payload.taskDescription.trim() : null);
      useReportEntriesStore.getState().addEntry({
        id: crypto.randomUUID(),
        taskId: payload.taskId,
        userId: userId ?? '',
        date: formatLocalDateIso(new Date()),
        startTime: payload.timeStart,
        endTime: payload.timeEnd,
        progressSnapshot: payload.newProgress,
        comment,
        taskTitle: task.name,
        taskTypeLabel: payload.taskType,
        taskDescriptionSnapshot: payload.taskDescription,
      });

      if (updated.progress === 100) {
        onTaskCompletedStatisticsRefresh?.(updated);
      } else if (!USE_PROGRESS_MOCK) {
        await onTaskListRefresh?.();
      }
    },
    [taskList, onTaskCompletedStatisticsRefresh, onTaskListRefresh],
  );

  const handleActionClick = () => {
    if (onActionButtonClick) {
      onActionButtonClick();
    } else if (actionButtonLabel === TASK_PANEL_ACTION_REPORT) {
      setIsReportOpen(true);
    } else {
      setIsArchiveOpen(true);
    }
  };

  return (
    <div className="task-panel">
      <div className="task-widget">
        {isLoading && (
          <div className="task-widget__spinner" aria-label="Загрузка" />
        )}
        <h2 className="task-widget__title">Список заданий</h2>

        <div className="task-list-wrapper">
          <div className="task-list-viewport">
            {!isLoading && taskList.length === 0 && (
              <div className="task-list-empty">
                <span className="task-list-empty__icon">📭</span>
                <span>Список заданий пуст</span>
              </div>
            )}
            {!isLoading && taskList.length > 0 && (
              <ul className="task-list">
                {taskList.map((task) => (
                  <li
                    key={task.id}
                    className="task-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => setEditingTask(task)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setEditingTask(task);
                      }
                    }}
                  >
                    <div className="task-item__icon-wrapper">
                      <div className="task-item__icon">
                        <img src={taskTypeIcon} alt="" />
                      </div>
                    </div>
                    <div className="task-item__content">
                      <p className="task-item__name">{task.name}</p>
                      <div className="task-item__progress-bar">
                        <div
                          className="task-item__progress-line"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="task-widget__inner-shadow" aria-hidden="true" />
        </div>

        <button type="button" className="btn btn--add-task" onClick={() => setIsModalOpen(true)}>
          Добавить задание
        </button>
      </div>

      <button type="button" className="btn task-panel__action-btn" onClick={handleActionClick}>
        {actionButtonLabel}
      </button>

      {isModalOpen && (
        <AddTaskModal
          onClose={() => setIsModalOpen(false)}
          onAdd={async (task) => {
            if (!USE_PROGRESS_MOCK) {
              try {
                const userId = await resolveDevUserId();
                if (!userId) throw new Error('Не удалось определить пользователя');
                const types = await fetchTaskTypes();
                const typeId = taskTypeLabelToTypeIdString(types, task.taskType);
                if (!typeId) throw new Error('Тип задания не найден на сервере');
                const newId = await createTask({
                  userId,
                  typeId,
                  title: task.name,
                  description: task.description ?? '',
                  currentProgress: task.progress,
                });
                await onTaskListRefresh?.();
                if (task.progress === 100) {
                  onTaskCompletedStatisticsRefresh?.({ ...task, id: newId });
                }
              } catch (e) {
                window.alert(e instanceof Error ? e.message : 'Не удалось создать задание');
                throw e;
              }
              return;
            }
            dispatch({ type: 'ADD_TASK', task });
            notifyIfCompleted(task);
          }}
        />
      )}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={async (updated) => {
            if (!USE_PROGRESS_MOCK) {
              try {
                const raw = await fetchTaskById(updated.id);
                const types = await fetchTaskTypes();
                const typeId = taskTypeLabelToTypeIdString(types, updated.taskType);
                if (!typeId) throw new Error('Тип задания не найден на сервере');
                await updateTask(updated.id, {
                  userId: raw.userId,
                  typeId,
                  title: updated.name,
                  description: updated.description ?? '',
                  currentProgress: updated.progress,
                });
                await onTaskListRefresh?.();
              } catch (e) {
                window.alert(e instanceof Error ? e.message : 'Не удалось сохранить задание');
                throw e;
              }
            }
            dispatch({ type: 'UPDATE_TASK', task: updated });
            notifyIfCompleted(updated);
          }}
          onDelete={handleDeleteTask}
        />
      )}
      {isArchiveOpen && (
        <ArchiveModal
          onClose={() => setIsArchiveOpen(false)}
          tasks={archiveModalRows}
          onRestore={handleRestoreTask}
        />
      )}
      {isReportOpen && (
        <ReportModal
          tasks={taskList}
          onClose={() => setIsReportOpen(false)}
          onReportSave={handleReportSave}
        />
      )}

      <AlertMessage debugState={debugAlertState} />
    </div>
  );
});
