import AnimeNewsCard from "@/components/ui/feed/AnimeNewsCard";
import PopularRecommendationsCard, { type RecommendationItem } from "@/components/ui/feed/PopularRecommendationsCard";
import type { AnimeNewsItem } from "@/lib/animeNewsService";

interface Props {
  side: "left" | "right";
  news?: AnimeNewsItem[];
  recommendations?: RecommendationItem[];
}

const styles = {
  side: "hidden xl:flex sticky top-[136px] max-h-[calc(100vh-148px)] flex-col gap-4 overflow-y-auto py-6",
  newsWrap: "[&_div:first-child]:p-5 [&_p:first-child]:text-base [&_a]:gap-3 [&_img]:h-[82px] [&_img]:w-[54px]",
};

export default function PostDetailSidebar({ side, news = [], recommendations = [] }: Props) {
  return (
    <aside className={styles.side} aria-label={side === "left" ? "Post news" : "Post recommendations"}>
      {side === "left" ? (
        <div className={styles.newsWrap}>
          <AnimeNewsCard items={news} />
        </div>
      ) : (
        <PopularRecommendationsCard items={recommendations} />
      )}
    </aside>
  );
}
