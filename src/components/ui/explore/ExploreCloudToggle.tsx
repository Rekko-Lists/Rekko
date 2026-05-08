interface Props {
  enabled: boolean;
  onToggle: () => void;
}

const styles = {
  button: 'fixed bottom-4 left-4 z-50 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-main shadow-none',
};

export default function ExploreCloudToggle({ enabled, onToggle }: Props) {
  return (
    <button type="button" className={styles.button} onClick={onToggle}>
      Clouds: {enabled ? 'on' : 'off'}
    </button>
  );
}
