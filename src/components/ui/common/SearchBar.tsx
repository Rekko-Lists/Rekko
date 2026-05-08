import { Search } from 'lucide-react';

interface Props {
  placeholder?: string;
}

export default function SearchBar({ placeholder = 'Search for anything' }: Props) {
  return (
    <div className="relative w-[380px]">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full h-[40px] pl-4 pr-10 bg-[rgba(246,246,246,0.6)] border-[1.5px] border-border rounded-pill font-gabarito text-sm text-text-main placeholder:text-text-muted focus:outline-none"
      />
      <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
