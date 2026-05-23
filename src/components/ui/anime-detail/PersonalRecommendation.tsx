const styles = {
  card:    'relative w-full max-w-[449px] h-[188px] bg-surface border border-border rounded-btn font-gabarito flex items-center justify-center overflow-hidden',
  label:   'font-gabarito font-bold text-[20px] text-text-secondary text-center px-6',
  overlay: 'absolute inset-0 bg-[rgba(244,244,244,0.7)] flex items-center justify-center pointer-events-none',
  badge:   'px-3 py-1 rounded-pill bg-primary text-white text-[12px] font-semibold uppercase tracking-wide',
};

export default function PersonalRecommendation() {
  return (
    <section className={styles.card} aria-label="Personal Recommendation">
      <p className={styles.label}>Personal Recommendation:</p>
      <div className={styles.overlay}>
        <span className={styles.badge}>Coming soon</span>
      </div>
    </section>
  );
}
