
'use client';

import React, { useState } from 'react';
import { Play, Plus, Check, Info, Film, Clock, ChevronDown, ThumbsUp } from 'lucide-react';
import { usePlatform } from './PlatformContext';
import { Movie } from '../types';
import { fetchMovieById } from '../lib/api';
import { HoverTrailer } from './HoverTrailer';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleMyList: (movieId: string) => void;
  isMyList: boolean;
  top10Rank?: number;
  /** When true the card is inside search results — click goes straight to playback */
  isSearchResult?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPlay,
  onOpenDetails,
  onToggleMyList,
  isMyList,
  top10Rank,
  isSearchResult = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { platform } = usePlatform();
  
  // Image logic: Prime/Netflix prefer landscape, Hotstar prefers portrait
  const preferPortrait = platform === 'hotstar' || top10Rank !== undefined;
  const primaryImg = preferPortrait ? (movie.posterUrl || movie.backdropUrl) : (movie.backdropUrl || movie.posterUrl);
  const fallbackImg = preferPortrait ? (movie.backdropUrl || movie.posterUrl) : (movie.posterUrl || movie.backdropUrl);

  let imgSrc = primaryImg;
  if (imgFailed || !imgSrc) {
    imgSrc = fallbackImg && fallbackImg !== primaryImg ? fallbackImg : '';
  }

  const handleCardClick = () => {
    onOpenDetails(movie);
  };

  const renderPlatformLogo = (label: string) => {
    if (label === 'Netflix') {
      return <div key="Netflix" style={{ width: '22px', height: '22px', background: '#E50914', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.7rem', color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.6)' }} title="Available on Netflix">N</div>;
    }
    if (label === 'Prime Video') {
      return <div key="Prime Video" style={{ width: '22px', height: '22px', background: '#00A8E1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.7rem', color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.6)' }} title="Available on Prime Video">P</div>;
    }
    if (label === 'Hotstar') {
      return <div key="Hotstar" style={{ width: '22px', height: '22px', background: '#1F80E0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.6rem', color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.6)' }} title="Available on Disney+ Hotstar">H+</div>;
    }
    return null;
  };

  const renderProgressBar = () => {
    if (movie.watchProgress === undefined) return null;
    return (
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.2)', zIndex: 20 }}>
        <div style={{ width: `${Math.max(5, Math.min(100, movie.watchProgress * 100))}%`, height: '100%', background: platform === 'nprime' ? '#00A8E1' : platform === 'hotstar' ? '#1F80E0' : '#E50914' }} />
      </div>
    );
  };

  const platformBadges = movie.availablePlatforms && movie.availablePlatforms.length > 0 ? (
    <div style={{
      position: 'absolute', top: '8px', right: '8px',
      display: 'flex', gap: '4px',
      zIndex: 20,
    }}>
      {movie.availablePlatforms.map((label) => renderPlatformLogo(label))}
    </div>
  ) : null;

  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (movie.id) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        setShowTrailer(true);
        fetchMovieById(movie.id).catch(() => {});
      }, 500);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTrailer(false);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const matchScore = movie.matchScore || (parseInt(movie.id.replace(/\D/g, '') || '0') % 30 + 70);
  const rawScore = movie.score || (matchScore / 10);
  const ratingText = rawScore.toFixed(1);

  const imdbBadge = (
    <div style={{
      position: 'absolute', bottom: '8px', left: '8px', zIndex: 15,
      background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px',
      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: 800, color: '#fff',
      boxShadow: '0 2px 6px rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      opacity: isHovered ? 0 : 1, transition: 'opacity 0.2s',
    }}>
      <span style={{ color: '#F5C518' }}>IMDb</span>
      <span>{ratingText}</span>
    </div>
  );

  // ── HOTSTAR CARD (Vertical Poster with Gradient Mask & Watch Hover) ──
  if (platform === 'hotstar') {
    return (
      <div
        className={`movie-card hotstar-card ${top10Rank !== undefined ? 'top10' : ''}`}
        role="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        style={{
          position: 'relative',
          flexShrink: 0,
          width: '185px',
          height: '275px',
          borderRadius: '8px',
          cursor: 'pointer',
          overflow: 'hidden',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          boxShadow: isHovered ? '0 12px 32px rgba(0,0,0,0.85), 0 0 16px rgba(31, 128, 224, 0.6)' : '0 4px 14px rgba(0,0,0,0.5)',
          border: isHovered ? '2px solid rgba(31, 128, 224, 0.9)' : '1px solid rgba(255,255,255,0.05)',
          transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), border 0.35s ease',
          zIndex: isHovered ? 50 : 1,
          backgroundColor: '#0F1014',
          willChange: 'transform, box-shadow',
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={movie.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            onError={() => { 
              if (!imgFailed && fallbackImg && fallbackImg !== primaryImg) {
                setImgFailed(true); 
              } else {
                setIsImageLoaded(true); 
              }
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isImageLoaded ? 1 : 0, transition: 'opacity 0.2s ease, transform 0.4s ease', transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', textAlign: 'center' }}>
            <Film size={28} color="#1F80E0" style={{ marginBottom: '8px' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>{movie.title}</span>
          </div>
        )}
        {showTrailer && movie.trailerUrl && (
          <HoverTrailer trailerUrl={movie.trailerUrl} isMuted={true} />
        )}
        {imdbBadge}
        {/* Hotstar Authentic Badges */}
        {movie.isRecentlyAdded && !movie.isUpcoming && !movie.isLeavingSoon && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: '#1F80E0', color: '#FFF', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 800, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em', boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            NEW
          </div>
        )}
        {movie.isLeavingSoon && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'rgba(15,16,20,0.85)', border: '1px solid #F59E0B', color: '#F59E0B', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 800, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em', backdropFilter: 'blur(4px)' }}>
            LEAVING SOON
          </div>
        )}
        {movie.isUpcoming && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: '#F59E0B', color: '#000', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 900, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em', boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            COMING SOON
          </div>
        )}
        {/* Hotstar Gradient Hover Sheet */}
        <div className="expanding-meta" style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 40%, rgba(15,16,20,0.8) 70%, rgba(15,16,20,0.98) 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '14px',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1F80E0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            {movie.isSeries ? 'Series' : 'Movie'}
          </span>
          <h4 style={{ color: '#FFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</h4>
          <button style={{
            background: 'var(--primary-color)', color: '#FFF', border: 'none', borderRadius: '6px',
            padding: '8px 14px', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', width: '100%', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(31, 128, 224, 0.5)'
          }} onClick={(e) => { e.stopPropagation(); onPlay(movie); }}>
            <Play size={13} fill="#FFF" /> Watch Now
          </button>
        </div>
        {/* Platform Availability Badges */}
        {platformBadges}
        {renderProgressBar()}
      </div>
    );
  }

  // ── PRIME VIDEO CARD (Landscape Card with Electric Blue Ring & Quick Actions) ──
  if (platform === 'nprime') {
    return (
      <div
        className={`movie-card nprime-card ${top10Rank !== undefined ? 'top10' : ''}`}
        role="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        style={{
          position: 'relative',
          flexShrink: 0,
          width: top10Rank !== undefined ? '190px' : '280px',
          height: top10Rank !== undefined ? '280px' : '158px',
          borderRadius: '6px',
          cursor: 'pointer',
          overflow: 'hidden',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          boxShadow: isHovered ? '0 12px 30px rgba(0,0,0,0.95), 0 0 20px rgba(0, 168, 225, 0.6)' : '0 4px 12px rgba(0,0,0,0.6)',
          border: isHovered ? '2px solid #00A8E1' : '1px solid rgba(255,255,255,0.06)',
          transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), border 0.35s ease',
          zIndex: isHovered ? 50 : 1,
          backgroundColor: '#0F171E',
          willChange: 'transform, box-shadow',
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={movie.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            onError={() => { 
              if (!imgFailed && fallbackImg && fallbackImg !== primaryImg) {
                setImgFailed(true); 
              } else {
                setIsImageLoaded(true); 
              }
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isImageLoaded ? 1 : 0, transition: 'transform 0.4s ease', transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', textAlign: 'center' }}>
            <Film size={24} color="#00A8E1" style={{ marginBottom: '6px' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFF' }}>{movie.title}</span>
          </div>
        )}
        {showTrailer && movie.trailerUrl && (
          <HoverTrailer trailerUrl={movie.trailerUrl} isMuted={true} />
        )}
        {imdbBadge}
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, background: '#00A8E1', padding: '2px 8px', borderBottomRightRadius: '4px', fontSize: '0.65rem', fontWeight: 900, color: '#FFF', fontStyle: 'italic', letterSpacing: '0.04em' }}>
          prime
        </div>
        {/* Prime Authentic Badges */}
        {movie.isRecentlyAdded && !movie.isUpcoming && !movie.isLeavingSoon && (
          <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 10, background: '#00A8E1', color: '#FFF', padding: '2px 6px', fontSize: '0.6rem', fontWeight: 800, borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.04em', boxShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>
            NEWLY ADDED
          </div>
        )}
        {movie.isLeavingSoon && (
          <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 10, background: 'rgba(15,23,30,0.9)', border: '1px solid #FF9900', color: '#FF9900', padding: '2px 6px', fontSize: '0.6rem', fontWeight: 800, borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.04em', backdropFilter: 'blur(4px)' }}>
            LEAVING PRIME
          </div>
        )}
        {movie.isUpcoming && (
          <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 10, background: '#FF9900', color: '#000', padding: '2px 6px', fontSize: '0.6rem', fontWeight: 900, borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.04em', boxShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>
            COMING SOON
          </div>
        )}
        {/* Prime Hover Overlay */}
        <div className="expanding-meta" style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 30%, rgba(15,23,30,0.85) 65%, rgba(15,23,30,0.98) 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '12px',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}>
          <h4 style={{ color: '#FFF', fontSize: '0.92rem', fontWeight: 700, marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#00A8E1', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,168,225,0.6)' }} onClick={(e) => { e.stopPropagation(); onPlay(movie); }}>
              <Play size={14} fill="#FFF" color="#FFF" />
            </button>
            <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }} onClick={(e) => { e.stopPropagation(); onOpenDetails(movie); }}>
              <Info size={15} />
            </button>
            <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }} onClick={(e) => { e.stopPropagation(); onToggleMyList(movie.id); }}>
              {isMyList ? <Check size={15} /> : <Plus size={15} />}
            </button>
          </div>
        </div>
        {/* Platform Availability Badges */}
        {platformBadges}
        {renderProgressBar()}
      </div>
    );
  }

  // ── NETFLIX CARD (Landscape, Expanding Dropdown) ──
  const netflixWidth = top10Rank !== undefined ? 200 : 290;
  const netflixHeight = top10Rank !== undefined ? 300 : 163;
  
  return (
    <div
      className={`movie-card netflix-card ${top10Rank !== undefined ? 'top10' : ''}`}
      role="button"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      style={{
        position: 'relative',
        flexShrink: 0,
        width: `${netflixWidth}px`,
        height: `${netflixHeight}px`,
        borderRadius: '4px',
        cursor: 'pointer',
        zIndex: isHovered ? 50 : 1,
        // When hovered, the card breaks out of overflow to show the dropdown
        overflow: 'visible',
      }}
    >
      <div className="netflix-card-inner" style={{
        position: 'absolute',
        top: 0, left: 0,
        width: `${netflixWidth}px`,
        background: '#141414',
        borderRadius: '4px',
        boxShadow: isHovered ? '0 14px 28px rgba(0,0,0,0.9), 0 10px 10px rgba(0,0,0,0.8)' : 'none',
        transform: isHovered ? 'scale(1.25)' : 'scale(1)',
        transformOrigin: 'center center',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease',
        zIndex: isHovered ? 50 : 1,
      }}>
        {/* Netflix N Logo */}
        {parseInt(movie.id.replace(/\D/g, '') || '0') % 3 === 0 && (
          <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/18/Netflix_2016_N_logo.svg" alt="N" style={{ height: '14px' }} />
          </div>
        )}
        {/* Netflix Authentic Badges */}
        {movie.isRecentlyAdded && !movie.isUpcoming && !movie.isLeavingSoon && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: '#E50914', color: '#FFF', padding: '2px 6px', fontSize: '0.62rem', fontWeight: 900, borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
            NEW
          </div>
        )}
        {movie.isLeavingSoon && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: '#E50914', color: '#FFF', padding: '2px 6px', fontSize: '0.62rem', fontWeight: 900, borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
            LEAVING SOON
          </div>
        )}
        {movie.isUpcoming && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: '#E50914', color: '#FFF', padding: '2px 6px', fontSize: '0.62rem', fontWeight: 900, borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
            COMING SOON
          </div>
        )}
        {imgSrc ? (
          <img
            className="netflix-card-img"
            src={imgSrc}
            alt={movie.title}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => { 
              if (!imgFailed && fallbackImg && fallbackImg !== primaryImg) {
                setImgFailed(true); 
              } else {
                setIsImageLoaded(true); 
              }
            }}
            style={{ width: '100%', height: `${netflixHeight}px`, objectFit: 'cover', borderRadius: isHovered ? '4px 4px 0 0' : '4px', opacity: isImageLoaded ? 1 : 0 }}
          />
        ) : (
          <div style={{ width: '100%', height: `${netflixHeight}px`, background: 'linear-gradient(135deg, #1f1f1f 0%, #111111 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', textAlign: 'center', borderRadius: '4px' }}>
            <Film size={24} color="#E50914" style={{ marginBottom: '6px' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFF' }}>{movie.title}</span>
          </div>
        )}
        {showTrailer && movie.trailerUrl && (
          <HoverTrailer trailerUrl={movie.trailerUrl} isMuted={true} />
        )}
        
        {/* Title / Logo over image on Hover */}
        {isHovered && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: `${netflixHeight}px`,
            background: 'linear-gradient(to top, rgba(20,20,20,0.95) 0%, transparent 45%)',
            pointerEvents: 'none',
            borderRadius: '4px 4px 0 0',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '12px'
          }}>
            {movie.logoUrl ? (
               <img src={movie.logoUrl} alt={movie.title} style={{ maxWidth: '100%', maxHeight: '45px', objectFit: 'contain', objectPosition: 'left bottom', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
             ) : (
               <h4 style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.9)', margin: 0, width: '100%', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{movie.title}</h4>
             )}
          </div>
        )}
        
        {imdbBadge}
        {/* Expanding Metadata Box (Below Image) */}
        <div className="expanding-meta" style={{
          padding: '12px',
          opacity: isHovered ? 1 : 0,
          visibility: isHovered ? 'visible' : 'hidden',
          transition: 'opacity 0.4s ease, visibility 0.4s',
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
              <button
                onClick={(e) => { e.stopPropagation(); onToggleMyList(movie.id); }}
                style={{
                  background: 'none', border: '2px solid rgba(255, 255, 255, 0.4)', borderRadius: '50%',
                  width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', cursor: 'pointer', transition: 'all 0.2s', padding: '0'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'; e.currentTarget.style.background = 'none'; }}
              >
                {isMyList ? <Check size={18} /> : <Plus size={18} />}
              </button>
              <button style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'none', border: '2px solid rgba(255, 255, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF', padding: '0' }} onClick={(e) => { e.stopPropagation(); }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'; e.currentTarget.style.background = 'none'; }}>
                <ThumbsUp size={18} />
              </button>
            </div>
            <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2A2A2A', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }} onClick={(e) => { e.stopPropagation(); onOpenDetails(movie); }}>
              <ChevronDown size={14} />
            </button>
          </div>
          {/* Info Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#46d369' }}>{movie.matchScore}% Match</span>
            <span style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '0 4px', color: '#FFF' }}>{movie.maturityRating || 'U/A 13+'}</span>
            <span style={{ color: '#FFF' }}>{movie.duration || (movie.isSeries ? 'Series' : 'Film')}</span>
            <span style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '0 4px', fontSize: '0.65rem', color: '#FFF', borderRadius: '2px', fontWeight: 800 }}>HD</span>
          </div>
          {/* Genre Row */}
          <div style={{ color: '#FFF', fontSize: '0.75rem' }}>
            {movie.genres.slice(0, 3).join(' • ')}
          </div>
        </div>
        {/* Platform Availability Badges */}
        {platformBadges}
        {!isHovered && renderProgressBar()}
      </div>
    </div>
  );
};
