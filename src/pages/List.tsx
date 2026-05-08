import { useState } from 'react';
import { Check, Clock, Edit, Eye, X, Star, type LucideIcon } from 'lucide-react';

interface ListEntry {
  id: string;
  title: string;
  cover?: string;
  status: 'completed' | 'watching' | 'dropped' | 'on_hold' | 'plan_to_watch';
  situation: string;
  progress: string;
  score: number;
}

const MOCK_LIST: ListEntry[] = [
  { id: '1', title: 'Steins;Gate',                      status: 'completed',     situation: 'Finished Airing', progress: '24/24', score: 10 },
  { id: '2', title: 'Frieren: Beyond Journey\'s End',   status: 'watching',      situation: 'Currently Airing', progress: '16/28', score: 9 },
  { id: '3', title: 'Fullmetal Alchemist: Brotherhood', status: 'completed',     situation: 'Finished Airing', progress: '64/64', score: 9 },
  { id: '4', title: 'Vinland Saga Season 2',            status: 'plan_to_watch', situation: 'Finished Airing', progress: '0/24',  score: 0 },
];

const STATUS_TABS = ['All', 'Completed', 'Currently Watching', 'Dropped', 'Plan to watch', 'Waiting'];

const statusIcons: { key: ListEntry['status']; Icon: LucideIcon; bg: string }[] = [
  { key: 'completed',     Icon: Check, bg: 'bg-status-green' },
  { key: 'watching',      Icon: Eye,   bg: 'bg-status-blue'  },
  { key: 'dropped',       Icon: X,     bg: 'bg-status-red'   },
  { key: 'plan_to_watch', Icon: Clock, bg: 'bg-primary'      },
];

const styles = {
  page:      'px-[6%] py-6 font-gabarito',
  topRow:    'flex items-start justify-between mb-4 gap-4 flex-wrap',
  title:     'text-[40px] font-semibold text-text-main leading-none',
  tabRow:    'flex items-center gap-6 border-b border-border',
  tab:       'pb-2 text-sm text-text-secondary cursor-pointer hover:text-text-main transition-colors whitespace-nowrap',
  tabActive: 'pb-2 text-sm font-semibold text-text-main border-b-2 border-primary cursor-pointer whitespace-nowrap',
  table:     'w-full mt-4',
  thead:     'text-left',
  thImg:     'bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-l-[3px] w-[86px]',
  th:        'text-xs font-semibold text-text-secondary px-3 py-1.5',
  row:       'border-b border-border',
  imgCell:   'py-3 px-3',
  avatar:    'w-[73px] h-[74px] rounded-full object-cover bg-gradient-to-br from-slate-400 to-slate-700',
  nameCell:  'py-3 px-3 text-sm font-medium text-text-main',
  statusCell:'py-3 px-3',
  statusBtns:'flex flex-col gap-1.5',
  iconBtn:   'w-[25px] h-[25px] rounded-[4px] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity',
  tdText:    'py-3 px-3 text-sm text-text-main',
  scoreCell: 'py-3 px-3 flex items-center gap-1 text-sm font-semibold text-text-main',
  editBtn:   'w-[25px] h-[25px] rounded-[4px] border border-border flex items-center justify-center cursor-pointer hover:bg-border transition-colors',
  actions:   'py-3 px-3 flex items-center gap-2',
  addBtn:    'w-[30px] h-[30px] rounded-[4px] border border-border flex items-center justify-center text-lg font-bold text-text-secondary cursor-pointer hover:bg-border',
};

export default function List() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All'
    ? MOCK_LIST
    : MOCK_LIST.filter(e => {
        const map: Record<string, ListEntry['status']> = {
          'Completed':          'completed',
          'Currently Watching': 'watching',
          'Dropped':            'dropped',
          'Plan to watch':      'plan_to_watch',
        };
        return e.status === map[activeTab];
      });

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <h1 className={styles.title}>My List -</h1>
        <div className={styles.tabRow}>
          {STATUS_TABS.map(t => (
            <button key={t} className={t === activeTab ? styles.tabActive : styles.tab} onClick={() => setActiveTab(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.thImg}>Image</th>
            <th className={styles.th} />
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Situation</th>
            <th className={styles.th}>Progress</th>
            <th className={styles.th}>Score</th>
            <th className={styles.th} />
          </tr>
        </thead>
        <tbody>
          {filtered.map(entry => (
            <tr key={entry.id} className={styles.row}>
              <td className={styles.imgCell}>
                <div className={styles.avatar} />
              </td>
              <td className={styles.nameCell}>{entry.title}</td>
              <td className={styles.statusCell}>
                <div className={styles.statusBtns}>
                  {statusIcons.map(({ key, Icon, bg }) => (
                    <button key={key} className={`${styles.iconBtn} ${bg}`}>
                      <Icon size={15} className="text-white" />
                    </button>
                  ))}
                </div>
              </td>
              <td className={styles.tdText}>{entry.situation}</td>
              <td className={styles.tdText}>{entry.progress}</td>
              <td className={styles.scoreCell}>
                {entry.score > 0 && (
                  <>
                    {entry.score}
                    <Star size={18} fill="#FF9E00" className="text-primary" />
                  </>
                )}
              </td>
              <td className={styles.actions}>
                <button className={styles.editBtn}><Edit size={12} className="text-text-secondary" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
