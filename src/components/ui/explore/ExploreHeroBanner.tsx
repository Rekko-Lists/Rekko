const styles = {
  banner: "relative h-[178px] overflow-hidden rounded-card border border-border bg-primary",
  clouds: "absolute inset-0 bg-[url('/bg-clouds-banner.png')] bg-cover bg-center bg-no-repeat opacity-95",
  glow: "absolute inset-0 bg-[radial-gradient(circle_at_22%_30%,rgba(255,255,255,.42),transparent_35%)]",
  copy: "relative z-10 flex h-full flex-col justify-center px-8",
  eyebrow: "text-xs font-bold uppercase tracking-[0.28em] text-white/80",
  title: "mt-2 max-w-[640px] text-[42px] font-black leading-none text-white drop-shadow",
  sub: "mt-3 max-w-[520px] text-sm text-white/85",
};

export default function ExploreHeroBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.clouds} aria-hidden />
      <div className={styles.glow} aria-hidden />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Explore report</p>
        <h1 className={styles.title}>Discover what anime is moving right now</h1>
        <p className={styles.sub}>Seasonal highlights, weekly popularity, new recommendations and ranked watch targets in one place.</p>
      </div>
    </section>
  );
}
