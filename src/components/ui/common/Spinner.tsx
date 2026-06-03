interface Props {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
  className?: string;
}

const sizes = { sm: 'w-7 h-7 border-4', md: 'w-10 h-10 border-4', lg: 'w-12 h-12 border-4' };
const variants = {
  default: 'border-primary/30 border-t-primary',
  white: 'border-white/40 border-t-white',
};

export default function Spinner({ size = 'md', variant = 'default', className = '' }: Props) {
  return (
    <div className={`${sizes[size]} ${variants[variant]} rounded-full animate-spin ${className}`} />
  );
}
