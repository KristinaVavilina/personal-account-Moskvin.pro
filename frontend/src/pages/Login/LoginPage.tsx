import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { MOCK_LOGIN_CREDENTIALS, ROUTE } from '../../constants';
import { useUserStore } from '../../store/useUserStore';
import { AuthCard } from '../../components/layout/AuthCard';

function isMockLoginAllowed(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === MOCK_LOGIN_CREDENTIALS.email.toLowerCase() &&
    password === MOCK_LOGIN_CREDENTIALS.password
  );
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const login = useUserStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={ROUTE.PROGRESS} replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isMockLoginAllowed(email, password)) {
      login('Москвин Артём Сергеевич', 'Арт-директор');
      navigate(ROUTE.PROGRESS, { replace: true });
    } else {
      setError(true);
    }
  };

  return (
    <AuthCard>
      <div className="auth-card__header">
        <h1 className="auth-card__title">Добро пожаловать!</h1>
        <p className="auth-card__subtitle">Личный кабинет компании Moskvin.pro</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__fields">
          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="login-email">
              Email
            </label>
            <input
              className="auth-form__input"
              id="login-email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => { setEmail(e.target.value); setError(false); }}
            />
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="login-password">
              Пароль
            </label>
            <input
              className="auth-form__input"
              id="login-password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
            />
          </div>
        </div>

        <p
          className={`auth-form__error${error ? ' auth-form__error--visible' : ''}`}
          aria-live="polite"
        >
          Неправильный email или пароль
        </p>

        <button className="auth-form__submit" type="submit">
          Вход
        </button>
      </form>
    </AuthCard>
  );
};
