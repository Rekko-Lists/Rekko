interface Props {
  data: { emojis?: string[] };
}

export default function EmojiChallengeView({ data }: Props) {
  const emojis = data.emojis ?? [];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <p className="text-sm text-text-muted font-medium uppercase tracking-widest">
        ¿Qué anime representan estos emojis?
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {emojis.map((emoji, i) => (
          <span
            key={i}
            className="text-5xl select-none animate-bounce"
            style={{ animationDelay: `${i * 80}ms`, animationDuration: '1.4s' }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
