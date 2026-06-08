import { useState } from 'react';
import { Database, Calendar } from 'lucide-react';
import SeedPanel from '@/components/admin/SeedPanel';
import ChallengesPanel from '@/components/admin/ChallengesPanel';

type Tab = 'seed' | 'challenges';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('seed');

  return (
    <div className="min-h-screen bg-app-bg flex font-gabarito">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-text-main font-gabarito">Panel Admin</h1>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('seed')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'seed'
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text-main hover:bg-app-bg'
            }`}
          >
            <Database size={18} />
            Seed de Animes
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'challenges'
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text-main hover:bg-app-bg'
            }`}
          >
            <Calendar size={18} />
            Challenges diarios
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'seed' && <SeedPanel />}
        {activeTab === 'challenges' && <ChallengesPanel />}
      </main>
    </div>
  );
}
