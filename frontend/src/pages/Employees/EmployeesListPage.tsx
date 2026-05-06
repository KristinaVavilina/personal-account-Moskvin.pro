import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import searchIcon from '../../assets/icons/search-icon.svg';
import { fetchEmployeesDirectory } from '../../api/users';
import type { ApiUserResponse } from '../../api/users';
import { DEFAULT_PROFILE_AVATAR_URL } from '../../constants';
import { employeeStatisticsPath } from './employeesPaths';
import './Employees.scss';

export const EmployeesListPage = () => {
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<ApiUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchEmployeesDirectory();
        if (!cancelled) setRows(list);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Не удалось загрузить список');
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const blob = `${r.fullName} ${r.email} ${r.positionName ?? ''}`.toLowerCase();
      return blob.includes(q);
    });
  }, [query, rows]);

  return (
    <main className="main-content employees-page">
      <div className="employees-page__surface">
        <header className="employees-page__header">
          <h1 className="employees-page__title">
            Выберите сотрудника для просмотра его статистики
          </h1>
          <div className="employees-page__search">
            <img src={searchIcon} alt="" className="employees-page__search-icon" />
            <input
              type="search"
              className="employees-page__search-input"
              placeholder="Поиск"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              aria-label="Поиск по сотрудникам"
            />
          </div>
        </header>

        <div className="employees-page__list-sheet">
          {loading && <div className="employees-page__spinner" aria-label="Загрузка" />}
          {!loading && error && (
            <div className="employees-page__empty" role="alert">
              <span className="employees-page__empty-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {!loading && !error && rows.length === 0 && (
            <div className="employees-page__empty">
              <span className="employees-page__empty-icon">📭</span>
              <span>В каталоге пока нет сотрудников</span>
            </div>
          )}
          {!loading && !error && rows.length > 0 && filtered.length === 0 && (
            <div className="employees-page__empty">
              <span className="employees-page__empty-icon">🔍</span>
              <span>Никого не нашли — попробуйте другой запрос</span>
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <div className="employees-page__list">
              {filtered.map((u) => (
                <Link
                  key={u.id}
                  to={employeeStatisticsPath(u.id)}
                  className="employees-card"
                  aria-label={`Статистика: ${u.fullName}`}
                >
                  <div className="employees-card__avatar-wrap">
                    <img
                      src={u.photoUrl || DEFAULT_PROFILE_AVATAR_URL}
                      alt=""
                      className="employees-card__avatar"
                    />
                  </div>
                  <div className="employees-card__meta">
                    <div className="employees-card__name">{u.fullName}</div>
                    <div className="employees-card__role">
                      {u.positionName ?? 'Должность не указана'}
                    </div>
                    <div className="employees-card__email">{u.email}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
