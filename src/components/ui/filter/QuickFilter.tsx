import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export interface FilterProperty {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  chipGrid?: boolean; // kept for interface compat; no longer used
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

const styles = {
  wrap:     'flex flex-col gap-2 px-[6%] py-3 font-gabarito',
  rowsWrap: 'flex flex-wrap gap-3 items-start',
  row:      'flex items-center gap-2',
  select:   'h-[36px] border border-border rounded-[5px] px-3 text-sm bg-surface cursor-pointer focus:outline-none text-text-main',
  trash:    'text-text-muted cursor-pointer hover:text-status-red transition-colors',
  addLine:  'flex items-center gap-1.5 text-sm',
  addBtn:   'text-primary cursor-pointer hover:underline font-medium',
  muted:    'text-text-muted',
  advBtn:   'text-text-secondary cursor-pointer hover:text-text-main flex items-center gap-0.5',
  applyBtn: 'h-[26px] bg-primary text-white rounded-[5px] px-4 text-sm font-semibold cursor-pointer hover:bg-primary-dark transition-colors',
};

export default function QuickFilter({ properties, onApply, onOpenAdvanced }: QuickFilterProps) {
  const [rows, setRows] = useState<FilterRow[]>([{ property: '', value: '' }]);

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

  const getOptions = (propKey: string) => getProp(propKey)?.options ?? [];

  return (
    <div className={styles.wrap}>
      <div className={styles.rowsWrap}>
        {rows.map((row, i) => (
          <div key={i} className={styles.row}>
            <select
              className={styles.select}
              value={row.property}
              onChange={e => setRowProp(i, e.target.value)}
            >
              <option value="">— no filter —</option>
              {properties.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>

            {row.property && (
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
        ))}
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
