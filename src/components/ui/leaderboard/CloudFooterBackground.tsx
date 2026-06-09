const styles = {
  footer:
    "pointer-events-none absolute inset-x-0 bottom-0 z-0 hidden h-[clamp(450px,23.44vw,600px)] w-full bg-[url('/rekko_clouds_fullhd.png')] bg-[length:100%_auto] bg-no-repeat min-[1900px]:block min-[2600px]:hidden",
};

export default function CloudFooterBackground() {
  return (
    <div
      className={styles.footer}
      style={{ backgroundPosition: 'center clamp(-370px,-14.45vw,-278px)' }}
      aria-hidden
    />
  );
}
