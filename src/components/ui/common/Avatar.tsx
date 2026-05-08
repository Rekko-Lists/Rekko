const sizeMap = {
  sm: 'w-[34px] h-[34px] text-sm',
  md: 'w-[55px] h-[55px] text-base',
  lg: 'w-[118px] h-[118px] text-3xl',
};

interface Props {
  src?: string;
  username?: string;
  size?: keyof typeof sizeMap;
  className?: string;
}

export default function Avatar({ src, username, size = 'sm', className = '' }: Props) {
  const initials = username ? username[0].toUpperCase() : '?';
  return (
    <div className={`rounded-full overflow-hidden bg-border-light flex items-center justify-center flex-shrink-0 ${sizeMap[size]} ${className}`}>
      {src
        ? <img src={src} alt={username ?? ''} className="w-full h-full object-cover" />
        : <span className="font-gabarito font-semibold text-text-secondary">{initials}</span>
      }
    </div>
  );
}
