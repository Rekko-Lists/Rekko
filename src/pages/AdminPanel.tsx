import { useState } from 'react';
import { Database, Calendar } from 'lucide-react';
import rekkoLogo from '@/assets/rekko_logo.png';
import SeedPanel from '@/components/admin/SeedPanel';
import ChallengesPanel from '@/components/admin/ChallengesPanel';

type Tab = 'seed' | 'challenges';

const styles = {
  root:        'min-h-screen bg-app-bg font-gabarito',
  // Movil: sidebar pasa a ser una barra superior con tabs horizontales
  inner:       'flex min-h-screen flex-col mx-0 md:flex-row md:mx-[6%]',
  sidebar:     'w-full flex-shrink-0 bg-surface border-b border-border flex flex-col md:w-[220px] md:border-b-0 md:border-r',
  sidebarTop:  'px-5 py-4 border-b border-border flex items-center gap-2 md:py-5 md:flex-col md:items-start md:gap-1',
  logo:        'h-7 object-contain self-start',
  sidebarLabel:'text-[11px] font-semibold text-text-muted uppercase tracking-wider md:mt-0.5',
  nav:         'flex flex-row gap-1 px-3 py-2 overflow-x-auto md:flex-1 md:flex-col md:py-4',
  tabActive:   'flex flex-shrink-0 items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-semibold transition-all bg-primary/10 text-primary border-l-[3px] border-primary whitespace-nowrap',
  tabInactive: 'flex flex-shrink-0 items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-all text-text-secondary hover:text-text-main hover:bg-app-bg border-l-[3px] border-transparent whitespace-nowrap',
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
