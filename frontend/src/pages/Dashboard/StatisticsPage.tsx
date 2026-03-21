import './Statistics.scss';

interface TimelineItem {
  id: number;
  category: string;
  startHour: number;
  durationHours: number;
  label: string;
}

const timelineData: TimelineItem[] = [];
const isTimelineLoading = true;

const statsData: number | null = null;
const isStatsLoading = true;

const chartData: unknown[] = [];
const isChartLoading = true;

const balanceData: unknown[] = [];
const isBalanceLoading = true;

export const StatisticsPage = () => {
  return (
    <div className="dashboard-grid">
      <div className="widget widget--timeline">
        {isTimelineLoading && (
          <div className="widget__spinner" aria-label="Загрузка" />
        )}
        <p className="widget__title">Хронология дня</p>
        <div className="widget__content">
          {!isTimelineLoading && timelineData.length === 0 && (
            <div className="widget__content-empty">
              <span className="widget__content-empty-icon">📭</span>
              <span>За сегодня нет данных</span>
            </div>
          )}
          {!isTimelineLoading && timelineData.length > 0 && (
            <div className="timeline-chart">
              {/* timeline items will be rendered here */}
            </div>
          )}
        </div>
        {!isTimelineLoading && timelineData.length > 0 && (
          <div className="legend-list">
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--task" />
              <span>Задачи</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--discussion" />
              <span>Обсуждения</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--other" />
              <span>Прочее</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--education" />
              <span>Обучение</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--routine" />
              <span>Рутина</span>
            </div>
          </div>
        )}
      </div>

      <div className="widget widget--stats">
        {isStatsLoading && (
          <div className="widget__spinner" aria-label="Загрузка" />
        )}
        <p className="widget__title">В этом месяце выполнено заданий</p>
        <div className="widget__content">
          {!isStatsLoading && statsData === null && (
            <div className="widget__content-empty">
              <span className="widget__content-empty-icon">📭</span>
              <span>Нет данных за этот месяц</span>
            </div>
          )}
          {!isStatsLoading && statsData !== null && (
            <div className="stats-chart">
              {/* stats content will be rendered here */}
            </div>
          )}
        </div>
      </div>

      <div className="widget widget--chart">
        {isChartLoading && (
          <div className="widget__spinner" aria-label="Загрузка" />
        )}
        <p className="widget__title">График пользы и загруженности</p>
        <div className="widget__content">
          {!isChartLoading && chartData.length === 0 && (
            <div className="widget__content-empty">
              <span className="widget__content-empty-icon">📭</span>
              <span>Нет данных для отображения</span>
            </div>
          )}
          {!isChartLoading && chartData.length > 0 && (
            <div className="benefit-chart">
              {/* chart content will be rendered here */}
            </div>
          )}
        </div>
        {!isChartLoading && chartData.length > 0 && (
          <div className="legend-list">
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--discussion" />
              <span>Польза</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--danger" />
              <span>Загруженность</span>
            </div>
          </div>
        )}
      </div>

      <div className="widget widget--balance">
        {isBalanceLoading && (
          <div className="widget__spinner" aria-label="Загрузка" />
        )}
        <p className="widget__title">Баланс недели</p>
        <div className="widget__content">
          {!isBalanceLoading && balanceData.length === 0 && (
            <div className="widget__content-empty">
              <span className="widget__content-empty-icon">📭</span>
              <span>Нет данных за эту неделю</span>
            </div>
          )}
          {!isBalanceLoading && balanceData.length > 0 && (
            <div className="balance-chart">
              {/* balance content will be rendered here */}
            </div>
          )}
        </div>
        {!isBalanceLoading && balanceData.length > 0 && (
          <div className="legend-list">
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--task" />
              <span>Задачи</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--discussion" />
              <span>Обсуждения</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--other" />
              <span>Прочее</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--education" />
              <span>Обучение</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__marker legend-item__marker--routine" />
              <span>Рутина</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
