import React from 'react';
import { Sparkles } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { Movie, Actor } from '../types';

interface SearchViewProps {
  searchQuery: string;
  isSearching: boolean;
  languageFilteredSearchResults: Movie[];
  searchActor?: Actor;
  isAILoading: boolean;
  onAISearch: () => void;
  onClearSearch: () => void;
  onPlayMovie: (m: Movie) => void;
  onOpenDetails: (m: Movie) => void;
  onToggleMyList: (id: string) => void;
  myList: string[];
}

export const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  isSearching,
  languageFilteredSearchResults,
  searchActor,
  isAILoading,
  onAISearch,
  onClearSearch,
  onPlayMovie,
  onOpenDetails,
  onToggleMyList,
  myList
}) => {
  return (
    <div style={{ paddingTop: '110px', width: '100%', minHeight: '80vh', paddingBottom: '60px' }}>
      <div style={{ padding: '0 4%', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#FFF', marginBottom: '6px' }}>
            {`Results for "${searchQuery}"`}
          </h2>
          <p style={{ color: '#AAA', fontSize: '0.9rem' }}>
            {isSearching ? 'Searching catalog…' : `Found ${languageFilteredSearchResults.length} matching title${languageFilteredSearchResults.length === 1 ? '' : 's'}`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onAISearch}
            disabled={isAILoading || isSearching}
            style={{
              backgroundColor: 'rgba(229, 9, 20, 0.15)',
              color: '#E50914',
              border: '1px solid rgba(229, 9, 20, 0.4)',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: (isAILoading || isSearching) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} />
            {isAILoading ? 'AI Thinking...' : 'Smart Search'}
          </button>
          <button
            onClick={onClearSearch}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Clear Search
          </button>
        </div>
      </div>

      {isSearching && languageFilteredSearchResults.length === 0 && !searchActor ? (
        <div className="classic-grid">
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{ aspectRatio: '2/3', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
          ))}
        </div>
      ) : languageFilteredSearchResults.length || searchActor || isSearching ? (
        <>
          {searchActor && (
            <div style={{ margin: '0 4% 32px 4%', padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', display: 'flex', gap: '24px', alignItems: 'center' }}>
              <img src={searchActor.profileUrl} alt={searchActor.name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)' }} />
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>{searchActor.name}</h2>
                <p style={{ color: '#AAA', fontSize: '0.9rem', lineHeight: '1.4' }}>{searchActor.knownFor}</p>
              </div>
            </div>
          )}
          <div className="classic-grid">
            {languageFilteredSearchResults.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPlay={onPlayMovie}
                onOpenDetails={onOpenDetails}
                onToggleMyList={onToggleMyList}
                isMyList={myList.includes(movie.id)}
                isSearchResult={true}
              />
            ))}
          </div>
        </>
      ) : (
        <div style={{ padding: '40px 4%', textAlign: 'center', color: '#AAA' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{`No titles found for "${searchQuery}".`}</p>
          <p style={{ fontSize: '0.9rem', color: '#777' }}>Try searching by title, cast member, or click one of the quick genre chips above.</p>
        </div>
      )}
    </div>
  );
};
