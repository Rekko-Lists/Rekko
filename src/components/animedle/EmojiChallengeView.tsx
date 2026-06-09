interface Props {
  data: { emojis?: string[] };
}

const styles = {
  wrapper: 'flex flex-col items-center justify-center h-full gap-4 relative z-10',
  prompt: 'text-sm text-white/70 font-medium uppercase tracking-widest',
  emojiRow: 'flex items-center justify-center gap-3 flex-wrap',
  emoji: 'text-5xl select-none animate-bounce',
};

export default function EmojiChallengeView({ data }: Props) {
  const emojis = data.emojis ?? [];

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
