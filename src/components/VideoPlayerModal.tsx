'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, AlertTriangle, SkipForward, ChevronDown, ChevronUp } from 'lucide-react';
import { usePlatform } from './PlatformContext';
import { Movie } from '../types';
import { CustomPlayer } from './CustomPlayer';

interface VideoPlayerModalProps {
  movie: Movie;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ movie, onClose }) => {
  const [playerMovie, setPlayerMovie] = useState(movie);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [sourceFailed, setSourceFailed] = useState(false);
  const [sourceLoading, setSourceLoading] = useState(true);
  const [sourceError, setSourceError] = useState('');
  const [showUI, setShowUI] = useState(true);
  const [showServerList, setShowServerList] = useState(false);
  const { platform } = usePlatform();
  const overlayRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scraper states
  const [scrapedStreamUrl, setScrapedStreamUrl] = useState<string | null>(null);
  const [scrapingActive, setScrapingActive] = useState(true);
  const [scrapeAttempted, setScrapeAttempted] = useState(false);

  const activeMovie = playerMovie || movie;
  const allSources = activeMovie.sources || [];
  const currentSource = allSources[sourceIndex] || allSources[0];

  // ── Decode the XOR-encoded source URL ─────────────────────────────────────
  const decodeSourceUrl = (encodedUrl: string): string => {
    if (!encodedUrl) return '';
    try {
      const b64 = atob(encodedUrl);
      return b64.split('').map((c) => String.fromCharCode(c.charCodeAt(0) ^ 42)).join('');
    } catch {
      return '';
    }
  };

  const currentUrl = typeof window !== 'undefined'
    ? decodeSourceUrl(currentSource?.url || '')
    : '';

  // ── Reset on movie change ──────────────────────────────────────────────────
  useEffect(() => {
    setPlayerMovie(movie);
    
    let initialIndex = 0;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferredServerIndex');
      if (saved !== null) {
        initialIndex = parseInt(saved, 10);
      }
    }
    const maxSources = movie?.sources?.length || 1;
    if (initialIndex >= maxSources) initialIndex = 0;
    
    setSourceIndex(initialIndex);
    setSourceFailed(false);
    setSourceLoading(true);
    setSourceError('');
    setScrapedStreamUrl(null);
    setScrapingActive(true);
    setScrapeAttempted(false);
  }, [movie]);

  // ── Scraper: runs on mount and whenever sourceIndex changes ───────────────
  useEffect(() => {
    if (!scrapingActive || !activeMovie.id || scrapeAttempted) return;
    setScrapeAttempted(true);

    const tryScrape = async () => {
      try {
        const id = activeMovie.tmdbId;
        const sourceUrl = decodeSourceUrl(
          activeMovie.sources?.[sourceIndex]?.url || activeMovie.sources?.[0]?.url || '',
        );

        const params = new URLSearchParams();
        if (activeMovie.isSeries) {
          const s = (activeMovie as any).seasonNumber || (activeMovie as any).currentSeason || 1;
          const e = (activeMovie as any).episodeNumber || (activeMovie as any).currentEpisode || 1;
          params.set('season', s.toString());
          params.set('episode', e.toString());
        }
        if (sourceUrl) params.set('url', sourceUrl);

        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiBase}/movies/scrape/${id}?${params}`);
        if (!res.ok) throw new Error('Scrape response not ok');
        const data = await res.json();
        if (data.streamUrl) {
          setScrapedStreamUrl(data.streamUrl);
        } else {
          // Scraper got nothing → fall through to iframe
          setScrapingActive(false);
        }
      } catch {
        // Silently fall through to iframe
      } finally {
        setScrapingActive(false);
      }
    };
    tryScrape();
  }, [activeMovie, scrapingActive, sourceIndex, scrapeAttempted]);

  // ── Block popup/ad windows globally ───────────────────────────────────────
  useEffect(() => {
    // Prevent any child script from opening new tabs/windows
    const origOpen = window.open.bind(window);
    window.open = () => null;

    // Intercept clicks that try to navigate the top frame away
    const stopNavClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const anchor = t.closest('a');
      if (anchor && anchor.target === '_blank') {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    document.addEventListener('click', stopNavClick, true);

    return () => {
      window.open = origOpen;
      document.removeEventListener('click', stopNavClick, true);
    };
  }, []);

  // refs to avoid stale closures in event listeners without re-triggering effects
  const showServerListRef = useRef(showServerList);
  useEffect(() => { showServerListRef.current = showServerList; }, [showServerList]);
  
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // ── Lock scroll + Esc key & Hardware Back Button ───────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showServerListRef.current) setShowServerList(false);
        else onCloseRef.current();
      }
    };
    window.addEventListener('keydown', onKey);

    // Hardware Back Button Intercept (Mobile gesture support)
    const handlePopState = () => {
      if (showServerListRef.current) {
        setShowServerList(false);
        // Push state again so the next back press closes the modal
        window.history.pushState({ isModal: true }, '');
      } else {
        onCloseRef.current();
      }
    };
    
    window.history.pushState({ isModal: true }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.isModal) {
        window.history.back();
      }
    };
  }, []);

  const resetHide = useCallback(() => {
    setShowUI(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (showServerList) return;
    hideTimerRef.current = setTimeout(() => setShowUI(false), 4000); // Increased timeout for mobile
  }, [showServerList]);

  useEffect(() => {
    resetHide();
    
    // Detect clicks inside the iframe (which steals window focus) to wake up the UI
    const handleBlur = () => resetHide();
    window.addEventListener('blur', handleBlur);

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      window.removeEventListener('blur', handleBlur);
    };
  }, [resetHide]);

  useEffect(() => {
    if (showServerList) {
      setShowUI(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
  }, [showServerList]);

  if (!activeMovie) return null;

  const chooseSource = (idx: number) => {
    setSourceIndex(idx);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredServerIndex', idx.toString());
    }
    setSourceFailed(false);
    setSourceLoading(true);
    setSourceError('');
    setShowServerList(false);
    setScrapedStreamUrl(null);
    setScrapingActive(true);
    setScrapeAttempted(false); // allow re-scrape for new server
  };

  const nextEpisode = activeMovie.nextEpisode;
  const playNextEpisode = () => {
    if (!nextEpisode) return;
    setPlayerMovie({
      ...activeMovie,
      sources: nextEpisode.sources || activeMovie.sources,
      nextEpisode: undefined,
      title: `${activeMovie.title.split(' · ')[0]} · S${nextEpisode.seasonNumber}E${nextEpisode.episodeNumber} — ${nextEpisode.title}`,
    });
    setSourceFailed(false);
    setSourceLoading(true);
    setSourceError('');
    setScrapingActive(true);
    setScrapeAttempted(false);
  };

  const floatingTransition = {
    opacity: showUI ? 1 : 0,
    pointerEvents: (showUI ? 'auto' : 'none') as React.CSSProperties['pointerEvents'],
    transition: 'opacity 0.3s ease',
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${activeMovie.title} playback`}
      onMouseMove={resetHide}
      onTouchStart={resetHide}
      // Don't close server list on bare clicks inside the modal
      onClick={(e) => {
        resetHide();
        if (e.target === overlayRef.current) setShowServerList(false);
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        background: '#000',
        overflow: 'hidden',
        cursor: showUI ? 'default' : 'none',
      }}
    >
      {/* ── Scraping spinner ─────────────────────────────────────────────── */}
      {scrapingActive ? (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '14px',
          background: 'radial-gradient(ellipse at center, rgba(18,18,18,0.92) 0%, #000 100%)', color: '#fff',
        }}>
          <div style={{
            width: '50px', height: '50px', border: '3px solid rgba(255,255,255,0.07)',
            borderTop: '3px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 0.75s linear infinite',
          }} />
          <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            Fetching stream…
          </span>
        </div>

      ) : scrapedStreamUrl ? (
        /* ── Custom native player (HLS) ─────────────────────────────────── */
        <CustomPlayer 
          streamUrl={scrapedStreamUrl} 
          movie={activeMovie} 
          onBack={onClose} 
          onError={() => {
            console.error('CustomPlayer failed to load stream, falling back to iframe');
            setScrapedStreamUrl(''); // Unmount custom player and show iframe
          }}
        />

      ) : currentUrl && !sourceFailed ? (
        /* ── Iframe fallback (when scraper returned nothing) ─────────────── */
        <iframe
          key={`${activeMovie.id}-s${sourceIndex}`}
          src={currentUrl}
          title={`${activeMovie.title} — ${currentSource?.name}`}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            border: 'none', display: 'block', zIndex: 1,
          }}
          /* 
            REVERTED SANDBOX:
            Some aggressive providers have strict JS checks that explicitly require 
            allow-popups or block playback entirely when they detect a sandbox.
            To fix the "playback blocked/sandbox not allowed" errors, we must remove 
            the sandbox attribute and rely on the scraper or the JS click interceptor.
          */
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          onLoad={() => { setSourceLoading(false); setSourceFailed(false); setSourceError(''); }}
          onError={() => {
            setSourceLoading(false);
            setSourceFailed(true);
            setSourceError(`${currentSource?.name} could not load.`);
          }}
        />

      ) : (
        /* ── Error / No source state ─────────────────────────────────────── */
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px 24px', textAlign: 'center',
          background: 'radial-gradient(ellipse at center, rgba(22,22,22,0.98) 0%, #000 100%)', color: '#fff',
        }}>
          <AlertTriangle size={34} style={{ color: 'var(--primary-color)', marginBottom: '6px' }} />
          <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', margin: '0 0 6px', maxWidth: '500px' }}>
            {activeMovie.title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.86rem', maxWidth: '420px', lineHeight: 1.65 }}>
            {sourceError || `${currentSource?.name ?? 'This server'} could not start playback.`}
          </p>
          <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '520px' }}>
            {allSources.map((s, i) => (
              <button key={s.name} onClick={() => chooseSource(i)} style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 700,
                border: i === sourceIndex ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.2)',
                background: i === sourceIndex ? 'rgba(229,9,20,0.3)' : 'rgba(255,255,255,0.07)',
                color: i === sourceIndex ? '#fff' : 'rgba(255,255,255,0.6)', cursor: 'pointer',
              }}>{s.name}</button>
            ))}
          </div>
          <button onClick={onClose} style={{
            marginTop: '18px', padding: '9px 22px', borderRadius: '6px', background: 'rgba(255,255,255,0.09)',
            border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600,
          }}>← Back to Browsing</button>
        </div>
      )}

      {/* ── Floating UI: title + server switcher + close (iframe mode) ─────── */}
      {!scrapedStreamUrl && (
        <>
          {/* Left: logo + title + next-episode */}
          <div style={{
            position: 'absolute', top: '16px', left: '16px', zIndex: 20,
            display: 'flex', alignItems: 'center', gap: '10px', ...floatingTransition,
          }}>
            <div style={{
              width: '32px', height: '32px',
              background: platform === 'hotstar' ? '#1F80E0' : platform === 'nprime' ? '#00A8E1' : '#E50914',
              borderRadius: '8px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: '#fff',
              boxShadow: platform === 'hotstar' ? '0 0 12px rgba(31, 128, 224, 0.5)' : platform === 'nprime' ? '0 0 12px rgba(0, 168, 225, 0.5)' : '0 0 12px rgba(229, 9, 20, 0.5)'
            }}>
              {platform === 'hotstar' ? 'H+' : platform === 'nprime' ? 'P' : 'N'}
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)',
              border: platform === 'hotstar' ? '1px solid rgba(31, 128, 224, 0.3)' : platform === 'nprime' ? '1px solid rgba(0, 168, 225, 0.3)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '5px 12px', fontSize: '0.8rem', fontWeight: 700, color: '#fff', maxWidth: '320px',
            }}>
              {activeMovie.title}
            </div>
            {nextEpisode && !sourceLoading && !sourceFailed && (
              <button
                onClick={(e) => { e.stopPropagation(); playNextEpisode(); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '6px',
                  background: 'rgba(229,9,20,0.85)', color: '#fff',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: 'none',
                }}
              >
                <SkipForward size={13} fill="currentColor" /> Next
              </button>
            )}
          </div>

          {/* Right: server picker + close */}
          <div
            style={{
              position: 'absolute', top: '16px', right: '16px', zIndex: 20,
              display: 'flex', alignItems: 'center', gap: '8px', ...floatingTransition,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowServerList((p) => !p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '7px 13px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.18)',
                  color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                {currentSource ? `Server ${sourceIndex + 1}` : 'Server'} {showServerList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showServerList && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'rgba(10,10,10,0.97)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '8px 0', minWidth: '180px', zIndex: 400,
                }}>
                  {allSources.map((s, i) => (
                    <div key={s.name} onClick={() => chooseSource(i)} style={{
                      padding: '9px 14px', cursor: 'pointer', fontSize: '0.82rem',
                      color: i === sourceIndex ? '#fff' : 'rgba(255,255,255,0.6)',
                      background: i === sourceIndex ? 'rgba(229,9,20,0.18)' : 'transparent',
                    }}>
                      Server {i + 1}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onClose} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.75)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={17} />
            </button>
          </div>
        </>
      )}

      {/* ── Close button in custom player mode ───────────────────────────── */}
      {scrapedStreamUrl && (
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', left: '20px', zIndex: 1000,
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={24} />
        </button>
      )}
    </div>
  );
};
