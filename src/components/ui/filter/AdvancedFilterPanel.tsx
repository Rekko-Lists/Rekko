import { X } from 'lucide-react';
import { computeSeasonOptions, type SeasonOption } from '@/lib/seasonUtils';

export interface AdvancedFilterValues {
  genres: string[];
  episodesMin?: number;
  episodesMax?: number;
  ratingMin: number;
  ratingMax: number;
  type?: string;
  seasonKey?: string;
}

export const INITIAL_FILTER_VALUES: AdvancedFilterValues = {
  genres: [], ratingMin: 0, ratingMax: 10,
};

interface AdvancedFilterPanelProps {
  availableGenres: { value: string; label: string }[];
  seasonOptions?: SeasonOption[];
  // Estado controlado — el padre lo persiste entre aperturas
  values: AdvancedFilterValues;
  onValuesChange: (values: AdvancedFilterValues) => void;
  onApply: () => void;
  onClose: () => void;
}

const TYPES          = ['TV', 'Movie', 'OVA', 'ONA', 'Special'];
const VISIBLE_GENRES = 12;

const styles = {
  panel:    'w-[461px] min-h-[569px] flex-shrink-0 bg-surface border-[1.5px] border-border rounded-card px-6 py-8 h-fit font-gabarito self-start mt-4 sticky top-[180px]',
  header:   'flex items-center justify-between mb-4',
  title:    'font-semibold text-sm',
  section:  'mb-3',
  sectionHd:'flex items-center justify-between cursor-pointer py-0.5 select-none',
  sectionLb:'text-xs font-semibold text-text-secondary',
  body:     'overflow-hidden transition-all duration-200',
  radio:    'flex items-center gap-1.5 text-xs cursor-pointer',
  circle:   'w-[10px] h-[10px] rounded-full border flex-shrink-0 transition-colors',
  genreGrid:'grid grid-cols-2 gap-y-1.5 gap-x-2 mt-1.5',
  moreBtn:  'text-primary text-xs cursor-pointer hover:underline mt-1.5 block',
  select:   'h-[34px] border border-border rounded-[5px] px-2 text-sm bg-surface w-full focus:outline-none mt-1',
  numInput: 'h-[34px] border border-border rounded-[5px] px-2 text-sm bg-surface w-[72px] focus:outline-none',
  track:    'relative h-1.5 bg-border rounded-full my-2',
  applyBtn: 'h-[26px] bg-primary text-white rounded-[5px] px-4 text-sm font-semibold cursor-pointer hover:bg-primary-dark transition-colors',
};

import { useState } from 'react';

function SectionHeader({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button className={styles.sectionHd} onClick={onToggle}>
      <span className={styles.sectionLb}>{label} {open ? '−' : '+'}</span>
    </button>
  );
}

function GenreRadio({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <label className={styles.radio} onClick={onClick}>
      <span
        className={styles.circle}
        style={{
          backgroundColor: active ? '#FF9E00' : 'transparent',
          borderColor: active ? '#FF9E00' : '#C5C5C5',
        }}
      />
      {label}
    </label>
  );
}

function DualRangeSlider({
  min, max, valueMin, valueMax, onChangeMin, onChangeMax,
}: {
  min: number; max: number;
  valueMin: number; valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  // El thumb activo siempre queda encima; si ninguno está activo,
  // el izquierdo tiene prioridad cuando están muy juntos.
  const zMin = activeThumb === 'min' ? 5 : activeThumb === 'max' ? 3 : pct(valueMin) >= 50 ? 5 : 3;
  const zMax = activeThumb === 'max' ? 5 : activeThumb === 'min' ? 3 : 4;

  return (
    <div className="relative mt-2 mb-1">
      <div className={styles.track}>
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{ left: `${pct(valueMin)}%`, right: `${100 - pct(valueMax)}%` }}
        />
        <div className="absolute w-3.5 h-3.5 bg-primary rounded-full border-2 border-white shadow-card -translate-y-1/2 -translate-x-1/2 pointer-events-none"
          style={{ left: `${pct(valueMin)}%`, top: '50%' }} />
        <div className="absolute w-3.5 h-3.5 bg-primary rounded-full border-2 border-white shadow-card -translate-y-1/2 -translate-x-1/2 pointer-events-none"
          style={{ left: `${pct(valueMax)}%`, top: '50%' }} />
      </div>
      <input type="range" min={min} max={max} step={0.5} value={valueMin}
        onChange={e => onChangeMin(Math.min(Number(e.target.value), valueMax - 0.5))}
        onMouseDown={() => setActiveThumb('min')}
        onTouchStart={() => setActiveThumb('min')}
        onMouseUp={() => setActiveThumb(null)}
        onTouchEnd={() => setActiveThumb(null)}
        className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 -top-2"
        style={{ zIndex: zMin }} />
      <input type="range" min={min} max={max} step={0.5} value={valueMax}
        onChange={e => onChangeMax(Math.max(Number(e.target.value), valueMin + 0.5))}
        onMouseDown={() => setActiveThumb('max')}
        onTouchStart={() => setActiveThumb('max')}
        onMouseUp={() => setActiveThumb(null)}
        onTouchEnd={() => setActiveThumb(null)}
        className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 -top-2"
        style={{ zIndex: zMax }} />
      <div className="flex justify-between text-[10px] text-text-muted mt-4">
        {[0, 2, 4, 6, 8, 10].map(n => <span key={n}>{n}{n === 10 ? '★' : ''}</span>)}
      </div>
    </div>
  );
}

export default function AdvancedFilterPanel({
  availableGenres, seasonOptions, values, onValuesChange, onApply, onClose,
}: AdvancedFilterPanelProps) {
  const [open, setOpen] = useState({ genre: true, episodes: true, rating: true, type: true, season: true });
  const [showAllGenres, setShowAllGenres] = useState(false);

  const resolvedSeasonOptions = seasonOptions ?? computeSeasonOptions();

  const toggle = (key: keyof typeof open) =>
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  const set = (patch: Partial<AdvancedFilterValues>) =>
    onValuesChange({ ...values, ...patch });

  const toggleGenre = (v: string) =>
    set({
      genres: values.genres.includes(v)
        ? values.genres.filter(g => g !== v)
        : [...values.genres, v],
    });

  const visibleGenres = showAllGenres ? availableGenres : availableGenres.slice(0, VISIBLE_GENRES);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Advanced Filter</span>
        <button onClick={onClose}><X size={14} className="text-text-muted hover:text-text-main" /></button>
      </div>

      {/* Genre */}
      <div className={styles.section}>
        <SectionHeader label="Genre" open={open.genre} onToggle={() => toggle('genre')} />
        <div className={styles.body} style={{ maxHeight: open.genre ? (showAllGenres ? '1600px' : '320px') : '0px', overflowY: showAllGenres ? 'auto' : 'hidden' }}>
          <div className={styles.genreGrid}>
            {visibleGenres.map(g => (
              <GenreRadio key={g.value} label={g.label}
                active={values.genres.includes(g.value)}
                onClick={() => toggleGenre(g.value)} />
            ))}
          </div>
          {availableGenres.length > VISIBLE_GENRES && (
            <button className={styles.moreBtn} onClick={() => setShowAllGenres(v => !v)}>
              {showAllGenres ? 'show less −' : 'more genres +'}
            </button>
          )}
        </div>
      </div>

      {/* Episodes */}
      <div className={styles.section}>
        <SectionHeader label="Episodes" open={open.episodes} onToggle={() => toggle('episodes')} />
        <div className={styles.body} style={{ maxHeight: open.episodes ? '80px' : '0px', overflow: 'hidden' }}>
          <div className="flex items-center gap-2 mt-1.5">
            <input type="number" placeholder="Min" className={styles.numInput}
              value={values.episodesMin ?? ''}
              onChange={e => set({ episodesMin: e.target.value ? Number(e.target.value) : undefined })} />
            <span className="text-xs text-text-muted">to</span>
            <input type="number" placeholder="Max" className={styles.numInput}
              value={values.episodesMax ?? ''}
              onChange={e => set({ episodesMax: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className={styles.section}>
        <SectionHeader label="Rating" open={open.rating} onToggle={() => toggle('rating')} />
        <div className={styles.body} style={{ maxHeight: open.rating ? '80px' : '0px', overflow: 'hidden' }}>
          <DualRangeSlider min={0} max={10}
            valueMin={values.ratingMin} valueMax={values.ratingMax}
            onChangeMin={v => set({ ratingMin: v })}
            onChangeMax={v => set({ ratingMax: v })} />
        </div>
      </div>

      {/* Type */}
      <div className={styles.section}>
        <SectionHeader label="Type" open={open.type} onToggle={() => toggle('type')} />
        <div className={styles.body} style={{ maxHeight: open.type ? '120px' : '0px', overflow: 'hidden' }}>
          <div className={styles.genreGrid} style={{ marginTop: '6px' }}>
            {TYPES.map(t => (
              <GenreRadio key={t} label={t}
                active={values.type === t}
                onClick={() => set({ type: values.type === t ? undefined : t })} />
            ))}
          </div>
        </div>
      </div>

      {/* Season */}
      <div className={styles.section}>
        <SectionHeader label="Season" open={open.season} onToggle={() => toggle('season')} />
        <div className={styles.body} style={{ maxHeight: open.season ? '60px' : '0px', overflow: 'hidden' }}>
          <select className={styles.select}
            value={values.seasonKey ?? ''}
            onChange={e => set({ seasonKey: e.target.value || undefined })}>
            <option value="">Any season</option>
            {resolvedSeasonOptions.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button className={styles.applyBtn} onClick={onApply}>Apply Filter</button>
      </div>
    </div>
  );
}
