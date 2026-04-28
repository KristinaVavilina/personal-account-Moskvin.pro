import closeIcon from '../../assets/icons/close-icon.svg';
import restoreIcon from '../../assets/icons/restore-icon.svg';
import { handleOverlayClick } from '../../utils';
import './ArchiveModal.scss';

export interface ArchiveModalTaskRow {
  id: string;
  name: string;
  daysLeft: number;
}

interface ArchiveModalProps {
  onClose: () => void;
  tasks?: ArchiveModalTaskRow[];
  isLoading?: boolean;
  onRestore?: (taskId: string) => void;
}

export const ArchiveModal = ({
  onClose,
  tasks = [],
  isLoading = false,
  onRestore,
}: ArchiveModalProps) => {
  return (
    <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, onClose)}>
      <div
        className="modal-archive"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-archive-title"
      >
        <div className="modal-archive__header">
          <h2 className="modal-archive__title" id="modal-archive-title">
            Архив заданий
          </h2>
          <button className="modal-archive__close-btn" onClick={onClose} aria-label="Закрыть">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="modal-archive__body">
          {isLoading && (
            <div className="modal-archive__spinner" aria-label="Загрузка" />
          )}

          <div className="modal-archive__list">
            {!isLoading && tasks.length === 0 && (
              <div className="modal-archive__empty">
                <span className="modal-archive__empty-icon">📦</span>
                <span>Архив пуст</span>
              </div>
            )}

            {!isLoading &&
              tasks.length > 0 &&
              tasks.map((task) => (
                <div key={task.id} className="archive-item">
                  <p className="archive-item__name">{task.name}</p>
                  <p className="archive-item__expiry">
                    Удалится через: {task.daysLeft} дней
                  </p>
                  <button
                    className="archive-item__restore-btn"
                    onClick={() => onRestore?.(task.id)}
                    aria-label="Восстановить"
                    type="button"
                  >
                    <img src={restoreIcon} alt="" />
                  </button>
                </div>
              ))}
          </div>
          <div className="modal-archive__inner-shadow" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};
