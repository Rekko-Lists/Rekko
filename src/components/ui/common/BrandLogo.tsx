import lightLogo from '@/assets/rekko_logo.png';
import darkLogo from '@/assets/rekko_logo_dark.png';

export default function BrandLogo({ className }: { className?: string }) {
  return (
    <>
      <img src={lightLogo} alt="Rekko" className={`${className ?? ''} dark:hidden`} />
      <img src={darkLogo} alt="Rekko" className={`${className ?? ''} hidden dark:block`} />
    </>
  );
}
