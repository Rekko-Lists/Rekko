const styles = {
  wrapper:  'flex items-center justify-center',
  logo:     'h-24 w-auto object-contain flex-shrink-0',
  card:     'relative w-full max-w-[449px] h-[188px] bg-surface border border-border rounded-btn font-gabarito flex items-center justify-center overflow-hidden flex-shrink-0',
  label:    'font-gabarito font-bold text-[20px] text-text-secondary text-center px-6',
  overlay:  'absolute inset-0 bg-[rgba(244,244,244,0.7)] flex items-center justify-center pointer-events-none',
  badge:    'px-3 py-1 rounded-pill bg-primary text-white text-[12px] font-semibold uppercase tracking-wide',
  illus:    'h-48 w-auto object-contain flex-shrink-0',
};

export default function PersonalRecommendation() {
  return (
    <div className={styles.wrapper}>
      <img src="/rekko_logo.png" alt="Rekko" className={styles.logo} />
      <section className={styles.card} aria-label="Personal Recommendation">
        <p className={styles.label}>Personal Recommendation:</p>
        <div className={styles.overlay}>
          <span className={styles.badge}>Coming soon</span>
        </div>
      </section>
      <img src="/rekko_char_illustration.png" alt="" className={styles.illus} aria-hidden="true" />
    </div>
  );
}
