import closeIcon from '../../assets/icons/close-icon.svg';
import { handleOverlayClick } from '../../utils';
import { progressToDropdownLabel } from '../../utils/taskProgress';
import type { TaskListItem } from './taskListTypes';
import './ReportModal.scss';

export interface TaskViewModalProps {
  task: TaskListItem;
  onClose: () => void;
}

export const TaskViewModal = ({ task, onClose }: TaskViewModalProps) => {
  const progressLabel = progressToDropdownLabel(task.progress);
  const descText = task.description?.trim()
    ? task.description.trim()
    : 'Описание задания не заполнено.';

  return (
    <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, onClose)}>
      <div
        className="modal-report modal-report--view modal-report--task-view"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-task-view-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-report__header">
          <h2 className="modal-report__title" id="modal-task-view-title">
            Просмотр задания
          </h2>
          <button type="button" className="modal-report__close-btn" onClick={onClose} aria-label="Закрыть">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="modal-report__body">
          <div className="modal-report__col-left modal-report__col-left--view modal-report__col-task-view">
            <div className="modal-report__select-field modal-report__select-field--readonly">
              <div
                className="modal-report__select-summary modal-report__select-summary--readonly"
                role="group"
                aria-label="Название задания"
              >
                <span className="modal-report__select-value">{task.name}</span>
              </div>
            </div>

            <div className="modal-task__form-rows">
              <div className="modal-task__form-row modal-task__form-row--type">
                <span className="modal-task__label">Тип задания</span>
                <div className="type-selector type-selector--readonly">
                  <div className="type-selector__summary" role="status" aria-label="Тип задания">
                    <span className="type-selector__label">{task.taskType || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-task__form-row modal-task__form-row--progress">
                <span className="modal-task__label">Прогресс выполнения</span>
                <div className="type-selector type-selector--readonly">
                  <div className="type-selector__summary" role="status" aria-label="Прогресс">
                    <span className="type-selector__label">{progressLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-task__textarea-field modal-task__textarea-field--task-desc modal-task__textarea-field--view">
              <textarea value={descText} readOnly tabIndex={-1} aria-readonly="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
