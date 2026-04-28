import { useState } from 'react';
import closeIcon from '../../assets/icons/close-icon.svg';
import dropdownArrowIcon from '../../assets/icons/dropdown-arrow-icon.svg';
import { handleOverlayClick, labelToProgressNumber } from '../../utils';
import { TASK_TYPES, TASK_PROGRESS } from '../../constants';
import type { TaskListItem } from './taskListTypes';
import './AddTaskModal.scss';

interface AddTaskModalProps {
  onClose: () => void;
  onAdd: (task: TaskListItem) => void;
}

export const AddTaskModal = ({ onClose, onAdd }: AddTaskModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'type' | 'progress' | null>(null);

  const toggleDropdown = (name: 'type' | 'progress') =>
    setOpenDropdown((prev) => (prev === name ? null : name));

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      taskType: taskType ?? TASK_TYPES[0],
      progress: labelToProgressNumber(taskProgress ?? TASK_PROGRESS[0]),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, onClose)}>
      <div
        className="modal-task"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-task-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-task__header">
          <h2 className="modal-task__title" id="modal-task-title">
            Добавление нового задания
          </h2>
          <button type="button" className="modal-task__close-btn" onClick={onClose} aria-label="Закрыть">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="modal-task__body">
          <div className="modal-task__input-field">
            <input
              type="text"
              placeholder="Название задания..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="modal-task__form-rows">
            <div className="modal-task__form-row modal-task__form-row--type">
              <span className="modal-task__label">Тип задания</span>
              <div className={'type-selector' + (openDropdown === 'type' ? ' type-selector--open' : '')}>
                <button
                  type="button"
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
                        type="button"
                        key={type}
                        className={'type-selector__option' + (type === taskType ? ' type-selector__option--active' : '')}
                        role="option"
                        aria-selected={type === taskType}
                        onClick={() => {
                          setTaskType(type);
                          setOpenDropdown(null);
                        }}
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
                  type="button"
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
                        type="button"
                        key={value}
                        className={'type-selector__option' + (value === taskProgress ? ' type-selector__option--active' : '')}
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
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-task__footer">
          <button
            type="button"
            className="modal-task__save-btn"
            disabled={!canSave}
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
