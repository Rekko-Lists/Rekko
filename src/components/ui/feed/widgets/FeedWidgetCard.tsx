import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  onViewMore?: () => void;
}

const styles = {
  card: "bg-surface border-[1.5px] border-border rounded-card p-4 font-gabarito",
  header: "mb-3 flex items-center justify-between gap-2",
  title: "text-sm font-normal text-text-main",
  viewMore: "text-[11px] font-medium text-primary hover:text-primary-dark hover:underline underline-offset-2",
};

export default function FeedWidgetCard({ title, children, onViewMore }: Props) {
  return (
    <section className={styles.card} aria-label={title}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {onViewMore && (
          <button type="button" className={styles.viewMore} onClick={onViewMore}>
            View more
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
