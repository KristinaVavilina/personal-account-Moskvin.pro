import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import './Profile.scss';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=60';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const logout = useUserStore((s) => s.logout);
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarSrc(url);
  };

  return (
    <main className="main-content">
      <section className="account-card" aria-label="Данные аккаунта">
        <div className="account-card__inner-shadow" aria-hidden="true" />

        <div className="account-card__content">
          <div className="profile-widget__body">
            <div className="account-header">
              <button
                className="account-avatar"
                type="button"
                aria-label="Загрузить фото профиля"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={avatarSrc} alt="Фото профиля" />
                <span className="account-avatar__overlay" aria-hidden="true">
                  Загрузить фото
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="account-avatar__input"
                aria-hidden="true"
                tabIndex={-1}
                onChange={handleAvatarChange}
              />
              <div className="account-role" aria-label="Роль пользователя">
                Разработчик
              </div>
            </div>

            <form className="account-form" aria-label="Форма профиля">
              <div className="account-grid">
                <div className="field">
                  <label className="field__label" htmlFor="firstName">Имя</label>
                  <div className="field__control">
                    <input
                      className="field__input"
                      id="firstName"
                      name="firstName"
                      type="text"
                      defaultValue="Иван"
                      readOnly
                    />
                    <button
                      className="field__icon"
                      type="button"
                      aria-label="Поле недоступно для редактирования"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="lastName">Фамилия</label>
                  <div className="field__control">
                    <input
                      className="field__input"
                      id="lastName"
                      name="lastName"
                      type="text"
                      defaultValue="Иванов"
                      readOnly
                    />
                    <button
                      className="field__icon"
                      type="button"
                      aria-label="Поле недоступно для редактирования"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="patronymic">Отчество</label>
                  <div className="field__control">
                    <input
                      className="field__input"
                      id="patronymic"
                      name="patronymic"
                      type="text"
                      defaultValue="Иванович"
                      readOnly
                    />
                    <button
                      className="field__icon"
                      type="button"
                      aria-label="Поле недоступно для редактирования"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="email">Email</label>
                  <div className="field__control">
                    <input
                      className="field__input"
                      id="email"
                      name="email"
                      type="email"
                      defaultValue="1234@mail.com"
                      readOnly
                    />
                    <button
                      className="field__icon"
                      type="button"
                      aria-label="Поле недоступно для редактирования"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="account-actions" aria-label="Действия аккаунта">
            <button className="btn btn--action" type="button">Сменить пароль</button>
            <button className="btn btn--action" type="button" onClick={handleLogout}>Выйти из аккаунта</button>
          </div>
        </div>
      </section>
    </main>
  );
};
