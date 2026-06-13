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
  isAuthenticated: boolean;
}

const styles = {
  commentsHead: "px-6 py-4 border-b border-border text-sm font-semibold text-text-main",
  commentsViewport: "h-[620px] overflow-y-auto",
  commentRow: "border-b border-border px-6 py-4 flex gap-3 bg-app-bg",
  commentRowNested: "flex gap-2 pt-2",
  commentContent: "min-w-0 flex-1",
  commentTop: "flex items-center gap-2",
  commentUser: "text-sm font-medium text-text-main hover:text-primary",
  commentUserNested: "text-xs font-medium text-text-main hover:text-primary",
  commentMessage: "mt-1 text-sm text-text-main leading-relaxed",
  commentMessageNested: "mt-0.5 text-xs text-text-main leading-relaxed",
  commentActions: "mt-2 flex gap-4 text-xs text-text-muted",
  commentActionsNested: "mt-1 flex gap-3 text-[11px] text-text-muted",
  replyBtn: "hover:text-primary transition-colors",
  repliesToggle: "hover:text-primary transition-colors",
  repliesSection: "mt-2 ml-2 flex flex-col gap-2 border-l-2 border-border-light pl-3",
  replyInputWrap: "mt-2 flex gap-2 items-start",
  replyInput: "flex-1 text-xs border border-border rounded-[5px] px-2 py-1.5 bg-surface text-text-main resize-none focus:outline-none focus:border-text-secondary placeholder:text-text-muted",
  replySubmit: "text-[11px] px-2.5 py-1.5 bg-primary text-white rounded-[5px] hover:bg-primary-dark transition-colors disabled:opacity-60",
  replyCancel: "text-[11px] px-2 py-1.5 text-text-muted hover:text-text-main",
  state: "px-6 py-8 text-center text-text-muted",
  error: "px-6 py-8 text-center text-status-red",
};

// Replies deeper than this no longer offer a reply button, but they are still
// rendered so the whole thread is visible without extra clicks.
const MAX_REPLY_DEPTH = 4;

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
              depth={0}
              activeReplyId={activeReplyId}
              onLike={onLike}
              onReply={onReply}
              onSubmitReply={onSubmitReply}
              isAuthenticated={isAuthenticated}
            />
          ))}
          {loadingMore && <p className={styles.state}>Loading more...</p>}
        </div>
      )}
    </section>
  );
}

interface CommentRowProps {
  comment: CommentData;
  depth: number;
  activeReplyId: number | null;
  onLike: (commentId: number) => void;
  onReply: (commentId: number) => void;
  onSubmitReply: (parentCommentId: number, message: string) => Promise<void>;
  isAuthenticated: boolean;
}

function CommentRow({
  comment,
  depth,
  activeReplyId,
  onLike,
  onReply,
  onSubmitReply,
  isAuthenticated,
}: CommentRowProps) {
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Replies are expanded by default; users can collapse a noisy branch.
  const [collapsed, setCollapsed] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const replies = comment.replies ?? [];
  const hasReplies = replies.length > 0;
  const canReply = isAuthenticated && depth < MAX_REPLY_DEPTH;
  const isReplying = activeReplyId === comment.commentId;
  const isNested = depth > 0;

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
    <article className={isNested ? styles.commentRowNested : styles.commentRow}>
      <Avatar src={comment.user?.profileImage} username={comment.user?.username ?? "Unknown"} size="sm" />
      <div className={styles.commentContent}>
        <div className={styles.commentTop}>
          <Link
            to={comment.user?.username ? `/profile/${comment.user.username}` : "#"}
            className={isNested ? styles.commentUserNested : styles.commentUser}
          >
            {comment.user?.username ?? "Deleted user"}
          </Link>
        </div>
        <p className={isNested ? styles.commentMessageNested : styles.commentMessage}>{comment.message}</p>
        <div className={isNested ? styles.commentActionsNested : styles.commentActions}>
          <button
            type="button"
            className={`flex items-center gap-1 ${comment.hasLiked ? "text-primary" : ""}`}
            onClick={() => onLike(comment.commentId)}
          >
            <Heart size={isNested ? 10 : 11} fill={comment.hasLiked ? "#FF9E00" : "none"} className={comment.hasLiked ? "text-primary" : ""} />
            {comment.likes}
          </button>
          {canReply && (
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
          {hasReplies && (
            <button
              type="button"
              className={styles.repliesToggle}
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? `Show ${replies.length} ${replies.length === 1 ? "reply" : "replies"}` : "Hide replies"}
            </button>
          )}
        </div>

        {canReply && isReplying && (
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

        {hasReplies && !collapsed && (
          <div className={styles.repliesSection}>
            {replies.map((reply) => (
              <CommentRow
                key={reply.commentId}
                comment={reply}
                depth={depth + 1}
                activeReplyId={activeReplyId}
                onLike={onLike}
                onReply={onReply}
                onSubmitReply={onSubmitReply}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
