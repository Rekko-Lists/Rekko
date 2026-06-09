import type { FormEvent } from "react";
import Avatar from "@/components/ui/common/Avatar";
import type { AuthUser } from "@/store/useAuthStore";

interface Props {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  message: string;
  submitting: boolean;
  onMessageChange: (message: string) => void;
  onSubmit: (event: FormEvent) => void;
}

const styles = {
  commentForm: "px-6 py-5 border-b border-border bg-app-bg",
  commentComposer: "flex gap-3",
  composerBody: "min-w-0 flex-1",
  commentBox:
    "w-full min-h-[92px] resize-y rounded-card border border-border bg-surface px-4 py-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary",
  formFooter: "mt-3 flex items-center justify-between gap-3",
  formHint: "text-xs text-text-muted",
  submit:
    "h-9 px-5 rounded-pill bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed",
};

export default function CommentComposer({
  currentUser,
  isAuthenticated,
  message,
  submitting,
  onMessageChange,
  onSubmit,
}: Props) {
  return (
    <form className={styles.commentForm} onSubmit={onSubmit}>
      <div className={styles.commentComposer}>
        <Avatar src={currentUser?.profileImage} username={currentUser?.username ?? "User"} size="sm" />
        <div className={styles.composerBody}>
          <textarea
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            className={styles.commentBox}
            maxLength={2000}
            placeholder={isAuthenticated ? "Write a comment..." : "Sign in to comment"}
            disabled={submitting || !isAuthenticated}
          />
          <div className={styles.formFooter}>
            <span className={styles.formHint}>Comments currently support text only. {message.length}/2000</span>
            <button
              type="submit"
              className={styles.submit}
              disabled={submitting || !isAuthenticated || message.trim().length === 0}
            >
              {submitting ? "Posting..." : "Comment"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
