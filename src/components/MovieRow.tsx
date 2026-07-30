'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { usePlatform } from './PlatformContext';
import { Movie } from '../types';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleMyList: (movieId: string) => void;
  myList: string[];
  isTop10?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  movies,
  onPlay,
  onOpenDetails,
  onToggleMyList,
  myList,
  isTop10,
}) => {
  
  const { platform } = usePlatform();
  const rowRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setIsAtStart(scrollLeft <= 5);
      setIsAtEnd(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [movies]);


  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  const [isRowHovered, setIsRowHovered] = useState(false);

  return (
    <div 
      className="catalog-row" 
      style={{ 
        marginBottom: '44px', 
        padding: '0 4%', 
        position: 'relative', 
        zIndex: isRowHovered ? 50 : 1 
      }}
      onMouseEnter={() => setIsRowHovered(true)}
      onMouseLeave={() => setIsRowHovered(false)}
    >
      {/* Category Row Header with Accent Bar & Explore All Link */}
      <div className="catalog-row-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '4px', height: '22px', background: platform === 'nprime' ? 'var(--primary-color)' : platform === 'hotstar' ? '#1F80E0' : 'linear-gradient(180deg, #E50914 0%, #FF5252 100%)', borderRadius: '2px' }} />
          <h3
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#F8FAFC',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {title}
          </h3>
        </div>

        <button
          onClick={() => handleScroll('right')}
          className="row-explore-all"
          style={{
            background: 'none',
            border: 'none',
            color: platform === 'nprime' ? '#00A8E1' : platform === 'hotstar' ? '#1F80E0' : '#564d4d',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = platform === 'nprime' ? '#00A8E1' : platform === 'hotstar' ? '#1F80E0' : '#564d4d')}
        >
          <span>Explore All</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Row Container with Glass Nav Controls */}
      <div style={{ position: 'relative' }}>
        {/* Left Arrow Button */}
        {!isAtStart && (
        <button
          className="row-nav-btn left"
          onClick={() => handleScroll('left')}
          aria-label={`Scroll ${title} left`}
          style={{
            position: 'absolute',
            left: '-20px',
            top: platform === 'nflix' ? 'calc(50% - 80px)' : '50%',
            transform: 'translateY(-50%)',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            zIndex: 200,
            backgroundColor: 'rgba(15, 15, 15, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(12px)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.85)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            e.currentTarget.style.borderColor = 'var(--primary-color)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.92)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ChevronLeft size={26} />
        </button>
        )}

        {/* Scrollable Movies Row */}
        <div
          className="catalog-row-track hide-scrollbar"
          ref={rowRef}
          onScroll={checkScroll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: platform === 'nflix' 
                ? '40px 20px 200px 20px' // huge bottom padding for Netflix dropdown to prevent vertical clipping
                : '30px 20px 30px 20px',
            marginTop: platform === 'nflix' ? '-30px' : '-20px',
            marginBottom: platform === 'nflix' ? '-190px' : '-20px', // negative margin to compensate for padding
            scrollBehavior: 'smooth',
          }}
        >
          {movies.map((movie, index) => (
            isTop10 ? (
              // Wrapper gives the giant rank number room to hang left outside the card
              <div
                key={movie.id}
                style={{
                  position: 'relative',
                  flexShrink: 0,
                  paddingLeft: index === 0 ? '60px' : '70px',
                }}
              >
                {/* Giant rank number behind the card */}
                <div
                  className="top10-number"
                  style={{
                    position: 'absolute',
                    left: index === 0 ? '-10px' : '-2px',
                    bottom: '-8px',
                    zIndex: 0,
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <MovieCard
                    movie={movie}
                    onPlay={onPlay}
                    onOpenDetails={onOpenDetails}
                    onToggleMyList={onToggleMyList}
                    isMyList={myList.includes(movie.id)}
                    top10Rank={undefined}
                  />
                </div>
              </div>
            ) : (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPlay={onPlay}
                onOpenDetails={onOpenDetails}
                onToggleMyList={onToggleMyList}
                isMyList={myList.includes(movie.id)}
              />
            )
          ))}
        </div>

        {/* Right Arrow Button */}
        {!isAtEnd && (
        <button
          className="row-nav-btn right"
          onClick={() => handleScroll('right')}
          aria-label={`Scroll ${title} right`}
          style={{
            position: 'absolute',
            right: '-20px',
            top: platform === 'nflix' ? 'calc(50% - 80px)' : '50%',
            transform: 'translateY(-50%)',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            zIndex: 200,
            backgroundColor: 'rgba(15, 15, 15, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(12px)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.85)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            e.currentTarget.style.borderColor = 'var(--primary-color)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.92)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ChevronRight size={26} />
        </button>
        )}
      </div>
    </div>
  );
};
