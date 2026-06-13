import { useEffect, useRef, useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import PlatformSelector, { type ImportPlatform } from '@/components/ui/import/PlatformSelector';
import { importAnilist, importMalXml, type ImportResult } from '@/lib/importService';
import { extractApiError } from '@/lib/apiErrors';

const styles = {
  backdrop:    'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm',
  panel:       'bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.25)] w-full max-w-md font-gabarito overflow-hidden',
  header:      'flex items-center gap-3 p-5 border-b border-border-light',
  title:       'flex-1 text-base font-semibold text-text-main',
  closeBtn:    'w-7 h-7 rounded-full hover:bg-border flex items-center justify-center transition-colors flex-shrink-0',
  closeIcon:   'text-text-secondary',
  body:        'p-5 space-y-5',
  label:       'text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block',
  dropzone:    'flex flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-border px-4 py-7 text-center cursor-pointer hover:border-primary transition-colors',
  dropIcon:    'text-text-muted',
  dropText:    'text-sm text-text-secondary',
  fileChip:    'flex items-center gap-2 rounded-[10px] border border-border bg-app-bg px-3 py-2 text-sm text-text-main',
  hint:        'text-[11px] text-text-muted mt-2 leading-relaxed',
  input:       'w-full h-[42px] border border-border rounded-btn px-3 bg-app-bg text-text-main text-sm placeholder:text-text-muted shadow-input focus:outline-none focus:border-primary transition-colors',
  error:       'flex items-start gap-2 text-xs text-status-red',
  footer:      'flex items-center justify-end gap-2 p-4 border-t border-border-light bg-app-bg',
  cancelBtn:   'text-xs text-text-secondary hover:text-text-main px-4 py-2 rounded-[6px] border border-border hover:border-primary transition-colors',
  submitBtn:   'flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-b from-grad-start to-grad-end px-4 py-2 rounded-[6px] hover:opacity-90 transition-opacity disabled:opacity-50',
  // result
  resultWrap:  'flex flex-col items-center text-center gap-3 py-4',
  resultIcon:  'text-status-green',
  resultTitle: 'text-base font-semibold text-text-main',
  resultStats: 'flex items-center gap-4 text-sm',
  statNum:     'font-semibold text-text-main',
  statLabel:   'text-text-secondary text-xs',
  failList:    'w-full max-h-28 overflow-y-auto rounded-[8px] bg-app-bg p-2 text-left text-[11px] text-text-secondary',
};

interface Props {
  defaultPlatform?: ImportPlatform;
  onClose: () => void;
  onImported?: () => void;
}

export default function ImportModal({ defaultPlatform = 'mal', onClose, onImported }: Props) {
  const [platform, setPlatform] = useState<ImportPlatform>(defaultPlatform);
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Reset transient inputs when switching source.
  function selectPlatform(next: ImportPlatform) {
    setPlatform(next);
    setError(null);
    setResult(null);
  }

  const canSubmit = platform === 'mal' ? Boolean(file) : username.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = platform === 'mal'
        ? await importMalXml(file as File)
        : await importAnilist(username.trim());
      setResult(res);
      onImported?.();
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>{result ? 'Import complete' : 'Import your list'}</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={14} className={styles.closeIcon} />
          </button>
        </div>

        {result ? (
          <div className={styles.body}>
            <div className={styles.resultWrap}>
              <CheckCircle2 size={44} className={styles.resultIcon} />
              <p className={styles.resultTitle}>Your list was imported</p>
              <div className={styles.resultStats}>
                <span><span className={styles.statNum}>{result.imported}</span> <span className={styles.statLabel}>imported</span></span>
                <span><span className={styles.statNum}>{result.skipped}</span> <span className={styles.statLabel}>skipped</span></span>
                <span><span className={styles.statNum}>{result.failed.length}</span> <span className={styles.statLabel}>failed</span></span>
              </div>
              {result.failed.length > 0 && (
                <div className={styles.failList}>
                  {result.failed.slice(0, 20).map((f) => (
                    <div key={f.malId}>MAL #{f.malId}: {f.reason}</div>
                  ))}
                  {result.failed.length > 20 && <div>…and {result.failed.length - 20} more</div>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.body}>
            <div>
              <label className={styles.label}>Source</label>
              <PlatformSelector selected={platform} onSelect={selectPlatform} />
            </div>

            {platform === 'mal' ? (
              <div>
                <label className={styles.label}>MyAnimeList XML</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xml,text/xml,application/xml"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <div className={styles.fileChip}>
                    <FileText size={15} className="text-primary" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <button onClick={() => setFile(null)} className="text-text-muted hover:text-status-red">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.dropzone} onClick={() => fileInputRef.current?.click()}>
                    <Upload size={20} className={styles.dropIcon} />
                    <span className={styles.dropText}>Click to choose your exported XML file</span>
                  </div>
                )}
                <p className={styles.hint}>
                  In MyAnimeList go to <strong>List → Export</strong>, download the anime list,
                  unzip it and upload the <strong>.xml</strong> file here.
                </p>
              </div>
            ) : (
              <div>
                <label className={styles.label}>AniList username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. your-anilist-name"
                  className={styles.input}
                  autoFocus
                  autoComplete="off"
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit(); }}
                />
                <p className={styles.hint}>
                  Your AniList profile must be public. We read your anime list and map each
                  entry to its MyAnimeList ID.
                </p>
              </div>
            )}

            {error && (
              <p className={styles.error}>
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                {error}
              </p>
            )}
          </div>
        )}

        <div className={styles.footer}>
          {result ? (
            <button onClick={onClose} className={styles.submitBtn}>Done</button>
          ) : (
            <>
              <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
              <button onClick={handleSubmit} disabled={!canSubmit || loading} className={styles.submitBtn}>
                <Upload size={13} />
                {loading ? 'Importing…' : 'Import'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
