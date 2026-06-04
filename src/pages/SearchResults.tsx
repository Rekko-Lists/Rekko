import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  search,
  type SearchResults as SearchResultsData,
} from "@/lib/searchService";
import { extractApiError } from "@/lib/apiErrors";
import Seo from "@/components/seo/Seo";
import { itemListJsonLd, pageJsonLd } from "@/components/seo/jsonLd";
import { seoPages } from "@/components/seo/pages";

const MIN_QUERY_LENGTH = 3;

const styles = {
  page: "min-h-full bg-app-bg font-gabarito",
  container: "max-w-[1000px] mx-auto px-6 py-8",
  title: "text-[28px] text-text-main mb-2",
  subtitle: "text-sm text-text-muted mb-6",
  grid: "grid grid-cols-1 lg:grid-cols-3 gap-5",
  section:
    "bg-surface border-[1.5px] border-border rounded-card overflow-hidden",
  sectionTitle:
    "px-4 py-3 border-b border-border text-sm font-semibold uppercase tracking-widest text-text-muted",
  item: "flex items-center gap-3 px-4 py-3 hover:bg-app-bg transition-colors border-b border-border last:border-b-0",
  poster:
    "w-[44px] h-[60px] rounded-[4px] object-cover bg-gradient-to-br from-slate-400 to-slate-700 flex-shrink-0",
  avatar:
    "w-10 h-10 rounded-full object-cover bg-gradient-to-br from-slate-400 to-slate-700 flex-shrink-0",
  postIcon:
    "w-10 h-10 rounded-[4px] bg-border flex items-center justify-center text-text-muted flex-shrink-0",
  itemTitle: "text-sm text-text-main truncate",
  itemMeta: "text-xs text-text-muted truncate",
  state: "py-12 text-center text-text-muted",
  error: "py-12 text-center text-status-red",
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [results, setResults] = useState<SearchResultsData>({
    animes: [],
    users: [],
    posts: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      setResults({ animes: [], users: [], posts: [] });
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    search(query, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setResults(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResults({ animes: [], users: [], posts: [] });
        setError(extractApiError(err));
        setLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  const hasResults =
    results.animes.length > 0 ||
    results.users.length > 0 ||
    results.posts.length > 0;
  const seoPath = query ? `${seoPages.search.path}?q=${encodeURIComponent(query)}` : seoPages.search.path;
  const seoTitle = query ? `Search results for "${query}"` : seoPages.search.title;
  const seoDescription = query
    ? `Search Rekko for anime, users, and posts matching "${query}".`
    : seoPages.search.description;

  return (
    <div className={styles.page}>
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath={seoPath}
        noindex={query.length < MIN_QUERY_LENGTH}
        jsonLd={[
          pageJsonLd({
            type: seoPages.search.schemaType,
            path: seoPath,
            name: seoTitle,
            description: seoDescription,
          }),
          itemListJsonLd(
            query ? `Search results for ${query}` : "Rekko search results",
            seoPath,
            [
              ...results.animes.map((anime) => ({
                name: anime.name,
                url: `/animes/${anime.malId}`,
                image: anime.imgMedium,
              })),
              ...results.users.map((user) => ({
                name: user.username,
                url: `/profile/${user.username}`,
                image: user.profileImage,
              })),
              ...results.posts.map((post) => ({
                name: post.title,
                url: `/post/${post.postId}`,
              })),
            ].slice(0, 20),
          ),
        ]}
      />
      <div className={styles.container}>
        <h1 className={styles.title}>Search</h1>
        <p className={styles.subtitle}>
          {query
            ? `Results for "${query}"`
            : "Type at least 3 characters to search."}
        </p>

        {loading && <p className={styles.state}>Searching...</p>}
        {!loading && error && <p className={styles.error}>{error}</p>}
        {!loading &&
          !error &&
          query.length >= MIN_QUERY_LENGTH &&
          !hasResults && <p className={styles.state}>No results found.</p>}

        {!loading && !error && hasResults && (
          <div className={styles.grid}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Animes</h2>
              {results.animes.length === 0 && (
                <p className={styles.state}>No animes</p>
              )}
              {results.animes.map((anime) => (
                <Link
                  key={anime.malId}
                  to={`/animes/${anime.malId}`}
                  className={styles.item}
                >
                  {anime.imgMedium ? (
                    <img
                      src={anime.imgMedium}
                      alt=""
                      className={styles.poster}
                    />
                  ) : (
                    <div className={styles.poster} />
                  )}
                  <div className="min-w-0">
                    <p className={styles.itemTitle}>{anime.name}</p>
                    {anime.malMean > 0 && (
                      <p className={styles.itemMeta}>
                        MAL {anime.malMean.toFixed(2)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Users</h2>
              {results.users.length === 0 && (
                <p className={styles.state}>No users</p>
              )}
              {results.users.map((user) => (
                <Link
                  key={user.userId}
                  to={`/profile/${user.username}`}
                  className={styles.item}
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt=""
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatar} />
                  )}
                  <p className={styles.itemTitle}>{user.username}</p>
                </Link>
              ))}
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Posts</h2>
              {results.posts.length === 0 && (
                <p className={styles.state}>No posts</p>
              )}
              {results.posts.map((post) => {
                const firstAnime = post.animes?.[0];
                const to = `/post/${post.postId}`;

                return (
                  <Link key={post.postId} to={to} className={styles.item}>
                    <div className={styles.postIcon}>#</div>
                    <div className="min-w-0">
                      <p className={styles.itemTitle}>{post.title}</p>
                      <p className={styles.itemMeta}>
                        {firstAnime?.name ?? post.user?.username ?? "Post"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
