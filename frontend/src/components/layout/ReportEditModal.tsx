import { useEffect, useState } from 'react';
import { SaveActionButton } from '../SaveActionButton';
import closeIcon from '../../assets/icons/close-icon.svg';
import dropdownArrowIcon from '../../assets/icons/dropdown-arrow-icon.svg';
import { handleOverlayClick } from '../../utils';
import { TASK_TYPES } from '../../constants';
import { TASK_PROGRESS_STEPS, progressToDropdownLabel } from '../../utils/taskProgress';
import type { StoredReportEntry } from '../../types/reportEntry';
import type { TaskListItem } from './taskListTypes';
import type { ReportSavePayload } from './ReportModal';
import { apiTimeToHmInput, normalizeReportTimeForApi } from '../../utils/reportTimeInput';
import { ReportTimeMaskedInput } from './ReportTimeMaskedInput';
import './ReportModal.scss';

export type ReportEditSavePayload = ReportSavePayload & { entryId: string };

interface ReportEditModalProps {
  entry: StoredReportEntry;
  onClose: () => void;
  /** Текущее состояние задачи в панели (если есть) — для шагов прогресса выше текущего. */
  getLiveTask: (taskId: string) => TaskListItem | null;
  onSave: (payload: ReportEditSavePayload) => void | Promise<void>;
}

type Dropdown = 'progress' | null;

function allowedProgressLabelsFromBaseline(baseline: number): string[] {
  return TASK_PROGRESS_STEPS.filter((s) => s > baseline).map((n) => `${n}%`);
}

export const ReportEditModal = ({ entry, onClose, getLiveTask, onSave }: ReportEditModalProps) => {
  const [taskType, setTaskType] = useState<string>(
    entry.taskTypeLabel && TASK_TYPES.includes(entry.taskTypeLabel) ? entry.taskTypeLabel : TASK_TYPES[0],
  );
  const [taskProgress, setTaskProgress] = useState<string>(progressToDropdownLabel(entry.progressSnapshot ?? 0));
  const [description, setDescription] = useState(entry.taskDescriptionSnapshot ?? '');
  const [timeStart, setTimeStart] = useState(() => apiTimeToHmInput(entry.startTime));
  const [timeEnd, setTimeEnd] = useState(() => apiTimeToHmInput(entry.endTime));
  const [workDescription, setWorkDescription] = useState(entry.comment?.trim() ?? '');
  const [openDropdown, setOpenDropdown] = useState<Dropdown>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const taskTitle = entry.taskTitle?.trim() || 'Задание';

  useEffect(() => {
    if (entry.taskTypeLabel && TASK_TYPES.includes(entry.taskTypeLabel)) {
      setTaskType(entry.taskTypeLabel);
    }
    setDescription(entry.taskDescriptionSnapshot ?? '');
    setTimeStart(apiTimeToHmInput(entry.startTime));
    setTimeEnd(apiTimeToHmInput(entry.endTime));
    setWorkDescription(entry.comment?.trim() ?? '');

    const liveTask = getLiveTask(entry.taskId);
    const baseline = liveTask?.progress ?? (entry.progressSnapshot ?? 0);
    const next = allowedProgressLabelsFromBaseline(baseline);
    const snapLabel = progressToDropdownLabel(entry.progressSnapshot ?? 0);
    if (next.includes(snapLabel)) {
      setTaskProgress(snapLabel);
    } else if (next.length > 0) {
      setTaskProgress(next[0]!);
    } else {
      setTaskProgress(snapLabel);
    }
  }, [entry, getLiveTask]);

  const live = getLiveTask(entry.taskId);
  const baselineProgress = live != null ? live.progress : (entry.progressSnapshot ?? 0);
  const progressOptions = allowedProgressLabelsFromBaseline(baselineProgress);

  const toggleDropdown = (name: Dropdown) =>
    setOpenDropdown((prev) => (prev === name ? null : name));

  const handleSave = async () => {
    setFormError(null);
    if (!taskType) {
      setFormError('Укажите тип задания.');
      return;
    }
    const startNorm = normalizeReportTimeForApi(timeStart);
    const endNorm = normalizeReportTimeForApi(timeEnd);
    if (!startNorm || !endNorm) {
      setFormError('Укажите время в формате чч:мм (например 09:30).');
      return;
    }
    if (startNorm >= endNorm) {
      setFormError('Время окончания должно быть позже начала.');
      return;
    }
    let newProgress = entry.progressSnapshot ?? 0;
    if (progressOptions.length > 0) {
      if (!taskProgress || !progressOptions.includes(taskProgress)) {
        setFormError('Выберите прогресс выше текущего по заданию.');
        return;
      }
      const parsed = Number.parseInt(taskProgress.replace('%', ''), 10);
      if (!Number.isFinite(parsed)) {
        setFormError('Некорректный прогресс.');
        return;
      }
      newProgress = parsed;
    }

    setIsSaving(true);
    try {
      await Promise.resolve(
        onSave({
          entryId: entry.id,
          taskId: entry.taskId,
          newProgress,
          taskType,
          taskDescription: description,
          workDescription,
          timeStart: startNorm,
          timeEnd: endNorm,
        }),
      );
      onClose();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Не удалось сохранить.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, onClose)}>
      <div
        className="modal-report modal-report--edit"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-report-edit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-report__header">
          <h2 className="modal-report__title" id="modal-report-edit-title">
            Редактирование отчётности
          </h2>
          <button type="button" className="modal-report__close-btn" onClick={onClose} aria-label="Закрыть">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="modal-report__body">
          <div className="modal-report__col-left">
            <div className="modal-report__select-field modal-report__select-field--readonly">
              <div
                className="modal-report__select-summary modal-report__select-summary--readonly"
                role="group"
                aria-label="Задание по отчёту"
              >
                <span className="modal-report__select-value">{taskTitle}</span>
                <img
                  className="modal-report__select-arrow modal-report__select-arrow--muted"
                  src={dropdownArrowIcon}
                  alt=""
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="modal-task__form-rows">
              <div className="modal-task__form-row modal-task__form-row--type">
                <span className="modal-task__label">Тип задания</span>
                <div className="type-selector type-selector--readonly">
                  <div
                    className="type-selector__summary"
                    role="status"
                    aria-live="polite"
                    aria-label="Тип выбранного задания"
                  >
                    <span className="type-selector__label">{taskType ?? '—'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-task__form-row modal-task__form-row--progress">
                <span className="modal-task__label">Прогресс по заданию</span>
                <div className={'type-selector' + (openDropdown === 'progress' ? ' type-selector--open' : '')}>
                  <button
                    type="button"
                    className="type-selector__summary"
                    onClick={() => toggleDropdown('progress')}
                    aria-expanded={openDropdown === 'progress'}
                    aria-label="Выбрать прогресс"
                    disabled={progressOptions.length === 0}
                  >
                    <span className="type-selector__label">
                      {progressOptions.length === 0
                        ? `Уже ${progressToDropdownLabel(baselineProgress)}`
                        : (taskProgress ?? 'Выбрать')}
                    </span>
                    <img
                      className="type-selector__icon"
                      src={dropdownArrowIcon}
                      alt=""
                      aria-hidden="true"
                      style={{ transform: openDropdown === 'progress' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                  {openDropdown === 'progress' && progressOptions.length > 0 && (
                    <div className="type-selector__menu" role="listbox" aria-label="Прогресс по заданию">
                      {progressOptions.map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={
                            'type-selector__option' +
                            (value === taskProgress ? ' type-selector__option--active' : '')
                          }
                          role="option"
                          aria-selected={value === taskProgress}
                          onClick={() => {
                            setTaskProgress(value);
                            setOpenDropdown(null);
                          }}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-task__textarea-field modal-task__textarea-field--task-desc">
              <textarea
                placeholder="Описание задания..."
                value={description}
                readOnly
                tabIndex={-1}
                aria-readonly="true"
              />
            </div>
          </div>

          <div className="modal-report__col-right modal-report__col-right--edit">
            <div className="modal-report__time-row">
              <span className="modal-report__time-label">Время выполнения задания</span>
              <div className="modal-report__time-inputs">
                <div className="modal-report__time-field modal-report__time-field--inset">
                  <ReportTimeMaskedInput
                    id="report-edit-time-start"
                    value={timeStart}
                    onChange={setTimeStart}
                  />
                </div>
                <span className="modal-report__time-separator">-</span>
                <div className="modal-report__time-field modal-report__time-field--inset">
                  <ReportTimeMaskedInput
                    id="report-edit-time-end"
                    value={timeEnd}
                    onChange={setTimeEnd}
                  />
                </div>
              </div>
            </div>

            <div className="modal-task__textarea-field modal-task__textarea-field--work">
              <textarea
                placeholder="Опишите проделанную работу..."
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
              />
            </div>

            {formError && (
              <p className="modal-report__form-error" role="alert">
                {formError}
              </p>
            )}

            <SaveActionButton
              type="button"
              className="modal-report__save-btn"
              isLoading={isSaving}
              onClick={() => void handleSave()}
            >
              Сохранить
            </SaveActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};
