import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUserProfile } from '../../api/profile';
import { ChangePasswordModal } from '../../components/layout/ChangePasswordModal';
import { apiUserRoleLabel } from '../../constants/userRoles';
import { DEFAULT_PROFILE_AVATAR_URL, ROUTE } from '../../constants';
import { useUserStore } from '../../store/useUserStore';
import { splitFullNameRu } from '../../utils/splitFullNameRu';
import type { ApiUserResponse } from '../../types/userApi';
import './Profile.scss';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const logout = useUserStore((s) => s.logout);
  const [profile, setProfile] = useState<ApiUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const p = await fetchCurrentUserProfile();
        if (!cancelled) setProfile(p);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Не удалось загрузить профиль');
          setProfile(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (localAvatarUrl?.startsWith('blob:')) URL.revokeObjectURL(localAvatarUrl);
    };
  }, [localAvatarUrl]);

  const nameParts = useMemo(
    () =>
      profile
        ? splitFullNameRu(profile.fullName)
        : { lastName: '', firstName: '', patronymic: '' },
    [profile],
  );

  const roleLine = useMemo(() => {
    if (!profile) return '';
    const role = apiUserRoleLabel(profile.role);
    const pos = profile.positionName?.trim();
    return pos ? `${role} · ${pos}` : role;
  }, [profile]);

  const avatarSrc =
    localAvatarUrl ??
    (profile?.photoUrl && profile.photoUrl.trim().length > 0
      ? profile.photoUrl.trim()
      : DEFAULT_PROFILE_AVATAR_URL);

  const handleLogout = () => {
    logout();
    navigate(ROUTE.LOGIN, { replace: true });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalAvatarUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  return (
    <main className="main-content">
      {isChangePasswordOpen && (
        <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />
      )}
      <section
        className={`account-card${isLoading ? ' account-card--loading' : ''}`}
        aria-label="Данные аккаунта"
      >
        <div className="account-card__inner-shadow" aria-hidden="true" />

        <div className="account-card__content">
          {isLoading && <div className="account-card__spinner" aria-label="Загрузка" />}

          {!isLoading && loadError && (
            <p className="account-card__error" role="alert">
              {loadError}
            </p>
          )}

          {!isLoading && !loadError && !profile && (
            <p className="account-card__empty">Не удалось найти пользователя в каталоге.</p>
          )}

          {!isLoading && !loadError && profile && (
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
                  {roleLine}
                </div>
              </div>

              <form className="account-form" aria-label="Форма профиля">
                <div className="account-grid">
                  <div className="field">
                    <label className="field__label" htmlFor="firstName">
                      Имя
                    </label>
                    <div className="field__control">
                      <input
                        className="field__input"
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={nameParts.firstName}
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
                    <label className="field__label" htmlFor="lastName">
                      Фамилия
                    </label>
                    <div className="field__control">
                      <input
                        className="field__input"
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={nameParts.lastName}
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
                    <label className="field__label" htmlFor="patronymic">
                      Отчество
                    </label>
                    <div className="field__control">
                      <input
                        className="field__input"
                        id="patronymic"
                        name="patronymic"
                        type="text"
                        value={nameParts.patronymic}
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
                    <label className="field__label" htmlFor="email">
                      Email
                    </label>
                    <div className="field__control">
                      <input
                        className="field__input"
                        id="email"
                        name="email"
                        type="email"
                        value={profile.email}
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
          )}

          {!isLoading && (
            <div className="account-actions" aria-label="Действия аккаунта">
              <button
                className="btn btn--action"
                type="button"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                Сменить пароль
              </button>
              <button className="btn btn--action" type="button" onClick={handleLogout}>
                Выйти из аккаунта
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
