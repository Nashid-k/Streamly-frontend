'use client';

import React, { useState, useEffect } from 'react';
import { Play, Info, Clock, Check, Plus, Volume2, VolumeX } from 'lucide-react';
import { usePlatform } from './PlatformContext';
import { Movie } from '../types';
import { fetchMovieById } from '../lib/api';

interface HeroBannerProps {
  movie: Movie | null;
  carouselMovies?: Movie[];
  activeCarouselIndex?: number;
  onSelectCarouselIndex?: (index: number) => void;
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleMyList?: (movieId: string) => void;
  isMyList?: boolean;
  onHeroReady?: () => void;
}

const getFallbackTitleStyle = () => {
  return {
    fontSize: 'clamp(1.8rem, 6vw, 4rem)',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontWeight: 800,
    color: '#FFFFFF',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.02em',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)',
    lineHeight: 1.1,
  };
};

export const HeroBanner: React.FC<HeroBannerProps> = ({ 
  movie, 
  carouselMovies = [], 
  activeCarouselIndex = 0, 
  onSelectCarouselIndex, 
  onPlay, 
  onOpenDetails, 
  onToggleMyList, 
  isMyList, 
  onHeroReady 
}) => {
  const { platform } = usePlatform();
  const [enrichedMovie, setEnrichedMovie] = useState<Movie | null>(null);
  const [carouselScrollIndex, setCarouselScrollIndex] = useState(0);
  const [isLogoLoading, setIsLogoLoading] = useState(false);

  // Persistent logo cache across banner transitions to eliminate text title flicker
  const logoCacheRef = React.useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!movie) { if (onHeroReady) onHeroReady(); return; }

    let isMounted = true;

    // Preload logos eagerly for all candidate movies in the carousel so switching has 0ms logo delay
    if (carouselMovies && carouselMovies.length > 0) {
      Promise.allSettled(
        carouselMovies.map(async (c) => {
          if (!c.logoUrl && c.id && !logoCacheRef.current.has(c.id)) {
            try {
              const fetched = await fetchMovieById(c.id);
              if (fetched?.logoUrl) {
                c.logoUrl = fetched.logoUrl;
                logoCacheRef.current.set(c.id, fetched.logoUrl);
                if (isMounted && movie.id === c.id) {
                  setEnrichedMovie((curr) => (curr?.id === c.id ? { ...curr, logoUrl: fetched.logoUrl } : curr));
                }
              }
            } catch (e) {}
          } else if (c.logoUrl && c.id) {
            logoCacheRef.current.set(c.id, c.logoUrl);
          }
        })
      );
    }

    // Check if we already cached the logoUrl for this movie
    const cachedLogo = movie.logoUrl || logoCacheRef.current.get(movie.id);
    const initialMovie = cachedLogo ? { ...movie, logoUrl: cachedLogo } : movie;

    setEnrichedMovie(initialMovie);
    if (onHeroReady) onHeroReady();

    // Async background enrichment if logo is missing (non-blocking)
    if (!initialMovie.logoUrl) {
      setIsLogoLoading(true);
      fetchMovieById(movie.id)
        .then((fetched) => {
          if (isMounted && fetched) {
            if (fetched.logoUrl) logoCacheRef.current.set(movie.id, fetched.logoUrl);
            setEnrichedMovie((curr) => (curr?.id === movie.id ? { ...curr, ...fetched, logoUrl: fetched.logoUrl || curr.logoUrl } : curr));
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLogoLoading(false);
        });
    } else {
      setIsLogoLoading(false);
    }
    return () => { 
      isMounted = false; 
    };
  }, [movie, carouselMovies, onHeroReady]);

  if (!enrichedMovie) return null;

  const backgroundUrl = enrichedMovie.backdropUrl || enrichedMovie.posterUrl || '';

  return (
    <div
      className="hero-container"
      style={{
        position: 'relative',
        height: '80vh',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '80px',
        paddingLeft: '4%',
        paddingRight: '4%',
        overflow: 'hidden',
      }}
    >
      {/* High-Resolution Backdrop Image (Desktop/Tablet) */}
      <div
        key={`backdrop-${enrichedMovie.id}`}
        className="hero-backdrop"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: enrichedMovie.backdropUrl
            ? platform === 'hotstar'
              ? `linear-gradient(180deg, rgba(15,16,20,0) 0%, rgba(15,16,20,0.4) 60%, rgba(15,16,20,1) 100%), linear-gradient(90deg, rgba(15,16,20,1) 0%, rgba(15,16,20,0) 75%), url(${enrichedMovie.backdropUrl})`
              : platform === 'nprime'
              ? `linear-gradient(180deg, rgba(15,23,30,0.5) 0%, rgba(15,23,30,0.2) 50%, rgba(15,23,30,1) 100%), linear-gradient(90deg, rgba(15,23,30,0.95) 0%, rgba(15,23,30,0) 65%), url(${enrichedMovie.backdropUrl})`
              : `linear-gradient(180deg, rgba(20,20,20,0.5) 0%, rgba(20,20,20,0.2) 50%, rgba(20,20,20,1) 100%), linear-gradient(90deg, rgba(20,20,20,0.85) 0%, rgba(20,20,20,0) 65%), url(${enrichedMovie.backdropUrl})`
            : 'linear-gradient(135deg, var(--bg-color) 0%, var(--bg-elevated) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          zIndex: 0,
        }}
      />
      
      {/* Portrait Poster Image (Mobile Native View) */}
      <div
        key={`poster-${enrichedMovie.id}`}
        className="hero-portrait-poster"
        style={{
          display: 'none', // Shown via CSS on mobile
          position: 'absolute',
          inset: 0,
          backgroundImage: enrichedMovie.posterUrl 
            ? platform === 'hotstar'
              ? `linear-gradient(180deg, rgba(15,16,20,0) 50%, rgba(15,16,20,0.8) 80%, rgba(15,16,20,1) 100%), url(${enrichedMovie.posterUrl})`
              : platform === 'nprime'
              ? `linear-gradient(180deg, rgba(15,23,30,0) 50%, rgba(15,23,30,0.8) 80%, rgba(15,23,30,1) 100%), url(${enrichedMovie.posterUrl})`
              : `linear-gradient(180deg, rgba(20,20,20,0) 50%, rgba(20,20,20,0.8) 80%, rgba(20,20,20,1) 100%), url(${enrichedMovie.posterUrl})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* Left Column: Hero Content */}
      <div key={enrichedMovie.id} className="hero-content" style={{ maxWidth: '680px', zIndex: 10 }}>
        {/* Upcoming Eyebrow Badge */}
        {enrichedMovie.isUpcoming && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
            <Clock size={16} /> COMING SOON TO {platform === 'hotstar' ? 'HOTSTAR' : platform === 'nprime' ? 'PRIME' : 'NETFLIX'}
          </div>
        )}

        {/* Nflix Original N Eyebrow */}
        {platform === 'nflix' && parseInt(enrichedMovie.id.replace(/\D/g, '') || '0') % 3 === 0 && !enrichedMovie.isUpcoming && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/18/Netflix_2016_N_logo.svg" alt="N" style={{ height: '24px' }} />
            <span style={{ color: '#B3B3B3', fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.35em', textTransform: 'uppercase' }}>
              {enrichedMovie.isSeries ? 'Series' : 'Film'}
            </span>
          </div>
        )}

        {/* Title Logo / Stylized Title Text (Always visible, seamless logo swap) */}
        <div style={{ marginBottom: '20px', minHeight: '80px', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
          {enrichedMovie.logoUrl ? (
            <img
              key={`logo-${enrichedMovie.id}`}
              src={enrichedMovie.logoUrl}
              alt={enrichedMovie.title}
              style={{
                maxHeight: '120px',
                maxWidth: '100%',
                objectFit: 'contain',
                objectPosition: 'left bottom',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.9))',
                animation: 'heroBackdropReveal 0.4s ease',
              }}
            />
          ) : (
            <h1
              className="hero-title-text"
              style={{
                ...getFallbackTitleStyle(),
                marginBottom: '0px',
              }}
            >
              {enrichedMovie.title}
            </h1>
          )}
        </div>

        {/* Badges */}
        <div className="hero-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {enrichedMovie.isUpcoming ? (
            <span style={{ color: '#F59E0B', fontWeight: 800, fontSize: '1rem' }}>
              {enrichedMovie.releaseDate ? `Releasing ${enrichedMovie.releaseDate}` : 'Coming Soon'}
            </span>
          ) : (
            <span style={{ color: platform === 'hotstar' ? '#1F80E0' : platform === 'nprime' ? '#00A8E1' : '#46d369', fontWeight: 700, fontSize: '1rem' }}>
              {enrichedMovie.matchScore}% Match
            </span>
          )}
          <span style={{ color: '#AAA', fontSize: '0.95rem' }}>{enrichedMovie.releaseYear}</span>
          <span style={{ border: '1px solid rgba(255,255,255,0.4)', borderRadius: '3px', padding: '1px 6px', fontSize: '0.75rem', fontWeight: 700, color: '#FFF' }}>
            {enrichedMovie.maturityRating}
          </span>
          <span style={{ color: '#AAA', fontSize: '0.95rem' }}>{enrichedMovie.duration}</span>
          
          {/* Authentic High-Tech Badges (4K, HDR, Atmos) */}
          <span style={{ border: '1px solid rgba(255,255,255,0.3)', borderRadius: '3px', padding: '1px 5px', fontSize: '0.7rem', fontWeight: 800, color: '#E5E5E5', letterSpacing: '0.05em' }}>
            4K UHD
          </span>
          <span style={{ border: '1px solid rgba(255,255,255,0.3)', borderRadius: '3px', padding: '1px 5px', fontSize: '0.7rem', fontWeight: 800, color: '#E5E5E5', letterSpacing: '0.05em' }}>
            {platform === 'nprime' ? 'HDR10+' : 'VISION'}
          </span>
          <span style={{ border: '1px solid rgba(255,255,255,0.3)', borderRadius: '3px', padding: '1px 5px', fontSize: '0.7rem', fontWeight: 800, color: '#E5E5E5', letterSpacing: '0.05em' }}>
            ATMOS
          </span>
          {platform === 'nflix' && (
            <span style={{ border: '1px solid rgba(255,255,255,0.3)', borderRadius: '3px', padding: '1px 5px', fontSize: '0.7rem', fontWeight: 800, color: '#E5E5E5' }}>
              5.1
            </span>
          )}
        </div>

        {/* Description */}
        <p
          className="hero-description"
          style={{
            fontSize: '1rem',
            color: '#DDD',
            lineHeight: 1.5,
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            marginBottom: '24px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {enrichedMovie.description}
        </p>

        {/* Action Buttons */}
        <div className="hero-actions-row" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            className="primary-play-btn"
            onClick={() => onPlay(enrichedMovie)}
            style={{
              background: platform === 'hotstar' ? 'var(--primary-color)' : '#FFF',
              color: platform === 'hotstar' ? '#FFF' : '#000',
              fontWeight: 800,
              fontSize: '1rem',
              padding: (platform === 'nprime' || platform === 'hotstar') ? '12px 28px' : '10px 24px',
              borderRadius: platform === 'hotstar' ? '8px' : (platform === 'nprime' ? '50px' : '4px'),
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: platform === 'hotstar' ? '0 4px 14px var(--primary-glow)' : '0 4px 14px rgba(0,0,0,0.5)',
              transition: 'transform 0.2s',
            }}
          >
            <Play fill={platform === 'hotstar' ? '#FFF' : '#000'} size={18} />
            {platform === 'hotstar' ? 'Watch Now' : 'Play'}
          </button>
          
          {platform !== 'hotstar' && (
          <button
            onClick={() => onOpenDetails(enrichedMovie)}
            style={{
              background: platform === 'nprime' ? 'rgba(255,255,255,0.15)' : 'rgba(109, 109, 110, 0.7)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '1rem',
              padding: platform === 'nprime' ? '0' : '10px 24px',
              width: platform === 'nprime' ? '48px' : 'auto',
              height: platform === 'nprime' ? '48px' : 'auto',
              borderRadius: platform === 'nprime' ? '50%' : '4px',
              border: platform === 'nprime' ? '1px solid rgba(255,255,255,0.4)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <Info size={platform === 'nprime' ? 22 : 18} /> {platform !== 'nprime' && 'More Info'}
          </button>
          )}
          
          {(platform === 'nprime' || platform === 'hotstar') && onToggleMyList && (
            <button
              onClick={() => onToggleMyList(enrichedMovie.id)}
              style={{
                height: platform === 'nprime' ? '48px' : (platform === 'hotstar' ? '48px' : '44px'),
                padding: platform === 'hotstar' ? '0 24px' : '0',
                width: platform === 'hotstar' ? 'auto' : (platform === 'nprime' ? '48px' : '44px'),
                borderRadius: platform === 'hotstar' ? '8px' : '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: platform === 'hotstar' ? 'none' : '1px solid rgba(255,255,255,0.4)',
                color: '#FFF', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                cursor: 'pointer', 
                transition: 'all 0.2s',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              {isMyList ? <Check size={platform === 'hotstar' ? 20 : 24} /> : <Plus size={platform === 'hotstar' ? 20 : 24} />}
              {platform === 'hotstar' && <span>Watchlist</span>}
            </button>
          )}


        </div>
      </div>

      {/* Hotstar Specific Hero Carousel 5-Visible Thumbnail Bar with Scroll Arrows */}
      {platform === 'hotstar' && carouselMovies.length > 1 && (
        <div className="hero-carousel-bar" style={{
          position: 'absolute',
          right: '4%',
          bottom: '36px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 20,
        }}>
          {/* Scroll Left Arrow */}
          {carouselScrollIndex > 0 && (
            <button
              onClick={() => setCarouselScrollIndex(i => Math.max(0, i - 1))}
              style={{
                background: 'rgba(15, 16, 20, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFF',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(15, 16, 20, 0.75)'; }}
            >
              ❮
            </button>
          )}

          {/* 5 Visible Thumbnails Window */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '6px 2px' }}>
            {carouselMovies.slice(carouselScrollIndex, carouselScrollIndex + 5).map((item, localIdx) => {
              const realIdx = carouselScrollIndex + localIdx;
              const isActive = realIdx === activeCarouselIndex;
              const thumbUrl = item.backdropUrl || item.posterUrl;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectCarouselIndex && onSelectCarouselIndex(realIdx)}
                  style={{
                    width: '102px',
                    height: '58px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    border: isActive ? '2px solid #FFF' : '2px solid transparent',
                    boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.85), 0 0 14px rgba(255,255,255,0.6)' : '0 4px 12px rgba(0,0,0,0.6)',
                    transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isActive ? 'scale(1.14)' : 'scale(1)',
                    opacity: isActive ? 1 : 0.65,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = isActive ? 'scale(1.18)' : 'scale(1.08)';
                    e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.9), 0 0 16px rgba(255,255,255,0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = isActive ? '1' : '0.65';
                    e.currentTarget.style.transform = isActive ? 'scale(1.14)' : 'scale(1)';
                    e.currentTarget.style.boxShadow = isActive ? '0 8px 24px rgba(0,0,0,0.85), 0 0 14px rgba(255,255,255,0.6)' : '0 4px 12px rgba(0,0,0,0.6)';
                  }}
                >
                  <img
                    src={thumbUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  />
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      border: '1.5px solid #FFF',
                      borderRadius: '6px',
                      pointerEvents: 'none'
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Scroll Right Arrow */}
          {carouselScrollIndex < Math.max(0, carouselMovies.slice(0, 8).length - 5) && (
            <button
              onClick={() => setCarouselScrollIndex(i => Math.min(carouselMovies.slice(0, 8).length - 5, i + 1))}
              style={{
                background: 'rgba(15, 16, 20, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFF',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(15, 16, 20, 0.75)'; }}
            >
              ❯
            </button>
          )}
        </div>
      )}

      {/* Right Edge: Maturity Rating Tag (Netflix only) */}
      {platform === 'nflix' && (
        <div
          style={{
            position: 'absolute',
            right: '4%',
            bottom: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 20,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(51, 51, 51, 0.6)',
              borderLeft: '3px solid #DCDCDC',
              padding: '4px 12px 4px 8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#FFF',
              backdropFilter: 'blur(8px)',
            }}
          >
            {enrichedMovie.maturityRating}
          </div>
        </div>
      )}
    </div>
  );
};
