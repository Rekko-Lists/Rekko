import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { PostDetailData } from "@/lib/postService";

interface Props {
  title: string;
  posts: PostDetailData[];
}

const styles = {
  section: "rounded-card border border-border bg-surface/90 p-5 shadow-sm",
  title: "mb-4 text-[22px] font-bold text-text-main",
  row: "flex gap-4 overflow-x-auto pb-2",
  card: "group relative min-w-[280px] max-w-[320px] flex-1 overflow-hidden rounded-card border border-border bg-app-bg transition-transform hover:-translate-y-1 hover:shadow-card",
  media: "h-[130px] bg-gradient-to-br from-slate-400 to-slate-800",
  img: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
  body: "p-4",
  postTitle: "line-clamp-2 text-sm font-semibold text-text-main",
  meta: "mt-3 flex items-center gap-4 text-xs text-text-muted",
};

export default function ExplorePostCarousel({ title, posts }: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.row}>
        {posts.map((post) => (
          <Link key={post.postId} to={`/post/${post.postId}`} className={styles.card}>
            <div className={styles.media}>
              {post.photo ? <img src={post.photo} alt="" className={styles.img} /> : null}
            </div>
            <div className={styles.body}>
              <h3 className={styles.postTitle}>{post.title}</h3>
              <div className={styles.meta}>
                <span className="flex items-center gap-1"><Heart size={13} /> {post.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle size={13} /> {post.commentCount ?? 0}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
