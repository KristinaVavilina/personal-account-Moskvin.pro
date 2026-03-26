import { useEffect, useReducer, useState } from 'react';
import taskTypeIcon from '../../assets/icons/task-type-icon.svg';
import { getActiveTaskListFromMocks } from '../../mocks/taskListFromMockTask';
import { AddTaskModal } from './AddTaskModal';
import { EditTaskModal } from './EditTaskModal';
import { ArchiveModal } from './ArchiveModal';
import { ReportModal } from './ReportModal';
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


interface TaskPanelProps {
  tasks?: TaskListItem[];
  isLoading?: boolean;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
  debugAlertState?: AlertState | null;
}

const defaultTasks: TaskListItem[] = getActiveTaskListFromMocks();

export const TaskPanel = ({
  tasks = defaultTasks,
  isLoading = false,
  actionButtonLabel = TASK_PANEL_ACTION_ARCHIVE,
  onActionButtonClick,
  debugAlertState = null,
}: TaskPanelProps) => {
  const [panel, dispatch] = useReducer(
    taskPanelTasksReducer,
    tasks,
    createInitialTaskPanelState,
  );
  const { taskList, archivedList } = panel;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskListItem | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    dispatch({ type: 'SYNC_TASKS', tasks });
  }, [tasks]);

  const archiveModalRows = archivedList.map((a) => ({
    id: a.task.id,
    name: a.task.name,
    daysLeft: a.daysLeft,
  }));

  const handleDeleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TO_ARCHIVE', id });
  };

  const handleRestoreTask = (id: string) => {
    dispatch({ type: 'RESTORE_FROM_ARCHIVE', id });
  };

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

        <button className="btn btn--add-task" onClick={() => setIsModalOpen(true)}>
          Добавить задание
        </button>
      </div>

      <button className="btn task-panel__action-btn" onClick={handleActionClick}>
        {actionButtonLabel}
      </button>

      {isModalOpen && (
        <AddTaskModal
          onClose={() => setIsModalOpen(false)}
          onAdd={(task) => dispatch({ type: 'ADD_TASK', task })}
        />
      )}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updated) => dispatch({ type: 'UPDATE_TASK', task: updated })}
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
      {isReportOpen && <ReportModal onClose={() => setIsReportOpen(false)} />}

      <AlertMessage debugState={debugAlertState} />
    </div>
  );
};
