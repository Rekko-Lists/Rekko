import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AnimeNewsCard from "@/components/ui/feed/AnimeNewsCard";
import ReputationLeaderboard from "@/components/ui/feed/ReputationLeaderboard";
import PopularRecommendationsCard from "@/components/ui/feed/PopularRecommendationsCard";
import AnimeListWidget from "@/components/ui/feed/widgets/AnimeListWidget";

import SiteLinks from "@/components/ui/common/SiteLinks";
import type { SiteLinkItem } from "@/components/ui/common/SiteLinks";
import { useAuthStore } from "@/store/useAuthStore";
import type { RecommendationItem } from "@/components/ui/feed/PopularRecommendationsCard";

import faqs from "@/content/faq.json";

import { getLatestAnimeNews, type AnimeNewsItem } from "@/lib/animeNewsService";
import { getPopularPosts } from "@/lib/postService";
import { getTopReputationUsers } from "@/lib/userService";

import {
    getAiringTodayAnimes,
    getPopularAnimes,
    getPopularUpcomingAnimes,
    getTopAiringAnimes,
    getTopSeasonalAnimes,
    getTopUpcomingAnimes,
} from "@/lib/animeService";
import FAQAccordion from "@/components/ui/common/FAQAccordion";
import Seo from "@/components/seo/Seo";
import {
    organizationJsonLd,
    pageJsonLd,
    websiteJsonLd,
} from "@/components/seo/jsonLd";

const NEWS_FALLBACK_MAL_IDS = [52991, 5114, 9253, 30276];

const BASE_SITE_LINKS: SiteLinkItem[] = [
    { label: "Rules of the site", icon: "Book",     href: "/rules" },
    { label: "About",             icon: "Book",     href: "/about" },
    { label: "FAQ",               icon: "Question", href: "/faq"   },
];

const styles = {
    page: "flex flex-col px-4 font-gabarito min-h-full items-stretch lg:flex-row lg:items-start lg:px-[6%]",
    sidebar:
        "hidden lg:flex flex-col gap-4 py-4 lg:sticky lg:top-[136px] lg:max-h-[calc(100vh-148px)] lg:w-[231px] lg:flex-shrink-0 lg:overflow-y-auto lg:py-6",
    center: "flex-1 flex flex-col gap-4 min-w-0 py-6",
    divider: "hidden w-[1.5px] bg-black/15 self-stretch mx-5 lg:block",
};

export default function Faq() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const siteLinks = useMemo<SiteLinkItem[]>(
        () => [
            ...BASE_SITE_LINKS,
            ...(user?.role === 'ADMIN'
                ? [{ label: 'Admin Panel', icon: 'Shield', href: '/admin' }]
                : []),
        ],
        [user?.role],
    );

    const [news, setNews] = useState<AnimeNewsItem[]>([]);
    const [leaderboard, setLeaderboard] = useState<
        { rank: number; user: string; hearts: number; avatar?: string }[]
    >([]);
    const [recommendations, setRecommendations] = useState<
        RecommendationItem[]
    >([]);

    const randomWidgetLoaders = useMemo(
        () => [
            {
                key: "seasonal",
                title: "Seasonal animes",
                load: (signal?: AbortSignal) => getTopSeasonalAnimes(5, signal),
                onViewMore: () => navigate("/animes?season=current"),
            },
            {
                key: "popular",
                title: "Popular animes",
                load: (signal?: AbortSignal) => getPopularAnimes(5, signal),
            },
            {
                key: "airing-today",
                title: "Airing today",
                load: (signal?: AbortSignal) => getAiringTodayAnimes(5, signal),
                showBroadcastTime: true,
            },
            {
                key: "top-upcoming",
                title: "Top upcoming",
                load: (signal?: AbortSignal) => getTopUpcomingAnimes(5, signal),
            },
            {
                key: "popular-upcoming",
                title: "Popular upcoming",
                load: (signal?: AbortSignal) =>
                    getPopularUpcomingAnimes(5, signal),
            },
            {
                key: "top-airing",
                title: "Top airing",
                load: (signal?: AbortSignal) => getTopAiringAnimes(5, signal),
            },
        ],
        [navigate],
    );

    const randomWidgets = useMemo(() => {
        const shuffled = [...randomWidgetLoaders].sort(
            () => Math.random() - 0.5,
        );
        return shuffled.slice(0, 2);
    }, [randomWidgetLoaders]);

    useEffect(() => {
        const controller = new AbortController();

        void getLatestAnimeNews(NEWS_FALLBACK_MAL_IDS, 5, controller.signal)
            .then(setNews)
            .catch(() => setNews([]));

        getTopReputationUsers(4, controller.signal)
            .then((users) => {
                setLeaderboard(
                    users.map((user, index) => ({
                        rank: index + 1,
                        user: user.username,
                        hearts: user.reputation,
                        avatar: user.profileImage ?? undefined,
                    })),
                );
            })
            .catch(() => setLeaderboard([]));

        getPopularPosts(5, controller.signal)
            .then((result) => {
                setRecommendations(
                    result.map((post) => ({
                        id: String(post.postId),
                        title: post.title,
                        cover: post.photo ?? post.animes[0]?.imgMedium,
                        hearts: post.likes,
                    })),
                );
            })
            .catch(() => setRecommendations([]));

        return () => controller.abort();
    }, []);

    const [search, setSearch] = useState("");

    const filteredFaqs = useMemo(() => {
        if (!search.trim()) return faqs;

        const q = search.toLowerCase();

        return faqs.filter((f) =>
            (f.question + " " + f.answer).toLowerCase().includes(q),
        );
    }, [search]);

    return (
        <div className={styles.page}>
            <Seo
                title="FAQ - Frequently Asked Questions"
                description="Find answers to the most frequently asked questions about REKKO, anime recommendations, features and usage."
                canonicalPath="/faq"
                jsonLd={[
                    websiteJsonLd(),
                    organizationJsonLd(),
                    pageJsonLd({
                        type: "FAQPage",
                        path: "/faq",
                        name: "Frequently Asked Questions",
                        description:
                            "Answers to the most common questions about REKKO and how it works.",
                    }),
                    {
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: faqs.map((f) => ({
                            "@type": "Question",
                            name: f.question,
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: f.answer,
                            },
                        })),
                    },

                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            {
                                "@type": "ListItem",
                                position: 1,
                                name: "Home",
                                item: "/",
                            },
                            {
                                "@type": "ListItem",
                                position: 2,
                                name: "FAQ",
                                item: "/faq",
                            },
                        ],
                    },
                ]}
            />
            <aside className={styles.sidebar}>
                <AnimeNewsCard items={news} />

                {randomWidgets[0] && <AnimeListWidget {...randomWidgets[0]} />}

                <SiteLinks items={siteLinks} />
            </aside>

            <div className={styles.divider} />

            <main className={styles.center}>
                <div className="rounded-card border border-border bg-surface p-8 flex flex-col gap-4">
                    <h1 className="text-4xl font-black tracking-tight mb-2">
                        ❔ Frequently asked questions
                    </h1>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search FAQ..."
                        className="w-full h-[40px] pl-4 pr-10 bg-[rgba(246,246,246,0.6)] border-[1.5px] border-border rounded-pill text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                    />

                    <FAQAccordion faqs={filteredFaqs} />

                    <a href="https://github.com/Rekko-Lists">
                        © 2026 Rekko · Made with ❤️ for the anime community.
                    </a>
                </div>
            </main>

            <div className={styles.divider} />

            <aside className={styles.sidebar}>
                <ReputationLeaderboard
                    entries={leaderboard}
                    onViewMore={() => navigate("/leaderboard")}
                />

                <PopularRecommendationsCard items={recommendations} />

                {randomWidgets[1] && <AnimeListWidget {...randomWidgets[1]} />}
            </aside>
        </div>
    );
}
