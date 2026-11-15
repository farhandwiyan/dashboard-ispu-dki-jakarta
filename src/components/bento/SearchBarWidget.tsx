import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';

interface SearchBarWidgetProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export const SearchBarWidget: React.FC<SearchBarWidgetProps> = ({
  onSearch,
  placeholder = 'Cari stasiun atau wilayah DKI Jakarta...'
}) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center gap-2 w-full bg-white rounded-full pl-4 pr-2.5 py-2 shadow-sm border border-[#CDEAEF] focus-within:ring-2 focus-within:ring-[#4FD1DE] focus-within:border-transparent transition-all h-[48px] overflow-hidden"
      role="search"
      aria-label="Cari stasiun atau wilayah"
    >
      <MapPin className="w-4 h-4 text-[#88A2AA] flex-shrink-0" aria-hidden="true" />
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="flex-1 min-w-0 w-full bg-transparent text-xs sm:text-sm text-[#0D3843] placeholder-[#88A2AA] outline-none font-medium"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[#64748B] hover:text-[#0D3843] hover:bg-[#EAF5F7] transition-colors cursor-pointer"
          aria-label="Hapus pencarian"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
};
