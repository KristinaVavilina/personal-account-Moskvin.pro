import { useState } from 'react';
import closeIcon from '../../assets/icons/close-icon.svg';
import dropdownArrowIcon from '../../assets/icons/dropdown-arrow-icon.svg';
import { handleOverlayClick } from '../../utils';
import { TASK_TYPES, TASK_PROGRESS, DEFAULT_REPORT_MODAL_TASK_NAMES } from '../../constants';
import './ReportModal.scss';

interface ReportModalProps {
  onClose: () => void;
  onSave?: () => void;
  taskNames?: readonly string[];
}

type Dropdown = 'task' | 'type' | 'progress' | null;

export const ReportModal = ({
  onClose,
  onSave,
  taskNames = DEFAULT_REPORT_MODAL_TASK_NAMES,
}: ReportModalProps) => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [openDropdown, setOpenDropdown] = useState<Dropdown>(null);

  const toggleDropdown = (name: Dropdown) =>
    setOpenDropdown((prev) => (prev === name ? null : name));

  return (
    <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, onClose)}>
      <div
        className="modal-report"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-report-title"
      >
        <div className="modal-report__header">
          <h2 className="modal-report__title" id="modal-report-title">
            Добавление новой отчётности
          </h2>
          <button className="modal-report__close-btn" onClick={onClose} aria-label="Закрыть">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="modal-report__body">
          {/* ─── Left column ─── */}
          <div className="modal-report__col-left">
            <div className="modal-report__select-field">
              <button
                className="modal-report__select-summary"
                onClick={() => toggleDropdown('task')}
                aria-expanded={openDropdown === 'task'}
              >
                <span className={selectedTask ? 'modal-report__select-value' : 'modal-report__select-placeholder'}>
                  {selectedTask ?? 'Выберите задание'}
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
                  {taskNames.map((name) => (
                    <button
                      key={name}
                      className={'modal-report__select-option' + (name === selectedTask ? ' modal-report__select-option--active' : '')}
                      role="option"
                      aria-selected={name === selectedTask}
                      onClick={() => { setSelectedTask(name); setOpenDropdown(null); }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
              <div className="modal-report__select-shadow" aria-hidden="true" />
            </div>

            <div className="modal-task__form-rows">
              <div className="modal-task__form-row modal-task__form-row--type">
                <span className="modal-task__label">Тип задания</span>
                <div className={'type-selector' + (openDropdown === 'type' ? ' type-selector--open' : '')}>
                  <button
                    className="type-selector__summary"
                    onClick={() => toggleDropdown('type')}
                    aria-expanded={openDropdown === 'type'}
                    aria-label="Выбрать тип задания"
                  >
                    <span className="type-selector__label">{taskType ?? 'Выбрать'}</span>
                    <img
                      className="type-selector__icon"
                      src={dropdownArrowIcon}
                      alt=""
                      aria-hidden="true"
                      style={{ transform: openDropdown === 'type' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>

                  {openDropdown === 'type' && (
                    <div className="type-selector__menu" role="listbox" aria-label="Тип задания">
                      {TASK_TYPES.map((type) => (
                        <button
                          key={type}
                          className={'type-selector__option' + (type === taskType ? ' type-selector__option--active' : '')}
                          role="option"
                          aria-selected={type === taskType}
                          onClick={() => { setTaskType(type); setOpenDropdown(null); }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-task__form-row modal-task__form-row--progress">
                <span className="modal-task__label">Прогресс по заданию</span>
                <div className={'type-selector' + (openDropdown === 'progress' ? ' type-selector--open' : '')}>
                  <button
                    className="type-selector__summary"
                    onClick={() => toggleDropdown('progress')}
                    aria-expanded={openDropdown === 'progress'}
                    aria-label="Выбрать прогресс"
                  >
                    <span className="type-selector__label">{taskProgress ?? 'Выбрать'}</span>
                    <img
                      className="type-selector__icon"
                      src={dropdownArrowIcon}
                      alt=""
                      aria-hidden="true"
                      style={{ transform: openDropdown === 'progress' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>

                  {openDropdown === 'progress' && (
                    <div className="type-selector__menu" role="listbox" aria-label="Прогресс по заданию">
                      {TASK_PROGRESS.map((value) => (
                        <button
                          key={value}
                          className={'type-selector__option' + (value === taskProgress ? ' type-selector__option--active' : '')}
                          role="option"
                          aria-selected={value === taskProgress}
                          onClick={() => { setTaskProgress(value); setOpenDropdown(null); }}
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
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* ─── Right column ─── */}
          <div className="modal-report__col-right">
            <div className="modal-report__time-row">
              <span className="modal-report__time-label">Время выполнения задания</span>
              <div className="modal-report__time-inputs">
                <div className="modal-report__time-field">
                  <input
                    type="text"
                    placeholder="чч:мм"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                  />
                </div>
                <span className="modal-report__time-separator">-</span>
                <div className="modal-report__time-field">
                  <input
                    type="text"
                    placeholder="чч:мм"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
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

            <button className="modal-report__save-btn" onClick={onSave}>Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  );
};
