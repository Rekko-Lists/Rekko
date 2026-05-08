type Status = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

const map: Record<Status, { label: string; bg: string }> = {
  watching:      { label: 'Watching',       bg: 'bg-status-blue'  },
  completed:     { label: 'Completed',      bg: 'bg-status-green' },
  on_hold:       { label: 'On Hold',        bg: 'bg-primary'      },
  dropped:       { label: 'Dropped',        bg: 'bg-status-red'   },
  plan_to_watch: { label: 'Plan to Watch',  bg: 'bg-[#888888]'    },
};

interface Props {
  status: Status;
  className?: string;
}

export default function Badge({ status, className = '' }: Props) {
  const { label, bg } = map[status];
  return (
    <span className={`font-gabarito text-xs text-white px-2 py-0.5 rounded-full ${bg} ${className}`}>
      {label}
    </span>
  );
}
