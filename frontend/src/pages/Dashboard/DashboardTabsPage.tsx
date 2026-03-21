import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageTabs, type Tab } from '../../components/layout/PageTabs';
import { TaskPanel } from '../../components/layout/TaskPanel';
import { StatisticsPage } from './StatisticsPage';
import { ReportingPage } from './ReportingPage';
import { CalendarPage } from './CalendarPage';
import './Calendar.scss';

const getInitialTab = (pathname: string): Tab => {
  if (pathname.startsWith('/reporting')) return 'reporting';
  if (pathname.startsWith('/calendar')) return 'calendar';
  return 'statistics';
};

export const DashboardTabsPage = () => {
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(() => getInitialTab(pathname));

  return (
    <>
      <main className="main-content">
        <PageTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'statistics' && <StatisticsPage />}
        {activeTab === 'reporting'  && <ReportingPage />}
        {activeTab === 'calendar'   && <CalendarPage />}
      </main>

      {activeTab === 'calendar' ? (
        <aside className="task-details" aria-label="Подробности по заданию">
          <h2 className="task-details__title">Подробности по заданию</h2>

          <div className="task-details__meta">
            <div className="task-details__meta-row">
              <p className="task-details__meta-label">Прогресс выполнения:</p>
              <div className="task-details__meta-value">40%</div>
            </div>
            <div className="task-details__meta-row">
              <p className="task-details__meta-label">Тип задания:</p>
              <div className="task-details__meta-value">Рутина</div>
            </div>
          </div>

          <div className="task-details__description">
            В рамках спецификации современных стандартов, акционеры крупнейших компаний
            представляют собой не что иное, как квинтэссенцию победы маркетинга над разумом
            и должны быть указаны как претенденты на роль ключевых факторов.
          </div>
        </aside>
      ) : (
        <TaskPanel
          actionButtonLabel={
            activeTab === 'reporting' ? 'Заполнить отчётность' : 'Архив заданий'
          }
        />
      )}
    </>
  );
};
