import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/layout/AuthCard';
import { ROUTE } from '../../constants';

export const FirstLoginPage = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password !== confirm) {
      setError(true);
      return;
    }

    // Пароль задан — переходим на страницу входа
    navigate(ROUTE.LOGIN, { replace: true });
  };

  return (
    <AuthCard>
      <div className="auth-card__header">
        <h1 className="auth-card__title">
          Первичная авторизация сотрудников компании Moskvin.pro
        </h1>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__fields">
          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="first-password">
              Придумайте пароль
            </label>
            <input
              className="auth-form__input"
              id="first-password"
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
            />
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="first-confirm">
              Повторите пароль
            </label>
            <input
              className="auth-form__input"
              id="first-confirm"
              type="password"
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => { setConfirm(e.target.value); setError(false); }}
            />
          </div>
        </div>

        <p
          className={`auth-form__error${error ? ' auth-form__error--visible' : ''}`}
          aria-live="polite"
        >
          Пароли не совпадают
        </p>

        <button className="auth-form__submit" type="submit">
          Авторизоваться
        </button>
      </form>
    </AuthCard>
  );
};
