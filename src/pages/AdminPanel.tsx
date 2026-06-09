import { useState } from 'react';
import { Database, Calendar } from 'lucide-react';
import SeedPanel from '@/components/admin/SeedPanel';
import ChallengesPanel from '@/components/admin/ChallengesPanel';

type Tab = 'seed' | 'challenges';

const styles = {
  root: 'min-h-screen bg-app-bg flex font-gabarito',
  sidebar: 'w-64 bg-surface border-r border-border flex flex-col flex-shrink-0',
  sidebarHeader: 'p-6 border-b border-border',
  sidebarTitle: 'text-xl font-bold text-text-main font-gabarito',
  nav: 'flex-1 p-4 flex flex-col gap-2',
  tabActive:
    'flex items-center gap-3 px-4 py-3 rounded-btn text-sm font-medium transition-colors bg-primary text-white',
  tabInactive:
    'flex items-center gap-3 px-4 py-3 rounded-btn text-sm font-medium transition-colors text-text-muted hover:text-text-main hover:bg-app-bg',
  main: 'flex-1 overflow-y-auto',
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('seed');

  return (
    <div className={styles.root}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Panel Admin</h1>
        </div>
        <nav className={styles.nav}>
          <button
            onClick={() => setActiveTab('seed')}
            className={activeTab === 'seed' ? styles.tabActive : styles.tabInactive}
          >
            <Database size={18} />
            Seed de Animes
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={activeTab === 'challenges' ? styles.tabActive : styles.tabInactive}
          >
            <Calendar size={18} />
            Challenges diarios
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        {activeTab === 'seed' && <SeedPanel />}
        {activeTab === 'challenges' && <ChallengesPanel />}
      </main>
    </div>
  );
}
