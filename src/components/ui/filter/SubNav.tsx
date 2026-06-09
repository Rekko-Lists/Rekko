import { Settings2 } from 'lucide-react';

const TABS = ['View All', 'Top Anime', 'Seasonal Anime', 'By Genre'];

interface SubNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleFilter: () => void;
  filterOpen: boolean;
}

const styles = {
  nav:       'bg-app-bg font-gabarito px-[6%]',
  inner:     'flex items-end',
  tabs:      'flex flex-1 items-end gap-0.5',
  active:    "px-5 pt-2 pb-[9px] text-sm font-semibold bg-accent text-white rounded-t-[5px] cursor-pointer relative after:content-[''] after:absolute after:bottom-[-1px] after:inset-x-0 after:h-px after:bg-primary",
  tab:       'px-4 pt-2 pb-[9px] text-sm text-text-secondary cursor-pointer hover:text-text-main bg-transparent',
  filterBtn: 'flex items-center gap-1.5 text-sm text-text-secondary cursor-pointer pb-[9px] hover:text-text-main',
};

export default function SubNav({ activeTab, onTabChange, onToggleFilter, filterOpen }: SubNavProps) {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={tab === activeTab ? styles.active : styles.tab}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <button className={styles.filterBtn} onClick={onToggleFilter}>
        Filter <Settings2 size={14} className={filterOpen ? 'text-primary' : ''} />
      </button>
      </div>
    </nav>
  );
}
