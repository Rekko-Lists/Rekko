import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'pill' | 'amber' | 'like';

const styles: Record<Variant, string> = {
  primary: 'bg-gradient-cta text-white rounded-btn h-[40px] px-6 text-sm',
  pill:    'bg-gradient-cta text-white rounded-pill h-[50px] px-6 text-xl',
  amber:   'bg-primary-dark text-white rounded-[5px] h-[26px] px-3 text-sm',
  like:    'bg-gradient-cta text-white rounded-pill h-[22px] px-3 text-xs',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({ variant = 'primary', className = '', children, ...props }: Props) {
  return (
    <button
      className={`font-gabarito inline-flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 cursor-pointer ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
