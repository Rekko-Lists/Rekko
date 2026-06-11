interface Props {
  data: { emojis?: string[] };
}

// Canonical shape is { emojis: string[] }. Legacy rows stored the emojis as
// separate emoji1..emoji5 keys, so we read both.
function resolveEmojis(data: { emojis?: string[] }): string[] {
  if (Array.isArray(data.emojis)) return data.emojis.filter(Boolean);
  const legacy = data as Record<string, unknown>;
  return [legacy.emoji1, legacy.emoji2, legacy.emoji3, legacy.emoji4, legacy.emoji5]
    .map(e => (e == null ? '' : String(e)))
    .filter(Boolean);
}

const styles = {
  wrapper: 'flex flex-col items-center justify-center h-full gap-4 relative z-10',
  prompt: 'text-sm text-white/70 font-medium uppercase tracking-widest',
  emojiRow: 'flex items-center justify-center gap-3 flex-wrap',
  emoji: 'text-5xl select-none animate-bounce',
};

export default function EmojiChallengeView({ data }: Props) {
  const emojis = resolveEmojis(data);

  return (
    <div className={styles.wrapper}>
      <p className={styles.prompt}>¿Qué anime representan estos emojis?</p>
      <div className={styles.emojiRow}>
        {emojis.map((emoji, i) => (
          <span
            key={i}
            className={styles.emoji}
            style={{ animationDelay: `${i * 80}ms`, animationDuration: '1.4s' }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
