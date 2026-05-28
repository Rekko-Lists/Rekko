import { useRef, useState, useEffect, useCallback } from 'react';
import { X, ImageIcon } from 'lucide-react';
import { createPost } from '@/lib/postService';
import { searchAnimes } from '@/lib/searchService';
import { extractApiError } from '@/lib/apiErrors';
import type { Anime } from '@/types/anime';

const MAX_TITLE = 120;
const MAX_DESC = 1500;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_ANIMES = 10;
const DEBOUNCE_MS = 300;
const SEARCH_MIN_CHARS = 3;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');

  const [animeQuery, setAnimeQuery] = useState('');
  const [animeResults, setAnimeResults] = useState<Anime[]>([]);
  const [selectedAnimes, setSelectedAnimes] = useState<Anime[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clean up object URL on photo change or unmount
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // Cancel pending search + debounce timer on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  function resetForm() {
    setTitle('');
    setDescription('');
    setPhoto(null);
    // Use the functional updater so we always read the latest URL, not the
    // stale closure value captured by the effect that calls resetForm.
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setImageError('');
    setAnimeQuery('');
    setAnimeResults([]);
    setSelectedAnimes([]);
    setError('');
    setLoading(false);
    setSearchLoading(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image must be 2 MB or less.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setImageError('');
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const runSearch = useCallback(async (query: string) => {
    if (query.trim().length < SEARCH_MIN_CHARS) {
      setAnimeResults([]);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setSearchLoading(true);
    try {
      const results = await searchAnimes(query, abortRef.current.signal);
      // Filter out already-selected animes
      setAnimeResults(
        results.filter((r) => !selectedAnimes.some((s) => s.malId === r.malId))
      );
    } catch (err: unknown) {
      // Ignore aborted / cancelled requests (Axios uses 'ERR_CANCELED')
      const isAbort =
        (err as { name?: string })?.name === 'AbortError' ||
        (err as { code?: string })?.code === 'ERR_CANCELED' ||
        (err as { name?: string })?.name === 'CanceledError';
      if (!isAbort) {
        setAnimeResults([]);
      }
    } finally {
      setSearchLoading(false);
    }
  }, [selectedAnimes]);

  function handleAnimeQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setAnimeQuery(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(q);
    }, DEBOUNCE_MS);
  }

  function addAnime(anime: Anime) {
    if (selectedAnimes.length >= MAX_ANIMES) return;
    if (selectedAnimes.some((a) => a.malId === anime.malId)) return;
    setSelectedAnimes((prev) => [...prev, anime]);
    setAnimeQuery('');
    setAnimeResults([]);
  }

  function removeAnime(malId: number) {
    setSelectedAnimes((prev) => prev.filter((a) => a.malId !== malId));
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError('A title is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createPost({
        title: title.trim(),
        description: description.trim() || undefined,
        animeIds: selectedAnimes.map((a) => a.malId),
        photo,
      });
      onClose();
    } catch (err) {
      setError(extractApiError(err, 'Could not create post. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-surface rounded-[12px] shadow-card w-full max-w-2xl flex flex-col font-gabarito max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h2 className="text-[20px] font-semibold text-text-main">Nueva publicación</h2>
          <button
            className="text-text-muted hover:text-text-main transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-5">

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-main">Título</label>
              <span className="text-xs text-text-muted">{MAX_TITLE - title.length} restantes</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={MAX_TITLE}
              placeholder="Título de tu publicación"
              className="w-full rounded-[8px] border border-border bg-app-bg text-text-main text-sm px-3 py-2.5 placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-main">Descripción</label>
              <span className="text-xs text-text-muted">{MAX_DESC - description.length} restantes</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={MAX_DESC}
              placeholder="¿De qué quieres hablar?"
              rows={4}
              className="w-full rounded-[8px] border border-border bg-app-bg text-text-main text-sm px-3 py-2.5 placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-y"
            />
          </div>

          {/* Image upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-main">Imagen</label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {photoPreview ? (
              <div className="relative w-full">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full max-h-48 object-cover rounded-[8px] border border-border"
                />
                <button
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                  onClick={removePhoto}
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-[8px] flex flex-col items-center justify-center gap-2 py-6 cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={24} className="text-text-muted" />
                <span className="text-sm text-text-muted">Click para añadir imagen</span>
                <span className="text-xs text-text-muted">JPG, PNG, WebP · Máx. 2 MB</span>
              </div>
            )}

            {imageError && (
              <p className="text-xs text-status-red">{imageError}</p>
            )}
          </div>

          {/* Related animes */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-main">Animes relacionados</label>
              <span className="text-xs text-text-muted">{selectedAnimes.length}/{MAX_ANIMES}</span>
            </div>

            {/* Selected chips */}
            {selectedAnimes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedAnimes.map((anime) => (
                  <span
                    key={anime.malId}
                    className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium rounded-pill px-3 py-1"
                  >
                    {anime.name}
                    <button
                      onClick={() => removeAnime(anime.malId)}
                      className="hover:text-primary/70 transition-colors"
                      aria-label={`Remove ${anime.name}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search input + dropdown */}
            {selectedAnimes.length < MAX_ANIMES && (
              <div className="relative">
                <input
                  type="text"
                  value={animeQuery}
                  onChange={handleAnimeQueryChange}
                  placeholder="Buscar anime... (mín. 3 caracteres)"
                  className="w-full rounded-[8px] border border-border bg-app-bg text-text-main text-sm px-3 py-2.5 placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />

                {/* Dropdown */}
                {(animeResults.length > 0 || searchLoading) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-[8px] shadow-card z-10 max-h-48 overflow-y-auto">
                    {searchLoading && (
                      <div className="px-3 py-2 text-sm text-text-muted">Buscando...</div>
                    )}
                    {!searchLoading && animeResults.map((anime) => (
                      <button
                        key={anime.malId}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-app-bg transition-colors text-left"
                        onClick={() => addAnime(anime)}
                      >
                        {anime.imgMedium && (
                          <img
                            src={anime.imgMedium}
                            alt={anime.name}
                            className="w-8 h-10 object-cover rounded-[4px] flex-shrink-0"
                          />
                        )}
                        <span className="text-sm text-text-main line-clamp-2">{anime.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 px-6 pb-5">
          {error && (
            <p className="text-xs text-status-red text-center">{error}</p>
          )}
          <div className="flex justify-end gap-3">
            <button
              className="text-sm text-text-muted hover:text-text-main transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !title.trim()}
              className="bg-gradient-cta text-white font-gabarito font-medium text-sm rounded-pill px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none transition-opacity"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Publicando...
                </span>
              ) : (
                'Publicar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
