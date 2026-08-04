'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

export interface SearchFiltersState {
  type: 'all' | 'movies' | 'series' | 'anime';
  genre: string;
  yearRange: 'all' | '2020s' | '2010s' | '2000s' | 'older';
  minRating: number; // 0, 70, 80, 90
  language: string;
  sortBy: 'relevance' | 'newest' | 'oldest' | 'rating' | 'popular';
}

export const DEFAULT_SEARCH_FILTERS: SearchFiltersState = {
  type: 'all',
  genre: 'All',
  yearRange: 'all',
  minRating: 0,
  language: 'All',
  sortBy: 'relevance',
};

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onChange: (filters: SearchFiltersState) => void;
  resultCount?: number;
  visible: boolean;
}

const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Thriller', 'Horror', 'Sci-Fi', 'Romance', 'Animation', 'Documentary', 'Crime', 'Fantasy'];
const LANGUAGES = ['All', 'English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Korean', 'Japanese', 'Spanish'];
const YEAR_RANGES = [
  { value: 'all', label: 'All Years' },
  { value: '2020s', label: '2020s' },
  { value: '2010s', label: '2010s' },
  { value: '2000s', label: '2000s' },
  { value: 'older', label: '90s & Earlier' },
] as const;
const RATINGS = [
  { value: 0, label: 'Any' },
  { value: 60, label: '6+' },
  { value: 70, label: '7+' },
  { value: 80, label: '8+' },
  { value: 90, label: '9+' },
];
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
] as const;

const PillButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      flexShrink: 0,
      padding: '5px 13px',
      borderRadius: '20px',
      border: active ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.12)',
      background: active ? 'rgba(229,9,20,0.25)' : 'rgba(255,255,255,0.05)',
      color: active ? '#fff' : 'rgba(255,255,255,0.55)',
      fontWeight: active ? 700 : 400,
      fontSize: '0.78rem',
      cursor: 'pointer',
      transition: 'all 0.15s',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
        e.currentTarget.style.color = '#fff';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
      }
    }}
  >
    {children}
  </button>
);

const FilterRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '32px' }}>
    <span style={{
      fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: '64px', flexShrink: 0,
    }}>
      {label}
    </span>
    <div style={{
      display: 'flex', gap: '6px', flexWrap: 'nowrap', overflowX: 'auto',
      scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '2px',
    }}>
      {children}
    </div>
  </div>
);

export const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onChange, resultCount, visible }) => {
  const update = <K extends keyof SearchFiltersState>(key: K, value: SearchFiltersState[K]) =>
    onChange({ ...filters, [key]: value });

  const hasActiveFilters = (
    filters.type !== 'all' ||
    filters.genre !== 'All' ||
    filters.yearRange !== 'all' ||
    filters.minRating !== 0 ||
    filters.language !== 'All' ||
    filters.sortBy !== 'relevance'
  );

  const resetAll = () => onChange(DEFAULT_SEARCH_FILTERS);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{ overflow: 'hidden' }}
        >
          <div style={{
            background: 'rgba(10,10,10,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '16px 18px',
            margin: '8px 0 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <SlidersHorizontal size={14} style={{ color: 'var(--primary-color)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                  Filters
                  {resultCount !== undefined && (
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginLeft: '6px' }}>
                      · {resultCount} result{resultCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetAll}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '4px 10px', borderRadius: '20px',
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', cursor: 'pointer',
                  }}
                >
                  <X size={11} /> Clear all
                </button>
              )}
            </div>

            {/* Type */}
            <FilterRow label="Type">
              {(['all', 'movies', 'series', 'anime'] as const).map((t) => (
                <PillButton key={t} active={filters.type === t} onClick={() => update('type', t)}>
                  {t === 'all' ? 'All' : t === 'movies' ? 'Movies' : t === 'series' ? 'Series' : 'Anime'}
                </PillButton>
              ))}
            </FilterRow>

            {/* Genre */}
            <FilterRow label="Genre">
              {GENRES.map((g) => (
                <PillButton key={g} active={filters.genre === g} onClick={() => update('genre', g)}>
                  {g}
                </PillButton>
              ))}
            </FilterRow>

            {/* Year */}
            <FilterRow label="Year">
              {YEAR_RANGES.map(({ value, label }) => (
                <PillButton key={value} active={filters.yearRange === value} onClick={() => update('yearRange', value)}>
                  {label}
                </PillButton>
              ))}
            </FilterRow>

            {/* Rating */}
            <FilterRow label="Rating">
              {RATINGS.map(({ value, label }) => (
                <PillButton key={value} active={filters.minRating === value} onClick={() => update('minRating', value)}>
                  {label}
                </PillButton>
              ))}
            </FilterRow>

            {/* Language */}
            <FilterRow label="Language">
              {LANGUAGES.map((l) => (
                <PillButton key={l} active={filters.language === l} onClick={() => update('language', l)}>
                  {l}
                </PillButton>
              ))}
            </FilterRow>

            {/* Sort */}
            <FilterRow label="Sort By">
              {SORT_OPTIONS.map(({ value, label }) => (
                <PillButton key={value} active={filters.sortBy === value} onClick={() => update('sortBy', value)}>
                  {label}
                </PillButton>
              ))}
            </FilterRow>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Apply search filters to a movie list */
export function applySearchFilters(movies: any[], filters: SearchFiltersState): any[] {
  let result = [...movies];

  // Type filter
  if (filters.type === 'movies') result = result.filter((m) => !m.isSeries && !m.isAnime);
  else if (filters.type === 'series') result = result.filter((m) => m.isSeries && !m.isAnime);
  else if (filters.type === 'anime') result = result.filter((m) => m.isAnime);

  // Genre filter
  if (filters.genre !== 'All') {
    result = result.filter((m) =>
      (m.genres || []).some((g: string) => g.toLowerCase().includes(filters.genre.toLowerCase()))
    );
  }

  // Year range filter
  if (filters.yearRange !== 'all') {
    result = result.filter((m) => {
      const year = m.releaseYear || 0;
      if (filters.yearRange === '2020s') return year >= 2020;
      if (filters.yearRange === '2010s') return year >= 2010 && year < 2020;
      if (filters.yearRange === '2000s') return year >= 2000 && year < 2010;
      if (filters.yearRange === 'older') return year < 2000;
      return true;
    });
  }

  // Rating filter
  if (filters.minRating > 0) {
    result = result.filter((m) => (m.matchScore || 0) >= filters.minRating);
  }

  // Language filter
  if (filters.language !== 'All') {
    const lang = filters.language.toLowerCase();
    result = result.filter((m) =>
      (m.audioLanguages || []).some((l: string) => l.toLowerCase().includes(lang)) ||
      (m.subtitleLanguages || []).some((l: string) => l.toLowerCase().includes(lang))
    );
  }

  // Sort
  switch (filters.sortBy) {
    case 'newest': result.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0)); break;
    case 'oldest': result.sort((a, b) => (a.releaseYear || 0) - (b.releaseYear || 0)); break;
    case 'rating': result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)); break;
    case 'popular': result.sort((a, b) => ((b.isTop10 ? 1 : 0) + (b.isTrending ? 1 : 0) + (b.isPopular ? 1 : 0)) - ((a.isTop10 ? 1 : 0) + (a.isTrending ? 1 : 0) + (a.isPopular ? 1 : 0))); break;
    default: break; // relevance: keep original order
  }

  return result;
}
