interface Props {
  enabled: boolean;
  onToggle: () => void;
}

const styles = {
  // bottom-20 en movil para no chocar con la bottom nav
  button: 'fixed bottom-20 left-4 z-40 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-main shadow-none lg:bottom-4 lg:z-50',
};

export default function ExploreCloudToggle({ enabled, onToggle }: Props) {
  return (
    <button type="button" className={styles.button} onClick={onToggle}>
      Clouds: {enabled ? 'on' : 'off'}
    </button>
  );
}
