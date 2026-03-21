import './PageTabs.scss';

export type Tab = 'statistics' | 'reporting' | 'calendar';

interface PageTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'statistics', label: 'Прогресс' },
  { id: 'reporting',  label: 'Отчёт' },
  { id: 'calendar',   label: 'Календарь' },
];

export const PageTabs = ({ activeTab, onTabChange }: PageTabsProps) => {
  return (
    <div className="page-tabs" role="tablist" aria-label="Навигация по страницам">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          className={'page-tabs__item' + (activeTab === id ? ' page-tabs__item--active' : '')}
          role="tab"
          aria-selected={activeTab === id}
          onClick={() => onTabChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
