import { useState } from 'react';
import taskTypeIcon from '../../assets/icons/task-type-icon.svg';
import alertBellIcon from '../../assets/icons/alert-bell-icon.svg';
import { AddTaskModal } from './AddTaskModal';
import './TaskPanel.scss';

interface Task {
  id: number;
  name: string;
  progress: number;
}

interface TaskPanelProps {
  tasks?: Task[];
  isLoading?: boolean;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
}

const defaultTasks: Task[] = [
];

// const defaultTasks: Task[] = [
//   { id: 1, name: 'Выполнить монтаж ролика', progress: 70 },
//   { id: 2, name: 'Выполнить монтаж ролика', progress: 40 },
//   { id: 3, name: 'Выполнить монтаж ролика', progress: 20 },
//   { id: 4, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 5, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 6, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 7, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 8, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 9, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 10, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 11, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 12, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 13, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 14, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 15, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 16, name: 'Выполнить монтаж ролика', progress: 90 },
//   { id: 17, name: 'Выполнить монтаж ролика', progress: 90 },  
// ];

export const TaskPanel = ({
  tasks = defaultTasks,
  isLoading = true,
  actionButtonLabel = 'Архив заданий',
  onActionButtonClick,
}: TaskPanelProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="task-panel">
      <div className="task-widget">
        {isLoading && (
          <div className="task-widget__spinner" aria-label="Загрузка" />
        )}
        <h2 className="task-widget__title">Список заданий</h2>

        <div className="task-list-wrapper">
          <div className="task-list-viewport">
            {!isLoading && tasks.length === 0 && (
              <div className="task-list-empty">
                <span className="task-list-empty__icon">📭</span>
                <span>Список заданий пуст</span>
              </div>
            )}
            {!isLoading && tasks.length > 0 && (
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id} className="task-item">
                    <div className="task-item__icon-wrapper">
                      <div className="task-item__icon">
                        <img src={taskTypeIcon} alt="Task Type" />
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

      <button className="btn task-panel__action-btn" onClick={onActionButtonClick}>
        {actionButtonLabel}
      </button>

      {isModalOpen && <AddTaskModal onClose={() => setIsModalOpen(false)} />}

      <div className="alert-message">
        <p className="alert-message__text">
          Необходимо заполнить ежедневную отчётность загруженности и пользы
        </p>
        <img className="alert-message__icon" src={alertBellIcon} alt="Уведомление" />
      </div>
    </div>
  );
};
