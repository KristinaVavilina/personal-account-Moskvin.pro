import { useState } from 'react';
import closeIcon from '../../assets/icons/close-icon.svg';
import dropdownArrowIcon from '../../assets/icons/dropdown-arrow-icon.svg';
import { handleOverlayClick } from '../../utils';
import { BENEFIT_RATINGS, WORKLOAD_RATINGS } from '../../constants';
import './StatusReportModal.scss';

interface StatusReportModalProps {
  onClose: () => void;
  onSave?: () => void;
}

type Dropdown = 'benefit' | 'workload' | null;

export const StatusReportModal = ({ onClose, onSave }: StatusReportModalProps) => {
  const [benefit, setBenefit] = useState<string | null>(null);
  const [workload, setWorkload] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<Dropdown>(null);

  const toggleDropdown = (name: Dropdown) =>
    setOpenDropdown((prev) => (prev === name ? null : name));

  return (
    <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, onClose)}>
      <div
        className="modal-status"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-status-title"
      >
        <div className="modal-status__header">
          <h2 className="modal-status__title" id="modal-status-title">
            Отчетность состояния
          </h2>
          <button className="modal-status__close-btn" onClick={onClose} aria-label="Закрыть">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="modal-status__body">
          <div className="modal-status__form-row">
            <span className="modal-status__label">Оценка пользы в компании</span>
            <div className={'type-selector' + (openDropdown === 'benefit' ? ' type-selector--open' : '')}>
              <button
                className="type-selector__summary"
                onClick={() => toggleDropdown('benefit')}
                aria-expanded={openDropdown === 'benefit'}
                aria-label="Выбрать оценку пользы"
              >
                <span className="type-selector__label">{benefit ?? 'Выбрать'}</span>
                <img
                  className="type-selector__icon"
                  src={dropdownArrowIcon}
                  alt=""
                  aria-hidden="true"
                  style={{ transform: openDropdown === 'benefit' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {openDropdown === 'benefit' && (
                <div className="type-selector__menu" role="listbox" aria-label="Оценка пользы">
                  {BENEFIT_RATINGS.map((value) => (
                    <button
                      key={value}
                      className={'type-selector__option' + (value === benefit ? ' type-selector__option--active' : '')}
                      role="option"
                      aria-selected={value === benefit}
                      onClick={() => { setBenefit(value); setOpenDropdown(null); }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-status__form-row">
            <span className="modal-status__label">Оценка загруженности работой</span>
            <div className={'type-selector' + (openDropdown === 'workload' ? ' type-selector--open' : '')}>
              <button
                className="type-selector__summary"
                onClick={() => toggleDropdown('workload')}
                aria-expanded={openDropdown === 'workload'}
                aria-label="Выбрать оценку загруженности"
              >
                <span className="type-selector__label">{workload ?? 'Выбрать'}</span>
                <img
                  className="type-selector__icon"
                  src={dropdownArrowIcon}
                  alt=""
                  aria-hidden="true"
                  style={{ transform: openDropdown === 'workload' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {openDropdown === 'workload' && (
                <div className="type-selector__menu" role="listbox" aria-label="Оценка загруженности">
                  {WORKLOAD_RATINGS.map((value) => (
                    <button
                      key={value}
                      className={'type-selector__option' + (value === workload ? ' type-selector__option--active' : '')}
                      role="option"
                      aria-selected={value === workload}
                      onClick={() => { setWorkload(value); setOpenDropdown(null); }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button className="modal-status__save-btn" onClick={onSave}>Сохранить</button>
      </div>
    </div>
  );
};
