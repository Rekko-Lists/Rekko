import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export interface FilterProperty {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  chipGrid?: boolean;
}

interface FilterRow {
  property: string;
  value: string;
}

interface QuickFilterProps {
  properties: FilterProperty[];
  onApply: (rows: FilterRow[]) => void;
  onOpenAdvanced: () => void;
}

const CHIP_VISIBLE = 12;

const styles = {
  wrap:      'flex flex-col gap-2 px-[6%] py-3 font-gabarito',
  row:       'flex items-center gap-2 flex-wrap',
  select:    'h-[36px] border border-border rounded-[5px] px-3 text-sm bg-surface cursor-pointer focus:outline-none text-text-main',
  trash:     'text-text-muted cursor-pointer hover:text-status-red transition-colors',
  applyBtn:  'h-[26px] bg-primary text-white rounded-[5px] px-4 text-sm font-semibold cursor-pointer hover:bg-primary-dark transition-colors',
  addLine:   'flex items-center gap-1.5 text-sm',
  addBtn:    'text-primary cursor-pointer hover:underline font-medium',
  muted:     'text-text-muted',
  advBtn:    'text-text-secondary cursor-pointer hover:text-text-main flex items-center gap-0.5',
  chipWrap:  'flex flex-wrap gap-1.5 mt-1',
  chip:      'text-xs px-3 py-1 rounded-[5px] border cursor-pointer transition-colors',
  chipMore:  'text-primary text-xs cursor-pointer hover:underline mt-1.5 inline-block',
};

function ChipGrid({
  options, selected, showAll, onToggleAll, onSelect,
}: {
  options: { value: string; label: string }[];
  selected: string;
  showAll: boolean;
  onToggleAll: () => void;
  onSelect: (v: string) => void;
}) {
  const visible = showAll ? options : options.slice(0, CHIP_VISIBLE);
  return (
    <div>
      <div className={styles.chipWrap}>
        {visible.map(o => (
          <button
            key={o.value}
            onClick={() => onSelect(o.value)}
            className={`${styles.chip} ${
              selected === o.value
                ? 'bg-primary text-white border-primary'
                : 'bg-surface border-border text-text-main hover:border-primary hover:text-primary'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {options.length > CHIP_VISIBLE && (
        <button className={styles.chipMore} onClick={onToggleAll}>
          {showAll ? 'show less −' : `+${options.length - CHIP_VISIBLE} more`}
        </button>
      )}
    </div>
  );
}

export default function QuickFilter({ properties, onApply, onOpenAdvanced }: QuickFilterProps) {
  const [rows, setRows] = useState<FilterRow[]>([{ property: '', value: '' }]);
  const [showAllChips, setShowAllChips] = useState(false);

  const getProp = (key: string) => properties.find(p => p.key === key);

  function setRowProp(i: number, property: string) {
    setRows(prev => prev.map((r, idx) => idx === i ? { property, value: '' } : r));
  }

  function setRowValue(i: number, value: string) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, value } : r));
  }

  function addRow() {
    setRows(prev => [...prev, { property: '', value: '' }]);
  }

  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleApply() {
    onApply(rows.filter(r => r.property && r.value));
  }

  function handleChipSelect(rowIndex: number, value: string) {
    const newRows = rows.map((r, i) => i === rowIndex ? { ...r, value } : r);
    setRows(newRows);
    onApply(newRows.filter(r => r.property && r.value));
  }

  const getOptions = (propKey: string) => getProp(propKey)?.options ?? [];

  return (
    <div className={styles.wrap}>
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => {
          const prop = getProp(row.property);
          const isGrid = !!prop?.chipGrid;

          return (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <select
                  className={styles.select}
                  value={row.property}
                  onChange={e => setRowProp(i, e.target.value)}
                >
                  {i === 0 && <option value="">— no filter —</option>}
                  {properties.map(p => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>

                {row.property && !isGrid && (
                  <select
                    className={styles.select}
                    value={row.value}
                    onChange={e => setRowValue(i, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {getOptions(row.property).map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                )}

                {i > 0 && (
                  <button onClick={() => removeRow(i)}>
                    <Trash2 size={15} className={styles.trash} />
                  </button>
                )}
              </div>

              {row.property && isGrid && (
                <ChipGrid
                  options={getOptions(row.property)}
                  selected={row.value}
                  showAll={showAllChips}
                  onToggleAll={() => setShowAllChips(v => !v)}
                  onSelect={v => handleChipSelect(i, v)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.addLine}>
        <button className={styles.addBtn} onClick={addRow}>+ Add a property</button>
        <span className={styles.muted}>or</span>
        <button className={styles.advBtn} onClick={onOpenAdvanced}>
          Advanced Filter ▾
        </button>
        <button className={styles.applyBtn} onClick={handleApply}>
          Apply Filter
        </button>
      </div>
    </div>
  );
}
