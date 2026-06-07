import { FormEvent, useRef, useState, type RefObject, type UIEvent } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "@/components/ui/common/Avatar";
import type { CommentData } from "@/lib/postService";

interface Props {
  comments: CommentData[];
  loadingMore: boolean;
  error: string | null;
  viewportRef: RefObject<HTMLDivElement>;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  onLike: (commentId: number) => void;
  activeReplyId: number | null;
  onReply: (commentId: number) => void;
  onSubmitReply: (parentCommentId: number, message: string) => Promise<void>;
  repliesMap: Record<number, CommentData[]>;
  onShowReplies: (commentId: number) => void;
  isAuthenticated: boolean;
}

const styles = {
  commentsHead: "px-6 py-4 border-b border-border text-sm font-semibold text-text-main",
  commentsViewport: "h-[620px] overflow-y-auto",
  commentRow: "border-b border-border px-6 py-4 flex gap-3 bg-app-bg",
  commentContent: "min-w-0 flex-1",
  commentTop: "flex items-center gap-2",
  commentUser: "text-sm font-medium text-text-main hover:text-primary",
  commentMessage: "mt-1 text-sm text-text-main leading-relaxed",
  commentActions: "mt-2 flex gap-4 text-xs text-text-muted",
  replyBtn: "hover:text-primary transition-colors",
  repliesToggle: "hover:text-primary transition-colors",
  repliesSection: "mt-2 ml-2 flex flex-col gap-2 border-l border-border pl-3",
  replyRow: "flex gap-2",
  replyContent: "min-w-0 flex-1",
  replyUser: "text-xs font-medium text-text-main hover:text-primary",
  replyMessage: "mt-0.5 text-xs text-text-main leading-relaxed",
  replyActions: "mt-1 flex gap-3 text-[11px] text-text-muted",
  replyInputWrap: "mt-2 flex gap-2 items-start",
  replyInput: "flex-1 text-xs border border-border rounded-[5px] px-2 py-1.5 bg-surface text-text-main resize-none focus:outline-none focus:border-text-secondary placeholder:text-text-muted",
  replySubmit: "text-[11px] px-2.5 py-1.5 bg-primary text-white rounded-[5px] hover:bg-primary-dark transition-colors disabled:opacity-60",
  replyCancel: "text-[11px] px-2 py-1.5 text-text-muted hover:text-text-main",
  state: "px-6 py-8 text-center text-text-muted",
  error: "px-6 py-8 text-center text-status-red",
};

export default function CommentsVirtualList({
  comments,
  loadingMore,
  error,
  viewportRef,
  onScroll,
  onLike,
  activeReplyId,
  onReply,
  onSubmitReply,
  repliesMap,
  onShowReplies,
  isAuthenticated,
}: Props) {
  return (
    <section aria-label="Comments">
      <h2 className={styles.commentsHead}>Comments</h2>
      {error && <p className={styles.error}>{error}</p>}
      {comments.length === 0 ? (
        <p className={styles.state}>No comments yet.</p>
      ) : (
        <div ref={viewportRef} className={styles.commentsViewport} onScroll={onScroll}>
          {comments.map((comment) => (
            <CommentRow
              key={comment.commentId}
              comment={comment}
              onLike={onLike}
              isReplying={activeReplyId === comment.commentId}
              onReply={onReply}
              onSubmitReply={onSubmitReply}
              replies={repliesMap[comment.commentId]}
              onShowReplies={onShowReplies}
              isAuthenticated={isAuthenticated}
            />
          ))}
          {loadingMore && <p className={styles.state}>Loading more...</p>}
        </div>
      )}
    </section>
  );
}

function CommentRow({
  comment,
  onLike,
  isReplying,
  onReply,
  onSubmitReply,
  replies,
  onShowReplies,
  isAuthenticated,
}: {
  comment: CommentData;
  onLike: (commentId: number) => void;
  isReplying: boolean;
  onReply: (commentId: number) => void;
  onSubmitReply: (parentCommentId: number, message: string) => Promise<void>;
  replies?: CommentData[];
  onShowReplies: (commentId: number) => void;
  isAuthenticated: boolean;
}) {
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasExpandedReplies = Boolean(replies);

  async function handleReplySubmit(e: FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmitReply(comment.commentId, replyText);
      setReplyText("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className={styles.commentRow}>
      <Avatar src={comment.user?.profileImage} username={comment.user?.username ?? "Unknown"} size="sm" />
      <div className={styles.commentContent}>
        <div className={styles.commentTop}>
          <Link to={comment.user?.username ? `/profile/${comment.user.username}` : "#"} className={styles.commentUser}>
            {comment.user?.username ?? "Deleted user"}
          </Link>
        </div>
        <p className={styles.commentMessage}>{comment.message}</p>
        <div className={styles.commentActions}>
          <button
            type="button"
            className={`flex items-center gap-1 ${comment.hasLiked ? "text-primary" : ""}`}
            onClick={() => onLike(comment.commentId)}
          >
            <Heart size={11} fill={comment.hasLiked ? "#FF9E00" : "none"} className={comment.hasLiked ? "text-primary" : ""} />
            {comment.likes}
          </button>
          {isAuthenticated && (
            <button
              type="button"
              className={styles.replyBtn}
              onClick={() => {
                onReply(comment.commentId);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
            >
              Reply
            </button>
          )}
          {comment.hasReplies && (
            <button
              type="button"
              className={styles.repliesToggle}
              onClick={() => onShowReplies(comment.commentId)}
            >
              {hasExpandedReplies ? "Hide replies" : `Show ${comment.replyCount ?? ""} replies`}
            </button>
          )}
        </div>

        {isReplying && (
          <form className={styles.replyInputWrap} onSubmit={handleReplySubmit}>
            <textarea
              ref={inputRef}
              className={styles.replyInput}
              rows={2}
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <button type="submit" className={styles.replySubmit} disabled={submitting || !replyText.trim()}>
                {submitting ? "..." : "Reply"}
              </button>
              <button type="button" className={styles.replyCancel} onClick={() => onReply(comment.commentId)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {hasExpandedReplies && replies!.length > 0 && (
          <div className={styles.repliesSection}>
            {replies!.map((reply) => (
              <div key={reply.commentId} className={styles.replyRow}>
                <Avatar src={reply.user?.profileImage} username={reply.user?.username ?? "Unknown"} size="sm" />
                <div className={styles.replyContent}>
                  <Link to={reply.user?.username ? `/profile/${reply.user.username}` : "#"} className={styles.replyUser}>
                    {reply.user?.username ?? "Deleted user"}
                  </Link>
                  <p className={styles.replyMessage}>{reply.message}</p>
                  <div className={styles.replyActions}>
                    <button
                      type="button"
                      className={`flex items-center gap-1 ${reply.hasLiked ? "text-primary" : ""}`}
                      onClick={() => onLike(reply.commentId)}
                    >
                      <Heart size={10} fill={reply.hasLiked ? "#FF9E00" : "none"} className={reply.hasLiked ? "text-primary" : ""} />
                      {reply.likes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
