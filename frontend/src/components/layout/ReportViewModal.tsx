import closeIcon from '../../assets/icons/close-icon.svg';
import { handleOverlayClick } from '../../utils';
import { progressToDropdownLabel } from '../../utils/taskProgress';
import type { ApiTimeLogRow } from '../../types/timeLogApi';
import { apiTimeToHmInput } from '../../utils/reportTimeInput';
import './ReportModal.scss';

export interface ReportViewModalProps {
  log: ApiTimeLogRow;
  taskTitle: string;
  taskTypeLabel: string;
  taskDescription: string | null;
  onClose: () => void;
}

export const ReportViewModal = ({
  log,
  taskTitle,
  taskTypeLabel,
  taskDescription,
  onClose,
}: ReportViewModalProps) => {
  const progressLabel = progressToDropdownLabel(log.progressSnapshot ?? 0);
  const workText = log.comment?.trim()
    ? log.comment.trim()
    : 'Комментарий к выполненной работе не указан.';
  const descText = taskDescription?.trim()
    ? taskDescription.trim()
    : 'Описание задания не заполнено.';

  return (
    <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, onClose)}>
      <div
        className="modal-report modal-report--view"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-report-view-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-report__header">
          <h2 className="modal-report__title" id="modal-report-view-title">
            Просмотр отчёта
          </h2>
          <button type="button" className="modal-report__close-btn" onClick={onClose} aria-label="Закрыть">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="modal-report__body">
          <div className="modal-report__col-left modal-report__col-left--view">
            <div className="modal-report__select-field modal-report__select-field--readonly">
              <div
                className="modal-report__select-summary modal-report__select-summary--readonly"
                role="group"
                aria-label="Задание по отчёту"
              >
                <span className="modal-report__select-value">{taskTitle}</span>
              </div>
            </div>

            <div className="modal-task__form-rows">
              <div className="modal-task__form-row modal-task__form-row--type">
                <span className="modal-task__label">Тип задания</span>
                <div className="type-selector type-selector--readonly">
                  <div className="type-selector__summary" role="status" aria-label="Тип задания">
                    <span className="type-selector__label">{taskTypeLabel || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-task__form-row modal-task__form-row--progress">
                <span className="modal-task__label">Прогресс на момент записи</span>
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

          <div className="modal-report__col-right modal-report__col-right--view">
            <div className="modal-report__time-row">
              <span className="modal-report__time-label">Время выполнения задания</span>
              <div className="modal-report__time-values-readonly">
                <span className="modal-report__time-value-chip">{apiTimeToHmInput(log.startTime)}</span>
                <span className="modal-report__time-separator">-</span>
                <span className="modal-report__time-value-chip">{apiTimeToHmInput(log.endTime)}</span>
              </div>
            </div>

            <div className="modal-task__textarea-field modal-task__textarea-field--view">
              <span className="modal-report__readonly-label">Описание работы по интервалу</span>
              <textarea value={workText} readOnly tabIndex={-1} aria-readonly="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
