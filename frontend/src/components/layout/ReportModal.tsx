import { useEffect, useState } from 'react';
import { SaveActionButton } from '../SaveActionButton';
import closeIcon from '../../assets/icons/close-icon.svg';
import dropdownArrowIcon from '../../assets/icons/dropdown-arrow-icon.svg';
import { handleOverlayClick } from '../../utils';
import { TASK_PROGRESS_STEPS, progressToDropdownLabel } from '../../utils/taskProgress';
import type { TaskListItem } from './taskListTypes';
import { normalizeReportTimeForApi } from '../../utils/reportTimeInput';
import { ReportTimeMaskedInput } from './ReportTimeMaskedInput';
import './ReportModal.scss';

export interface ReportSavePayload {
  taskId: string;
  newProgress: number;
  taskType: string;
  taskDescription: string;
  workDescription: string;
  timeStart: string;
  timeEnd: string;
}

interface ReportModalProps {
  onClose: () => void;
  /** Активные задания из списка (имя в селекте — как в виджете). */
  tasks: TaskListItem[];
  onReportSave: (payload: ReportSavePayload) => void | Promise<void>;
}

type Dropdown = 'task' | 'progress' | null;

function allowedProgressLabels(current: number): string[] {
  return TASK_PROGRESS_STEPS.filter((s) => s > current).map((n) => `${n}%`);
}

export const ReportModal = ({ onClose, tasks, onReportSave }: ReportModalProps) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [openDropdown, setOpenDropdown] = useState<Dropdown>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : undefined;
  const progressOptions = selectedTask ? allowedProgressLabels(selectedTask.progress) : [];

  useEffect(() => {
    if (!selectedTask) {
      setTaskType(null);
      setTaskProgress(null);
      setDescription('');
      return;
    }
    setTaskType(selectedTask.taskType);
    setDescription(selectedTask.description ?? '');
    const labels = allowedProgressLabels(selectedTask.progress);
    const next = labels[0] ?? null;
    setTaskProgress(next);
  }, [selectedTaskId, selectedTask]);

  const toggleDropdown = (name: Dropdown) =>
    setOpenDropdown((prev) => (prev === name ? null : name));

  const handleSave = async () => {
    setFormError(null);
    if (!selectedTaskId || !selectedTask) {
      setFormError('Выберите задание.');
      return;
    }
    if (!taskType) {
      setFormError('Укажите тип задания.');
      return;
    }
    if (!taskProgress || !progressOptions.includes(taskProgress)) {
      setFormError('Выберите прогресс выше текущего.');
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

    const newProgress = Number.parseInt(taskProgress.replace('%', ''), 10);
    if (!Number.isFinite(newProgress)) {
      setFormError('Некорректный прогресс.');
      return;
    }

    setIsSaving(true);
    try {
      await Promise.resolve(
        onReportSave({
          taskId: selectedTaskId,
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

  const selectedTaskName = selectedTask?.name ?? null;

  return (
    <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, onClose)}>
      <div
        className="modal-report modal-report--create"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-report-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-report__header">
          <h2 className="modal-report__title" id="modal-report-title">
            Добавление новой отчётности
          </h2>
          <button type="button" className="modal-report__close-btn" onClick={onClose} aria-label="Закрыть">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="modal-report__body">
          <div className="modal-report__col-left">
            <div className="modal-report__select-field">
              <button
                type="button"
                className="modal-report__select-summary"
                onClick={() => toggleDropdown('task')}
                aria-expanded={openDropdown === 'task'}
              >
                <span className={selectedTaskName ? 'modal-report__select-value' : 'modal-report__select-placeholder'}>
                  {selectedTaskName ?? 'Выберите задание'}
                </span>
                <img
                  className="modal-report__select-arrow"
                  src={dropdownArrowIcon}
                  alt=""
                  aria-hidden="true"
                  style={{ transform: openDropdown === 'task' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {openDropdown === 'task' && (
                <div className="modal-report__select-menu" role="listbox" aria-label="Выберите задание">
                  {tasks.length === 0 && (
                    <div className="modal-report__select-option" role="presentation">
                      Нет активных заданий
                    </div>
                  )}
                  {tasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={
                        'modal-report__select-option' +
                        (t.id === selectedTaskId ? ' modal-report__select-option--active' : '')
                      }
                      role="option"
                      aria-selected={t.id === selectedTaskId}
                      onClick={() => {
                        setSelectedTaskId(t.id);
                        setOpenDropdown(null);
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
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
                    <span className="type-selector__label">
                      {!selectedTask ? 'Сначала выберите задание' : (taskType ?? '—')}
                    </span>
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
                    disabled={!selectedTask || progressOptions.length === 0}
                  >
                    <span className="type-selector__label">
                      {!selectedTask
                        ? 'Сначала выберите задание'
                        : progressOptions.length === 0
                          ? `Уже ${progressToDropdownLabel(selectedTask.progress)}`
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

            <div className="modal-task__textarea-field">
              <textarea
                placeholder="Описание задания..."
                value={description}
                readOnly
                aria-readonly="true"
              />
            </div>
          </div>

          <div className="modal-report__col-right">
            <div className="modal-report__time-row">
              <span className="modal-report__time-label">Время выполнения задания</span>
              <div className="modal-report__time-inputs">
                <div className="modal-report__time-field">
                  <ReportTimeMaskedInput
                    id="report-create-time-start"
                    value={timeStart}
                    onChange={setTimeStart}
                  />
                </div>
                <span className="modal-report__time-separator">-</span>
                <div className="modal-report__time-field">
                  <ReportTimeMaskedInput
                    id="report-create-time-end"
                    value={timeEnd}
                    onChange={setTimeEnd}
                  />
                </div>
              </div>
            </div>

            <div className="modal-task__textarea-field">
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
