import { useState } from 'react';
import { Database, Calendar } from 'lucide-react';
import rekkoLogo from '@/assets/rekko_logo.png';
import SeedPanel from '@/components/admin/SeedPanel';
import ChallengesPanel from '@/components/admin/ChallengesPanel';

type Tab = 'seed' | 'challenges';

const styles = {
  root:        'min-h-screen bg-app-bg font-gabarito',
  inner:       'flex min-h-screen mx-[6%]',
  sidebar:     'w-[220px] flex-shrink-0 bg-surface border-r border-border flex flex-col',
  sidebarTop:  'px-5 py-5 border-b border-border flex flex-col gap-1',
  logo:        'h-7 object-contain self-start',
  sidebarLabel:'text-[11px] font-semibold text-text-muted uppercase tracking-wider mt-0.5',
  nav:         'flex-1 px-3 py-4 flex flex-col gap-1',
  tabActive:   'flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-semibold transition-all bg-primary/10 text-primary border-l-[3px] border-primary',
  tabInactive: 'flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-all text-text-secondary hover:text-text-main hover:bg-app-bg border-l-[3px] border-transparent',
  main:        'flex-1 overflow-y-auto',
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('seed');

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <img src={rekkoLogo} alt="Rekko" className={styles.logo} />
          <span className={styles.sidebarLabel}>Admin</span>
        </div>
        <nav className={styles.nav}>
          <button
            onClick={() => setActiveTab('seed')}
            className={activeTab === 'seed' ? styles.tabActive : styles.tabInactive}
          >
            <Database size={16} />
            Seed de Animes
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={activeTab === 'challenges' ? styles.tabActive : styles.tabInactive}
          >
            <Calendar size={16} />
            Challenges diarios
          </button>
        </nav>
      </aside>

      <main className={styles.main}>
        {activeTab === 'seed' && <SeedPanel />}
        {activeTab === 'challenges' && <ChallengesPanel />}
      </main>
      </div>
    </div>
  );
}
