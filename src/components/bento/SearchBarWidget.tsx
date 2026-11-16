import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Search, X, ArrowUpRight } from 'lucide-react';
import {
  STATIONS,
  KECAMATAN_STATION_MAP,
  StationData
} from '../../utils/dataParser';
import { getChoroplethColor } from '../../utils/colorMapping';

export interface SearchSuggestionItem {
  key: string;
  type: 'kecamatan' | 'stasiun';
  title: string;
  kecamatanRaw?: string;
  station: StationData;
  city: string;
}

interface SearchBarWidgetProps {
  onSearch?: (query: string) => void;
  onSelectResult?: (station: StationData, kecamatanName?: string) => void;
  placeholder?: string;
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

export const SearchBarWidget: React.FC<SearchBarWidgetProps> = ({
  onSearch,
  onSelectResult,
  placeholder = 'Cari kecamatan'
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build master list of 42 Kecamatan + 5 SPKU Stations
  const allItems = useMemo<SearchSuggestionItem[]>(() => {
    const kecList: SearchSuggestionItem[] = Object.entries(KECAMATAN_STATION_MAP)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([kecRaw, meta]) => {
        const st =
          STATIONS.find((s) => s.id === meta.stationId) || STATIONS[0];
        return {
          key: `kec-${kecRaw}`,
          type: 'kecamatan',
          title: toTitleCase(kecRaw),
          kecamatanRaw: kecRaw,
          station: st,
          city: meta.city
        };
      });

    const stList: SearchSuggestionItem[] = STATIONS.map((st) => ({
      key: `st-${st.id}`,
      type: 'stasiun',
      title: st.name,
      station: st,
      city: st.city
    }));

    return [...kecList, ...stList];
  }, []);

  // Filter & rank suggestions based on query
  const suggestions = useMemo<SearchSuggestionItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const scored: Array<{ item: SearchSuggestionItem; score: number }> = [];

    for (const item of allItems) {
      const titleLower = item.title.toLowerCase();
      const stIdLower = item.station.id.toLowerCase();
      const stNameLower = item.station.name.toLowerCase();
      const cityLower = item.city.toLowerCase();
      const words = titleLower.split(/\s+/);

      let score = 0;
      if (item.type === 'kecamatan' && titleLower.startsWith(q)) {
        // Highest priority: Kecamatan starting with typed letter(s), e.g. "d" -> Duren Sawit, "c" -> Cakung, Cengkareng
        score = 100;
      } else if (item.type === 'kecamatan' && words.some((w) => w.startsWith(q))) {
        // Second priority: Second word of Kecamatan starts with query
        score = 85;
      } else if (item.type === 'stasiun' && (stIdLower.startsWith(q) || stNameLower.startsWith(q))) {
        // Station ID/name starts with query (e.g. "dki" or "d")
        score = 75;
      } else if (item.type === 'kecamatan' && titleLower.includes(q)) {
        score = 60;
      } else if (
        stIdLower.includes(q) ||
        stNameLower.includes(q) ||
        cityLower.includes(q)
      ) {
        score = item.type === 'stasiun' ? 50 : 40;
      }

      if (score > 0) {
        scored.push({ item, score });
      }
    }

    return scored
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.item.title.localeCompare(b.item.title);
      })
      .slice(0, 8)
      .map((s) => s.item);
  }, [query, allItems]);

  // Inline ghost autocomplete suffix (e.g. typing "C" shows faint "akung" right after "C")
  const ghostMatch = useMemo(() => {
    const trimmed = query.trimStart();
    if (!trimmed) return null;
    const qLower = trimmed.toLowerCase();

    // If user highlighted a suggestion via ArrowUp/ArrowDown that starts with query, prefer it
    if (
      activeIndex >= 0 &&
      suggestions[activeIndex] &&
      suggestions[activeIndex].title.toLowerCase().startsWith(qLower)
    ) {
      const target = suggestions[activeIndex];
      return {
        item: target,
        suffix: target.title.slice(trimmed.length)
      };
    }

    // Otherwise find first suggestion (alphabetical) whose title starts with typed text
    const prefixItem = suggestions.find((s) =>
      s.title.toLowerCase().startsWith(qLower)
    );
    if (!prefixItem) return null;

    return {
      item: prefixItem,
      suffix: prefixItem.title.slice(trimmed.length)
    };
  }, [query, suggestions, activeIndex]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(val.trim().length > 0);
    setActiveIndex(-1);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleSelectSuggestion = (item: SearchSuggestionItem) => {
    const searchVal = item.kecamatanRaw || item.station.id;
    setQuery(item.title);
    setIsOpen(false);
    setActiveIndex(-1);
    if (onSearch) {
      onSearch(searchVal);
    }
    if (onSelectResult) {
      onSelectResult(item.station, item.kecamatanRaw);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    if (onSearch) {
      onSearch('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'Tab' || e.key === 'ArrowRight') {
      if (ghostMatch && ghostMatch.suffix) {
        e.preventDefault();
        setQuery(ghostMatch.item.title);
        if (onSearch) {
          onSearch(ghostMatch.item.kecamatanRaw || ghostMatch.item.station.id);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen =
        activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];
      if (chosen) {
        handleSelectSuggestion(chosen);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      const chosen =
        activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];
      handleSelectSuggestion(chosen);
    } else if (onSearch) {
      onSearch(query);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 w-full bg-white rounded-full pl-4 pr-2.5 py-2 shadow-sm border border-[#CDEAEF] focus-within:ring-2 focus-within:ring-[#4FD1DE] focus-within:border-transparent transition-all h-[46px]"
        role="search"
        aria-label="Cari kecamatan"
      >
        <Search
          className="w-4 h-4 text-[#0284C7] flex-shrink-0"
          aria-hidden="true"
        />
        <div className="relative flex-1 min-w-0 flex items-center h-full overflow-hidden">
          {/* Ghost inline autocomplete overlay (low opacity) */}
          {ghostMatch && ghostMatch.suffix && (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center pointer-events-none select-none text-xs sm:text-sm font-medium whitespace-pre overflow-hidden"
            >
              <span className="invisible">{query}</span>
              <span className="text-[#0D3843]/35">{ghostMatch.suffix}</span>
            </div>
          )}
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className="relative z-10 w-full bg-transparent text-xs sm:text-sm text-[#0D3843] placeholder-[#88A2AA] outline-none font-medium"
          />
        </div>
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

      {/* Dropdown Autocomplete Suggestions */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[1500] bg-white rounded-2xl shadow-xl border border-[#BAE6FD] overflow-hidden animate-in fade-in duration-150">
          {suggestions.length > 0 ? (
            <div className="py-1.5 max-h-[320px] overflow-y-auto divide-y divide-[#F0FAFB]">
              <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FDFF] flex items-center justify-between">
                <span>Saran Kecamatan & Wilayah SPKU</span>
                <span>{suggestions.length} Hasil</span>
              </div>
              {suggestions.map((item, idx) => {
                const choro = getChoroplethColor(item.station.avgIspu);
                const isHighlighted = idx === activeIndex;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelectSuggestion(item)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isHighlighted ? 'bg-[#F0F9FF]' : 'hover:bg-[#F8FDFF]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-extrabold text-[10px] shadow-2xs"
                        style={{ backgroundColor: choro.pinColor }}
                      >
                        {item.station.id}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[#0D3843] truncate">
                            {item.type === 'kecamatan'
                              ? `Kec. ${item.title}`
                              : item.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">
                            {item.station.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-[#0284C7] flex-shrink-0" />
                          <span>{item.city}</span>
                          <span>•</span>
                          <span className="font-semibold text-[#0D3843]">
                            Mean {item.station.avgIspu.toFixed(1)} ISPU
                          </span>
                        </div>
                      </div>
                    </div>

                    <ArrowUpRight className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-[#64748B]">
              Tidak ditemukan kecamatan atau stasiun untuk{' '}
              <strong className="text-[#0D3843]">"{query}"</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
