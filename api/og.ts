// Vercel serverless function that serves crawler-facing Open Graph HTML.
//
// The Rekko frontend is a client-rendered SPA, so social crawlers (Discord,
// Twitter/X, WhatsApp, Slack, Facebook…) that don't execute JS only ever see
// the generic tags in index.html. `vercel.json` rewrites bot requests for
// /profile, /post and /animes pages here; humans keep getting the SPA.
//
// This file lives outside `src`, so it is intentionally excluded from the app
// tsconfig and compiled by Vercel's own Node runtime.

const API_BASE_URL =
  process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || '';

const SITE_NAME = 'Rekko';
const FALLBACK_IMAGE = '/rekko_logo.png';
const FALLBACK_DESCRIPTION =
  'Discover anime, share recommendations, and explore community posts on Rekko.';

function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(value: string, max = 200): string {
  const clean = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + '…';
}

function humanizeStatus(status: string): string {
  switch (status) {
    case 'currently_airing':
      return 'Airing';
    case 'finished_airing':
      return 'Finished';
    case 'not_yet_aired':
      return 'Upcoming';
    default:
      return status ? status.replace(/_/g, ' ') : '';
  }
}

interface Meta {
  title: string;
  description: string;
  image: string;
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return res.json();
}

async function buildProfileMeta(username: string): Promise<Meta> {
  const json = await fetchJson(
    `${API_BASE_URL}/user/${encodeURIComponent(username)}?fields=username,biography,profileImage,bannerImage,reputation`,
  );
  const u = json?.data ?? {};
  const name = u.username || username;
  const bio = u.biography
    ? truncate(u.biography, 200)
    : `${u.reputation ?? 0} reputation · Anime fan on ${SITE_NAME}`;
  return {
    title: `${name} on ${SITE_NAME}`,
    description: bio,
    image: u.bannerImage || u.profileImage || FALLBACK_IMAGE,
  };
}

async function buildPostMeta(id: string): Promise<Meta> {
  const json = await fetchJson(`${API_BASE_URL}/post/${encodeURIComponent(id)}`);
  const post = json?.data?.post ?? {};
  const author = post.user?.username ? ` · by ${post.user.username}` : '';
  return {
    title: `${post.title || 'Post'}${author} · ${SITE_NAME}`,
    description: truncate(
      post.description || 'Read this anime recommendation and discussion on Rekko.',
      200,
    ),
    image: post.photo || post.animes?.[0]?.imgLarge || post.animes?.[0]?.imgMedium || FALLBACK_IMAGE,
  };
}

async function buildAnimeMeta(malId: string): Promise<Meta> {
  const json = await fetchJson(`${API_BASE_URL}/anime/${encodeURIComponent(malId)}`);
  const a = json?.data?.anime ?? json?.data ?? {};
  const facts = [
    a.malMean ? `★ ${Number(a.malMean).toFixed(2)}` : null,
    a.numEpisodes ? `${a.numEpisodes} episodes` : null,
    humanizeStatus(a.status),
  ]
    .filter(Boolean)
    .join(' · ');
  const synopsis = a.synopsis ? truncate(a.synopsis, 160) : '';
  return {
    title: `${a.name || 'Anime'} · ${SITE_NAME}`,
    description: [facts, synopsis].filter(Boolean).join(' — ') || FALLBACK_DESCRIPTION,
    image: a.imgLarge || a.imgMedium || FALLBACK_IMAGE,
  };
}

function canonicalPath(type: string, id: string): string {
  if (type === 'profile') return `/profile/${id}`;
  if (type === 'post') return `/post/${id}`;
  if (type === 'anime') return `/animes/${id}`;
  return '/';
}

function renderHtml(meta: Meta, canonicalUrl: string): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const image = escapeHtml(meta.image);
  const url = escapeHtml(canonicalUrl);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${url}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
<link rel="canonical" href="${url}" />
<meta http-equiv="refresh" content="0; url=${url}" />
</head>
<body>
<p>Redirecting to <a href="${url}">${title}</a>…</p>
<script>location.replace(${JSON.stringify(canonicalUrl)});</script>
</body>
</html>`;
}

export default async function handler(req: any, res: any): Promise<void> {
  const { type = '', id = '' } = req.query ?? {};
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const canonicalUrl = `https://${host}${canonicalPath(String(type), String(id))}`;

  let meta: Meta = {
    title: SITE_NAME,
    description: FALLBACK_DESCRIPTION,
    image: FALLBACK_IMAGE,
  };

  try {
    if (!API_BASE_URL) throw new Error('API base URL not configured');
    if (type === 'profile' && id) meta = await buildProfileMeta(String(id));
    else if (type === 'post' && id) meta = await buildPostMeta(String(id));
    else if (type === 'anime' && id) meta = await buildAnimeMeta(String(id));
  } catch {
    // Fall through with generic Rekko metadata so embeds never break.
  }

  // Crawlers respect short caching; this keeps embeds fresh without hammering the API.
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
  res.status(200).send(renderHtml(meta, canonicalUrl));
}
