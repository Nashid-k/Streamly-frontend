const fs = require('fs');
const path = require('path');

const cardPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/MovieCard.tsx');

const newContent = `
'use client';

import React, { useState } from 'react';
import { Play, Plus, Check, Info, Film, Clock, ChevronDown, ThumbsUp } from 'lucide-react';
import { usePlatform } from './PlatformContext';
import { Movie } from '../types';
import { fetchMovieById } from '../lib/api';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleMyList: (movieId: string) => void;
  isMyList: boolean;
  top10Rank?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPlay,
  onOpenDetails,
  onToggleMyList,
  isMyList,
  top10Rank,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { platform } = usePlatform();
  
  // Image logic: Prime/Netflix prefer landscape, Hotstar prefers portrait
  const preferPortrait = platform === 'hotstar' || top10Rank !== undefined;
  const imgSrc = preferPortrait ? (movie.posterUrl || movie.backdropUrl) : (movie.backdropUrl || movie.posterUrl);

  const handleCardClick = () => {
    onPlay(movie);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (movie.id) {
      fetchMovieById(movie.id).catch(() => {});
    }
  };

  // ── HOTSTAR CARD (Vertical, Minimal Hover) ──
  if (platform === 'hotstar') {
    return (
      <div
        className="movie-card hotstar-card"
        role="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        style={{
          position: 'relative',
          flexShrink: 0,
          width: '200px',
          height: '300px',
          borderRadius: '8px',
          cursor: 'pointer',
          overflow: 'hidden',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isHovered ? '0 12px 30px rgba(0,0,0,0.8)' : '0 4px 12px rgba(0,0,0,0.4)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          zIndex: isHovered ? 50 : 1,
          backgroundColor: '#16181F',
        }}
      >
        <img
          src={imgSrc}
          alt={movie.title}
          onLoad={() => setIsImageLoaded(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isImageLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
        />
        {/* Hotstar Hover Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(15,16,20,1) 0%, rgba(15,16,20,0.5) 50%, transparent 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center',
          padding: '16px',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s',
        }}>
          <h4 style={{ color: '#FFF', fontSize: '1rem', fontWeight: 700, textAlign: 'center', marginBottom: '12px' }}>{movie.title}</h4>
          <button style={{
            background: 'var(--primary-color)', color: '#FFF', border: 'none', borderRadius: '4px',
            padding: '8px 16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', width: '100%', justifyContent: 'center'
          }} onClick={(e) => { e.stopPropagation(); onPlay(movie); }}>
            <Play size={14} fill="#FFF" /> Watch Now
          </button>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', width: '100%' }}>
            <button style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#FFF', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onToggleMyList(movie.id); }}>
              {isMyList ? <Check size={16} style={{margin: '0 auto'}}/> : <Plus size={16} style={{margin: '0 auto'}} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PRIME VIDEO CARD (Landscape, Overlay Hover) ──
  if (platform === 'nprime') {
    return (
      <div
        className="movie-card nprime-card"
        role="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        style={{
          position: 'relative',
          flexShrink: 0,
          width: top10Rank !== undefined ? '200px' : '300px',
          height: top10Rank !== undefined ? '300px' : '169px',
          borderRadius: '4px',
          cursor: 'pointer',
          overflow: 'hidden',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isHovered ? '0 10px 25px rgba(0,0,0,0.9)' : '0 4px 10px rgba(0,0,0,0.5)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          zIndex: isHovered ? 50 : 1,
          backgroundColor: '#0F171E',
        }}
      >
        <img
          src={imgSrc}
          alt={movie.title}
          onLoad={() => setIsImageLoaded(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isImageLoaded ? 1 : 0 }}
        />
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, background: '#00A8E1', padding: '2px 8px', borderBottomRightRadius: '4px', fontSize: '0.65rem', fontWeight: 900, color: '#FFF', fontStyle: 'italic' }}>
          prime
        </div>
        {/* Prime Hover Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(15,23,30,1) 0%, rgba(15,23,30,0.6) 60%, transparent 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '12px',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s',
        }}>
          <h4 style={{ color: '#FFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#00A8E1', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onPlay(movie); }}>
              <Play size={14} fill="#FFF" color="#FFF" />
            </button>
            <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }} onClick={(e) => { e.stopPropagation(); onOpenDetails(movie); }}>
              <Info size={16} />
            </button>
            <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }} onClick={(e) => { e.stopPropagation(); onToggleMyList(movie.id); }}>
              {isMyList ? <Check size={16} /> : <Plus size={16} />}
            </button>
          </div>
          <p style={{ color: '#8197A4', fontSize: '0.75rem', marginTop: '8px' }}>{movie.genres.join(' • ')}</p>
        </div>
      </div>
    );
  }

  // ── NETFLIX CARD (Landscape, Expanding Dropdown) ──
  const netflixWidth = top10Rank !== undefined ? 200 : 290;
  const netflixHeight = top10Rank !== undefined ? 300 : 163;
  
  return (
    <div
      className="movie-card netflix-card"
      role="button"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      style={{
        position: 'relative',
        flexShrink: 0,
        width: \`\${netflixWidth}px\`,
        height: \`\${netflixHeight}px\`,
        borderRadius: '4px',
        cursor: 'pointer',
        zIndex: isHovered ? 50 : 1,
        // When hovered, the card breaks out of overflow to show the dropdown
        overflow: 'visible',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: \`\${netflixWidth}px\`,
        background: '#141414',
        borderRadius: '4px',
        boxShadow: isHovered ? '0 14px 28px rgba(0,0,0,0.9), 0 10px 10px rgba(0,0,0,0.8)' : 'none',
        transform: isHovered ? 'scale(1.2)' : 'scale(1)',
        transformOrigin: 'center center',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s',
        zIndex: isHovered ? 50 : 1,
      }}>
        {/* Netflix N Logo */}
        {parseInt(movie.id.replace(/\\D/g, '') || '0') % 3 === 0 && (
          <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/18/Netflix_2016_N_logo.svg" alt="N" style={{ height: '14px' }} />
          </div>
        )}
        <img
          src={imgSrc}
          alt={movie.title}
          onLoad={() => setIsImageLoaded(true)}
          style={{ width: '100%', height: \`\${netflixHeight}px\`, objectFit: 'cover', borderRadius: isHovered ? '4px 4px 0 0' : '4px', opacity: isImageLoaded ? 1 : 0 }}
        />
        
        {/* Expanding Metadata Box (Below Image) */}
        <div style={{
          padding: '12px',
          display: isHovered ? 'block' : 'none',
          backgroundColor: '#141414',
          borderRadius: '0 0 4px 4px',
          width: '100%',
        }}>
          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onPlay(movie); }}>
                <Play size={12} fill="#000" color="#000" />
              </button>
              <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2A2A2A', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }} onClick={(e) => { e.stopPropagation(); onToggleMyList(movie.id); }}>
                {isMyList ? <Check size={14} /> : <Plus size={14} />}
              </button>
              <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2A2A2A', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }} onClick={(e) => { e.stopPropagation(); }}>
                <ThumbsUp size={12} />
              </button>
            </div>
            <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2A2A2A', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }} onClick={(e) => { e.stopPropagation(); onOpenDetails(movie); }}>
              <ChevronDown size={14} />
            </button>
          </div>
          {/* Info Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>
            <span style={{ color: '#46d369' }}>{movie.matchScore}% Match</span>
            <span style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '0 4px', color: '#FFF' }}>16+</span>
            <span style={{ color: '#FFF' }}>{movie.isSeries ? '2 Seasons' : '2h 14m'}</span>
            <span style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '0 4px', fontSize: '0.6rem', color: '#FFF', borderRadius: '2px' }}>HD</span>
          </div>
          {/* Genre Row */}
          <div style={{ color: '#FFF', fontSize: '0.75rem' }}>
            {movie.genres.slice(0, 3).join(' • ')}
          </div>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync(cardPath, newContent);
console.log('done rewriting MovieCard');
