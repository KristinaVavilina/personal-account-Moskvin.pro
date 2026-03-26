import { useState } from 'react';
import closeIcon from '../../assets/icons/close-icon.svg';
import deleteTaskIcon from '../../assets/icons/delete-task-icon.svg';
import dropdownArrowIcon from '../../assets/icons/dropdown-arrow-icon.svg';
import { handleOverlayClick, labelToProgressNumber, progressToDropdownLabel } from '../../utils';
import { TASK_TYPES, TASK_PROGRESS } from '../../constants';
import type { TaskListItem } from './taskListTypes';
import './AddTaskModal.scss';
import './EditTaskModal.scss';

interface EditTaskModalProps {
  task: TaskListItem;
  onClose: () => void;
  onSave: (updated: TaskListItem) => void;
  onDelete: (id: string) => void;
}

export const EditTaskModal = ({ task, onClose, onSave, onDelete }: EditTaskModalProps) => {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description ?? '');
  const [taskType, setTaskType] = useState<string>(
    task.taskType && TASK_TYPES.includes(task.taskType) ? task.taskType : TASK_TYPES[0],
  );
  const [taskProgress, setTaskProgress] = useState<string>(() => progressToDropdownLabel(task.progress));
  const [openDropdown, setOpenDropdown] = useState<'type' | 'progress' | null>(null);

  const toggleDropdown = (dropdown: 'type' | 'progress') =>
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));

  const handleSave = () => {
    onSave({
      ...task,
      name,
      description,
      taskType,
      progress: labelToProgressNumber(taskProgress),
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, onClose)}>
      <div
        className="modal-task"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-edit-task-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-task__header">
          <h2 className="modal-task__title" id="modal-edit-task-title">
            Редактирование задания
          </h2>
          <button className="modal-task__close-btn" onClick={onClose} aria-label="Закрыть" type="button">
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
                  <span className="type-selector__label">{taskType}</span>
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
                        type="button"
                        className={
                          'type-selector__option' + (type === taskType ? ' type-selector__option--active' : '')
                        }
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
                  <span className="type-selector__label">{taskProgress}</span>
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
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-task__footer modal-task__footer--edit">
          <button
            type="button"
            className="modal-task__delete-btn"
            onClick={handleDelete}
            aria-label="Удалить задание"
          >
            <img src={deleteTaskIcon} alt="" />
          </button>
          <button type="button" className="modal-task__save-btn" onClick={handleSave}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
