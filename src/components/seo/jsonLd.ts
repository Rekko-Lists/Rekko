export type JsonLd = Record<string, unknown>;

const SITE_NAME = "Rekko";
const DEFAULT_DESCRIPTION =
  "Rekko is an anime community for discovering shows, sharing recommendations, tracking lists, and exploring posts from other fans.";

function getOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return import.meta.env.BASE_URL_PRODUCTION;
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getOrigin()}${normalizedPath}`;
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": import.meta.env.SCHEMA_BASE_URL,
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd(): JsonLd {
  return {
    "@context": import.meta.env.SCHEMA_BASE_URL,
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl(import.meta.env.SCHEMA_DEFAULT_IMAGE),
  };
}

export function pageJsonLd(options: {
  type?: string;
  path: string;
  name: string;
  description: string;
  image?: string;
}): JsonLd {
  return {
    "@context": import.meta.env.SCHEMA_BASE_URL,
    "@type": options.type ?? "WebPage",
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    ...(options.image ? { image: absoluteUrl(options.image) } : {}),
  };
}

export function itemListJsonLd(
  name: string,
  path: string,
  items: { name: string; url: string; image?: string }[],
): JsonLd {
  return {
    "@context": import.meta.env.SCHEMA_BASE_URL,
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(item.url),
      item: {
        "@type": "Thing",
        name: item.name,
        url: absoluteUrl(item.url),
        ...(item.image ? { image: absoluteUrl(item.image) } : {}),
      },
    })),
  };
}
