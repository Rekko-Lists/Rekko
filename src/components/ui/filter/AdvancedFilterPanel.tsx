import { useState } from 'react';
import { X } from 'lucide-react';

export interface AdvancedFilterValues {
  genres: string[];
  episodesMin?: number;
  episodesMax?: number;
  ratingMin: number;
  ratingMax: number;
  type?: string;
  season?: string;
  yearFrom?: number;
  yearTo?: number;
}

interface AdvancedFilterPanelProps {
  availableGenres: { value: string; label: string }[];
  onApply: (values: AdvancedFilterValues) => void;
  onClose: () => void;
}

const INITIAL_VALUES: AdvancedFilterValues = {
  genres: [], ratingMin: 0, ratingMax: 10,
};

const TYPES    = ['TV', 'Movie', 'OVA', 'ONA', 'Special'];
const SEASONS  = ['Spring', 'Summer', 'Fall', 'Winter'];
const VISIBLE_GENRES = 4;

const styles = {
  panel:    'w-[353px] flex-shrink-0 bg-surface border-[1.5px] border-border rounded-card p-5 h-fit mt-4 font-gabarito',
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
  min, max, valueMin, valueMax,
  onChangeMin, onChangeMax,
}: {
  min: number; max: number;
  valueMin: number; valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="relative mt-2 mb-1">
      <div className={styles.track}>
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{ left: `${pct(valueMin)}%`, right: `${100 - pct(valueMax)}%` }}
        />
        <div
          className="absolute w-3.5 h-3.5 bg-primary rounded-full border-2 border-white shadow-card -translate-y-1/2 -translate-x-1/2 pointer-events-none"
          style={{ left: `${pct(valueMin)}%`, top: '50%' }}
        />
        <div
          className="absolute w-3.5 h-3.5 bg-primary rounded-full border-2 border-white shadow-card -translate-y-1/2 -translate-x-1/2 pointer-events-none"
          style={{ left: `${pct(valueMax)}%`, top: '50%' }}
        />
      </div>
      <input
        type="range" min={min} max={max} step={0.5} value={valueMin}
        onChange={e => onChangeMin(Math.min(Number(e.target.value), valueMax - 0.5))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 -top-2"
        style={{ zIndex: valueMin > max - 5 ? 5 : 3 }}
      />
      <input
        type="range" min={min} max={max} step={0.5} value={valueMax}
        onChange={e => onChangeMax(Math.max(Number(e.target.value), valueMin + 0.5))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 -top-2"
        style={{ zIndex: 4 }}
      />
      <div className="flex justify-between text-[10px] text-text-muted mt-4">
        {[0, 2, 4, 6, 8, 10].map(n => <span key={n}>{n}{n === 10 ? '★' : ''}</span>)}
      </div>
    </div>
  );
}

export default function AdvancedFilterPanel({ availableGenres, onApply, onClose }: AdvancedFilterPanelProps) {
  const [values, setValues] = useState<AdvancedFilterValues>(INITIAL_VALUES);
  const [open, setOpen] = useState({ genre: true, episodes: false, rating: true, type: false, season: true, year: true });
  const [showAllGenres, setShowAllGenres] = useState(false);

  const toggle = (key: keyof typeof open) =>
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleGenre = (v: string) =>
    setValues(prev => ({
      ...prev,
      genres: prev.genres.includes(v) ? prev.genres.filter(g => g !== v) : [...prev.genres, v],
    }));

  const visibleGenres = showAllGenres ? availableGenres : availableGenres.slice(0, VISIBLE_GENRES);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Advanced Filter</span>
        <button onClick={onClose}><X size={14} className="text-text-muted hover:text-text-main" /></button>
      </div>

      <div className={styles.section}>
        <SectionHeader label="Genre" open={open.genre} onToggle={() => toggle('genre')} />
        <div className={styles.body} style={{ maxHeight: open.genre ? '200px' : '0px' }}>
          <div className={styles.genreGrid}>
            {visibleGenres.map(g => (
              <GenreRadio
                key={g.value}
                label={g.label}
                active={values.genres.includes(g.value)}
                onClick={() => toggleGenre(g.value)}
              />
            ))}
          </div>
          {!showAllGenres && availableGenres.length > VISIBLE_GENRES && (
            <button className={styles.moreBtn} onClick={() => setShowAllGenres(true)}>
              more genres +
            </button>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <SectionHeader label="Episodes" open={open.episodes} onToggle={() => toggle('episodes')} />
        <div className={styles.body} style={{ maxHeight: open.episodes ? '80px' : '0px', overflow: 'hidden' }}>
          <div className="flex items-center gap-2 mt-1.5">
            <input
              type="number" placeholder="Min"
              className={styles.numInput}
              value={values.episodesMin ?? ''}
              onChange={e => setValues(prev => ({ ...prev, episodesMin: e.target.value ? Number(e.target.value) : undefined }))}
            />
            <span className="text-xs text-text-muted">to</span>
            <input
              type="number" placeholder="Max"
              className={styles.numInput}
              value={values.episodesMax ?? ''}
              onChange={e => setValues(prev => ({ ...prev, episodesMax: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <SectionHeader label="Rating" open={open.rating} onToggle={() => toggle('rating')} />
        <div className={styles.body} style={{ maxHeight: open.rating ? '80px' : '0px', overflow: 'hidden' }}>
          <DualRangeSlider
            min={0} max={10}
            valueMin={values.ratingMin} valueMax={values.ratingMax}
            onChangeMin={v => setValues(prev => ({ ...prev, ratingMin: v }))}
            onChangeMax={v => setValues(prev => ({ ...prev, ratingMax: v }))}
          />
        </div>
      </div>

      <div className={styles.section}>
        <SectionHeader label="Type" open={open.type} onToggle={() => toggle('type')} />
        <div className={styles.body} style={{ maxHeight: open.type ? '120px' : '0px', overflow: 'hidden' }}>
          <div className={styles.genreGrid} style={{ marginTop: '6px' }}>
            {TYPES.map(t => (
              <GenreRadio
                key={t} label={t}
                active={values.type === t}
                onClick={() => setValues(prev => ({ ...prev, type: prev.type === t ? undefined : t }))}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <SectionHeader label="Season" open={open.season} onToggle={() => toggle('season')} />
        <div className={styles.body} style={{ maxHeight: open.season ? '60px' : '0px', overflow: 'hidden' }}>
          <select
            className={styles.select}
            value={values.season ?? ''}
            onChange={e => setValues(prev => ({ ...prev, season: e.target.value || undefined }))}
          >
            <option value=""></option>
            {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <SectionHeader label="Year" open={open.year} onToggle={() => toggle('year')} />
        <div className={styles.body} style={{ maxHeight: open.year ? '60px' : '0px', overflow: 'hidden' }}>
          <div className="flex items-center gap-2 mt-1.5">
            <input
              type="number" placeholder="From"
              className={styles.numInput}
              value={values.yearFrom ?? ''}
              onChange={e => setValues(prev => ({ ...prev, yearFrom: e.target.value ? Number(e.target.value) : undefined }))}
            />
            <span className="text-xs text-text-muted">to</span>
            <input
              type="number" placeholder="To"
              className={styles.numInput}
              value={values.yearTo ?? ''}
              onChange={e => setValues(prev => ({ ...prev, yearTo: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button className={styles.applyBtn} onClick={() => onApply(values)}>
          Apply Filter
        </button>
      </div>
    </div>
  );
}
