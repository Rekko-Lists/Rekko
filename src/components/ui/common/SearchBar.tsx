import { Search } from "lucide-react";
import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";

interface Props {
  placeholder?: string;
  /** Controlled value. If omitted the component manages its own state. */
  value?: string;
  /** Controlled change handler. Required when `value` comes from outside. */
  onChange?: (value: string) => void;
}

const MAX_SECTION_RESULTS = 6;
const MIN_QUERY_LENGTH = 3;

const styles = {
  wrapper: "relative w-[380px] font-gabarito",
  form: "relative",
  input:
    "w-full h-[40px] pl-4 pr-10 bg-[rgba(246,246,246,0.6)] border-[1.5px] border-border rounded-pill text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors",
  icon: "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted",
  dropdown:
    "absolute left-0 right-0 top-[44px] bg-surface border border-border rounded-card shadow-card z-50 overflow-hidden",
  sectionHeader:
    "px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted select-none",
  sectionDivider: "border-t border-border",
  item: "flex items-center gap-3 px-3 py-2 hover:bg-app-bg cursor-pointer transition-colors",
  // Anime thumbnail
  thumb:
    "w-[36px] h-[48px] flex-shrink-0 rounded-[3px] object-cover bg-gradient-to-br from-slate-400 to-slate-700",
  thumbPh:
    "w-[36px] h-[48px] flex-shrink-0 rounded-[3px] bg-gradient-to-br from-slate-400 to-slate-700",
  // User avatar
  avatar:
    "w-8 h-8 flex-shrink-0 rounded-full object-cover bg-gradient-to-br from-slate-400 to-slate-700",
  avatarPh:
    "w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-slate-400 to-slate-700",
  // Post icon placeholder
  postIcon:
    "w-8 h-8 flex-shrink-0 rounded-[4px] bg-border flex items-center justify-center text-text-muted",
  itemTitle: "text-sm text-text-main truncate",
  itemMeta: "text-xs text-text-muted truncate",
  status: "px-3 py-2 text-xs text-text-muted text-center",
  error: "px-3 py-2 text-xs text-status-red text-center",
};

export default function SearchBar({
  placeholder = "Search for anything",
  value,
  onChange,
}: Props) {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const { query, setQuery, animes, users, posts, loading, error } = useSearch();

  // Sync controlled `value` prop into the hook's internal state.
  const isControlled = value !== undefined;
  useEffect(() => {
    if (isControlled && value !== query) setQuery(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(next: string) {
    if (isControlled) onChange?.(next);
    setQuery(next);
    setOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      (e.target as HTMLInputElement).blur();
    }
  }

  function handleSelectAnime(malId: number) {
    setOpen(false);
    navigate(`/animes/${malId}`);
  }

  function handleSelectUser(username: string) {
    setOpen(false);
    navigate(`/profile/${username}`);
  }

  function handleSelectPost(post: {
    postId: number;
    user?: { username: string } | null;
    animes?: Array<{ malId: number }>;
  }) {
    setOpen(false);
    navigate(`/post/${post.postId}`);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const showDropdown = open && query.trim().length >= MIN_QUERY_LENGTH;

  const topAnimes = animes.slice(0, MAX_SECTION_RESULTS);
  const topUsers = users.slice(0, MAX_SECTION_RESULTS);
  const topPosts = posts.slice(0, MAX_SECTION_RESULTS);

  const hasAnimes = topAnimes.length > 0;
  const hasUsers = topUsers.length > 0;
  const hasPosts = topPosts.length > 0;
  const hasResults = hasAnimes || hasUsers || hasPosts;

  // Track whether a divider is needed between sections
  let firstSectionRendered = false;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <form className={styles.form} onSubmit={handleSubmit} role="search">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="search-results"
          className={styles.input}
        />
        <Search size={16} className={styles.icon} />
      </form>

      {showDropdown && (
        <div id="search-results" role="listbox" className={styles.dropdown}>
          {/* Loading state */}
          {loading && <p className={styles.status}>Searching...</p>}

          {/* Error state */}
          {!loading && error && <p className={styles.error}>{error}</p>}

          {/* Empty state */}
          {!loading && !error && !hasResults && (
            <p className={styles.status}>No results</p>
          )}

          {/* ── Animes section ── */}
          {!loading &&
            !error &&
            hasAnimes &&
            (() => {
              const divider = firstSectionRendered;
              firstSectionRendered = true;
              return (
                <>
                  {divider && <div className={styles.sectionDivider} />}
                  <p className={styles.sectionHeader}>Animes</p>
                  {topAnimes.map((anime) => (
                    <button
                      key={anime.malId}
                      type="button"
                      role="option"
                      aria-selected="false"
                      onClick={() => handleSelectAnime(anime.malId)}
                      className={styles.item + " w-full text-left"}
                    >
                      {anime.imgMedium ? (
                        <img
                          src={anime.imgMedium}
                          alt=""
                          className={styles.thumb}
                        />
                      ) : (
                        <div className={styles.thumbPh} />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={styles.itemTitle}>{anime.name}</p>
                        {anime.malMean > 0 && (
                          <p className={styles.itemMeta}>
                            ★ {anime.malMean.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </>
              );
            })()}

          {/* ── Users section ── */}
          {!loading &&
            !error &&
            hasUsers &&
            (() => {
              const divider = firstSectionRendered;
              firstSectionRendered = true;
              return (
                <>
                  {divider && <div className={styles.sectionDivider} />}
                  <p className={styles.sectionHeader}>Users</p>
                  {topUsers.map((user) => (
                    <button
                      key={user.userId}
                      type="button"
                      role="option"
                      aria-selected="false"
                      onClick={() => handleSelectUser(user.username)}
                      className={styles.item + " w-full text-left"}
                    >
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt=""
                          className={styles.avatar}
                        />
                      ) : (
                        <div className={styles.avatarPh} />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={styles.itemTitle}>{user.username}</p>
                      </div>
                    </button>
                  ))}
                </>
              );
            })()}

          {/* Posts section */}
          {!loading &&
            !error &&
            hasPosts &&
            (() => {
              const divider = firstSectionRendered;
              firstSectionRendered = true;
              return (
                <>
                  {divider && <div className={styles.sectionDivider} />}
                  <p className={styles.sectionHeader}>Posts</p>
                  {topPosts.map((post) => (
                    <button
                      key={post.postId}
                      type="button"
                      role="option"
                      aria-selected="false"
                      onClick={() => handleSelectPost(post)}
                      className={styles.item + " w-full text-left"}
                    >
                      <div className={styles.postIcon}>#</div>
                      <div className="min-w-0 flex-1">
                        <p className={styles.itemTitle}>{post.title}</p>
                        <p className={styles.itemMeta}>
                          {post.animes?.[0]?.name ??
                            post.user?.username ??
                            "Post"}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              );
            })()}
        </div>
      )}
    </div>
  );
}
