import { PAGE_TAB_ITEMS, type Tab } from '../../constants';
import './PageTabs.scss';

export type { Tab };

interface PageTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const PageTabs = ({ activeTab, onTabChange }: PageTabsProps) => {
  return (
    <div className="page-tabs" role="tablist" aria-label="Навигация по страницам">
      {PAGE_TAB_ITEMS.map(({ id, label }) => (
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
