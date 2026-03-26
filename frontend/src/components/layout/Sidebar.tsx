import { NavLink, useLocation } from 'react-router-dom';
import moskvinLogo from '../../assets/icons/moskvin-logo.svg';
import progressIcon from '../../assets/icons/progress-icon.svg';
import knowledgeBaseIcon from '../../assets/icons/knowlege-base-icon.svg';
import employeesIcon from '../../assets/icons/employees-icon.svg';
import profileIcon from '../../assets/icons/profile-icon.svg';
import { ROUTE } from '../../constants';
import { isDashboardPath } from '../../utils';
import './Sidebar.scss';

export const Sidebar = () => {
  const { pathname } = useLocation();
  const isDashboardActive = isDashboardPath(pathname);

  return (
    <aside className="sidebar">
      <a
        href="https://moskvin.pro/"
        className="sidebar__logo sidebar__item"
        aria-label="На сайт"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={moskvinLogo} alt="Moskvin Logo" />
      </a>

      <nav className="sidebar__menu" aria-label="Боковое меню">
        <NavLink
          to={ROUTE.PROGRESS}
          className={'sidebar__item' + (isDashboardActive ? ' sidebar__item--active' : '')}
          aria-label="Прогресс"
        >
          <img src={progressIcon} alt="Прогресс" />
        </NavLink>
        <NavLink
          to="#"
          className="sidebar__item"
          aria-label="База знаний"
        >
          <img src={knowledgeBaseIcon} alt="База знаний" />
        </NavLink>
        <NavLink
          to="#"
          className="sidebar__item"
          aria-label="Сотрудники"
        >
          <img src={employeesIcon} alt="Сотрудники" />
        </NavLink>
      </nav>

      <NavLink
        to={ROUTE.PROFILE}
        className={({ isActive }) =>
          'sidebar__profile sidebar__item' + (isActive ? ' sidebar__item--active' : '')
        }
        aria-label="Профиль"
      >
        <img src={profileIcon} alt="Профиль" />
      </NavLink>
    </aside>
  );
};