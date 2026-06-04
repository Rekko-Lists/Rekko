import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { absoluteUrl, type JsonLd } from "./jsonLd";

interface SeoProps {
    title: string;
    description: string;
    canonicalPath?: string;
    image?: string;
    noindex?: boolean;
    jsonLd?: JsonLd | JsonLd[];
}

const SITE_NAME = import.meta.env.SCHEMA_SITE_NAME || "Rekko";
const DEFAULT_IMAGE = import.meta.env.SCHEMA_DEFAULT_IMAGE || "/rekko_logo.png";

function setMeta(attribute: "name" | "property", key: string, content: string) {
    let element = document.head.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${key}"]`,
    );

    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }

    element.content = content;
}

export default function Seo({
    title,
    description,
    canonicalPath,
    image = DEFAULT_IMAGE,
    noindex = false,
    jsonLd,
}: SeoProps) {
    const location = useLocation();
    const canonical = canonicalPath ?? `${location.pathname}${location.search}`;
    const fullTitle = title.includes(SITE_NAME)
        ? title
        : `${title} | ${SITE_NAME}`;
    const scripts = useMemo(
        () => (Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []),
        [jsonLd],
    );

    useEffect(() => {
        document.title = fullTitle;

        setMeta("name", "description", description);
        setMeta(
            "name",
            "robots",
            noindex ? "noindex,nofollow" : "index,follow",
        );
        setMeta("property", "og:title", fullTitle);
        setMeta("property", "og:description", description);
        setMeta("property", "og:type", "website");
        setMeta("property", "og:url", absoluteUrl(canonical));
        setMeta("property", "og:image", absoluteUrl(image));
        setMeta("name", "twitter:card", "summary_large_image");
        setMeta("name", "twitter:title", fullTitle);
        setMeta("name", "twitter:description", description);
        setMeta("name", "twitter:image", absoluteUrl(image));

        let canonicalElement = document.head.querySelector<HTMLLinkElement>(
            'link[rel="canonical"]',
        );
        if (!canonicalElement) {
            canonicalElement = document.createElement("link");
            canonicalElement.rel = "canonical";
            document.head.appendChild(canonicalElement);
        }
        canonicalElement.href = absoluteUrl(canonical);

        document
            .querySelectorAll('script[data-rekko-seo="json-ld"]')
            .forEach((element) => element.remove());

        scripts.forEach((schema) => {
            const script = document.createElement("script");
            script.type = "application/ld+json";
            script.dataset.rekkoSeo = "json-ld";
            script.text = JSON.stringify(schema);
            document.head.appendChild(script);
        });
    }, [canonical, description, fullTitle, image, noindex, scripts]);

    return null;
}
