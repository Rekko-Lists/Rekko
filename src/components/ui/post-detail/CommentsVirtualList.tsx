import type { RefObject, UIEvent } from "react";
import { Link } from "react-router-dom";
import Avatar from "@/components/ui/common/Avatar";
import type { CommentData } from "@/lib/postService";

interface VirtualComment {
  comment: CommentData;
  index: number;
}

interface Props {
  comments: CommentData[];
  virtualComments: VirtualComment[];
  rowHeight: number;
  loadingMore: boolean;
  error: string | null;
  viewportRef: RefObject<HTMLDivElement>;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  onLike: (commentId: number) => void;
}

const styles = {
  commentsHead: "px-6 py-4 border-b border-border text-sm font-semibold text-text-main",
  commentsViewport: "h-[620px] overflow-y-auto relative",
  virtualSpace: "relative",
  commentRow: "absolute left-0 right-0 border-b border-border px-6 py-4 flex gap-3 bg-app-bg",
  commentContent: "min-w-0 flex-1",
  commentTop: "flex items-center gap-2",
  commentUser: "text-sm font-medium text-text-main hover:text-primary",
  commentMessage: "mt-1 text-sm text-text-main leading-relaxed line-clamp-3",
  commentActions: "mt-2 flex gap-4 text-xs text-text-muted",
  state: "px-6 py-8 text-center text-text-muted",
  error: "px-6 py-8 text-center text-status-red",
};

export default function CommentsVirtualList({
  comments,
  virtualComments,
  rowHeight,
  loadingMore,
  error,
  viewportRef,
  onScroll,
  onLike,
}: Props) {
  return (
    <section aria-label="Comments">
      <h2 className={styles.commentsHead}>Comments</h2>
      {error && <p className={styles.error}>{error}</p>}
      {comments.length === 0 ? (
        <p className={styles.state}>No comments yet.</p>
      ) : (
        <div ref={viewportRef} className={styles.commentsViewport} onScroll={onScroll}>
          <div className={styles.virtualSpace} style={{ height: comments.length * rowHeight }}>
            {virtualComments.map(({ comment, index }) => (
              <CommentRow key={comment.commentId} comment={comment} top={index * rowHeight} rowHeight={rowHeight} onLike={onLike} />
            ))}
          </div>
          {loadingMore && <p className={styles.state}>Loading more...</p>}
        </div>
      )}
    </section>
  );
}

function CommentRow({
  comment,
  top,
  rowHeight,
  onLike,
}: {
  comment: CommentData;
  top: number;
  rowHeight: number;
  onLike: (commentId: number) => void;
}) {
  return (
    <article className={styles.commentRow} style={{ top, height: rowHeight }}>
      <Avatar src={comment.user?.profileImage} username={comment.user?.username ?? "Unknown"} size="sm" />
      <div className={styles.commentContent}>
        <div className={styles.commentTop}>
          <Link to={comment.user?.username ? `/profile/${comment.user.username}` : "#"} className={styles.commentUser}>
            {comment.user?.username ?? "Deleted user"}
          </Link>
        </div>
        <p className={styles.commentMessage}>{comment.message}</p>
        <div className={styles.commentActions}>
          <button type="button" className={comment.hasLiked ? "text-primary" : ""} onClick={() => onLike(comment.commentId)}>
            ♥ {comment.likes}
          </button>
          {comment.hasReplies && <span>{comment.replyCount ?? 0} replies</span>}
        </div>
      </div>
    </article>
  );
}
