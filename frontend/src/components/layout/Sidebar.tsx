import React from 'react';
import './Sidebar.scss';

export const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">🍀</div>
      <nav className="sidebar__nav">
        <button className="nav-btn nav-btn--active">📊</button>
        <button className="nav-btn">📚</button>
        <button className="nav-btn">👥</button>
      </nav>
      <div className="sidebar__profile">
        <button className="nav-btn">👤</button>
      </div>
    </aside>
  );
};