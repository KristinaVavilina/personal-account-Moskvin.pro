import { useState } from 'react';
import closeIcon from '../../assets/icons/close-icon.svg';
import { handleOverlayClick } from '../../utils';
import './ChangePasswordModal.scss';

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordModalProps {
  onClose: () => void;
  /** Если передан — вызывается при успешной локальной проверке; при throw текст ошибки показывается в модалке. */
  onSubmit?: (payload: ChangePasswordPayload) => void | Promise<void>;
}

export const ChangePasswordModal = ({ onClose, onSubmit }: ChangePasswordModalProps) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    const oldTrim = oldPassword.trim();
    const newTrim = newPassword.trim();
    const repeatTrim = repeatPassword.trim();
    if (!oldTrim || !newTrim || !repeatTrim) {
      setError('Заполните все поля.');
      return;
    }
    if (newTrim !== repeatTrim) {
      setError('Пароли не совпадают.');
      return;
    }
    if (!onSubmit) {
      onClose();
      return;
    }
    try {
      await Promise.resolve(onSubmit({ oldPassword: oldTrim, newPassword: newTrim }));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сменить пароль.');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, onClose)}>
      <div
        className="modal-password"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-password-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-password__header">
          <h2 className="modal-password__title" id="modal-password-title">
            Смена пароля
          </h2>
          <button type="button" className="modal-password__close-btn" onClick={onClose} aria-label="Закрыть">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="modal-password__body">
          <div className="modal-password__group">
            <label className="modal-password__label" htmlFor="modal-password-old">
              Старый пароль
            </label>
            <input
              id="modal-password-old"
              className="modal-password__field"
              type="password"
              name="oldPassword"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                setError(null);
              }}
              placeholder="Введите текущий пароль"
            />
          </div>
          <div className="modal-password__group">
            <label className="modal-password__label" htmlFor="modal-password-new">
              Новый пароль
            </label>
            <input
              id="modal-password-new"
              className="modal-password__field"
              type="password"
              name="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError(null);
              }}
              placeholder="Введите новый пароль"
            />
          </div>
          <div className="modal-password__group">
            <label className="modal-password__label" htmlFor="modal-password-repeat">
              Повторите пароль
            </label>
            <input
              id="modal-password-repeat"
              className="modal-password__field"
              type="password"
              name="repeatPassword"
              autoComplete="new-password"
              value={repeatPassword}
              onChange={(e) => {
                setRepeatPassword(e.target.value);
                setError(null);
              }}
              placeholder="Повторите новый пароль"
            />
          </div>
        </div>

        <div className="modal-password__error-slot" aria-live="polite">
          {error ? (
            <p className="modal-password__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <button type="button" className="modal-password__submit" onClick={() => void handleSave()}>
          Сохранить
        </button>
      </div>
    </div>
  );
};
