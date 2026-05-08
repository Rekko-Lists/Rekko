import Icon from '@/components/ui/common/Icon';

const styles = {
  list: 'flex flex-col gap-1 pt-1',
  link: 'flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-text-main transition-colors',
};

export interface SiteLinkItem {
  label: string;
  icon: string;
  href: string;
}

interface Props {
  items: SiteLinkItem[];
}

export default function SiteLinks({ items }: Props) {
  return (
    <div className={styles.list}>
      {items.map(link => (
        <a key={link.label} href={link.href} className={styles.link}>
          <Icon iconName={link.icon} size={18} />
          {link.label}
        </a>
      ))}
    </div>
  );
}
