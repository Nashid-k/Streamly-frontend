'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, Play, Plus, Check, ThumbsUp, ChevronDown, Volume2, VolumeX, Download } from 'lucide-react';
import { usePlatform } from './PlatformContext';
import { Movie, Episode } from '../types';
import { fetchMovieById, fetchSeasonEpisodes } from '../lib/api';

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlay: (movie: Movie, episode?: Episode) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleMyList: (movieId: string) => void;
  isMyList: boolean;
  similarMovies: Movie[];
}

function formatCastNames(castList?: any[]): string {
  if (!castList || !Array.isArray(castList) || castList.length === 0) return '';
  return castList
    .map((item) => (typeof item === 'string' ? item : item?.name || ''))
    .filter(Boolean)
    .join(', ');
}

function useMovieDetails(movie: Movie | null, selectedSeason: number, platform: string) {
  const [detailedMovie, setDetailedMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (!movie) return;
    setIsLoadingDetails(true);
    const isTvShow = Boolean(movie.isSeries || movie.id?.includes('-tv-') || movie.seasonsCount);
    setIsLoadingEpisodes(isTvShow);

    // Fetch full movie details
    fetchMovieById(movie.id)
      .then(data => { 
        if (isMounted) {
          setDetailedMovie(data);
          const isTV = Boolean(data?.isSeries || data?.seasonsCount || movie.isSeries || movie.id?.includes('-tv-'));
          if (isTV && selectedSeason) {
            fetchSeasonEpisodes(movie.id, selectedSeason)
              .then(epData => { if (isMounted) setEpisodes(Array.isArray(epData) ? epData : []); })
              .catch(() => { if (isMounted) setEpisodes([]); });
          }
        } 
      })
      .catch(() => { if (isMounted) setDetailedMovie(movie); })
      .finally(() => { if (isMounted) setIsLoadingDetails(false); });

    if (isTvShow) {
      fetchSeasonEpisodes(movie.id, selectedSeason)
        .then(data => { if (isMounted) setEpisodes(Array.isArray(data) ? data : []); })
        .catch(() => { if (isMounted) setEpisodes([]); })
        .finally(() => { if (isMounted) setIsLoadingEpisodes(false); });
    } else {
      setEpisodes([]);
      setIsLoadingEpisodes(false);
    }

    return () => { isMounted = false; };
  }, [movie, selectedSeason, platform]);

  return { detailedMovie, episodes, isLoadingDetails, isLoadingEpisodes };
}

const EpisodeSkeleton = () => (
  <div style={{ display: 'flex', gap: '20px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center' }}>
    <div style={{ width: '160px', height: '90px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.08)', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ width: '40%', height: '18px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ width: '85%', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ width: '20%', height: '12px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  </div>
);

const decodeTrailerUrl = (encodedUrl: string): string => {
  if (!encodedUrl) return '';
  try {
    const b64 = atob(encodedUrl);
    return b64.split('').map((c) => String.fromCharCode(c.charCodeAt(0) ^ 42)).join('');
  } catch {
    return '';
  }
};

function useTrailerPlayer(encodedUrl: string, backdropUrl: string) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const trailerUrl = encodedUrl ? decodeTrailerUrl(encodedUrl) : '';
  const videoIdMatch = trailerUrl.match(/embed\/([^?]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : '';

  // When the video changes, reset the playing state so the poster shows while loading
  useEffect(() => {
    setIsVideoPlaying(false);
  }, [videoId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        const isPlayingEvent = (data.event === 'infoDelivery' && data.info && data.info.playerState === 1) || 
                               (data.event === 'onStateChange' && data.info === 1);

        if (isPlayingEvent) {
          setIsVideoPlaying(true);
          // If the user previously unmuted, enforce it on the new trailer automatically!
          if (!isMuted && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
              '*'
            );
          }
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isMuted]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: newMuted ? 'mute' : 'unMute', args: [] }),
        '*'
      );
    }
  };

  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
    }
  };

  const renderTrailer = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', backgroundColor: '#000' }}>
      <img 
        src={backdropUrl} 
        style={{ 
          width: '100%', height: '100%', objectFit: 'cover', 
          position: 'absolute', inset: 0, zIndex: 10,
          opacity: isVideoPlaying && videoId ? 0 : 1, transition: 'opacity 0.8s ease'
        }} 
      />
      {videoId && (
        <iframe
          ref={iframeRef}
          onLoad={handleIframeLoad}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1&playsinline=1`}
          style={{ 
            width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, border: 'none', 
            transform: 'scale(1.4)', zIndex: 5, opacity: isVideoPlaying ? 1 : 0, transition: 'opacity 0.8s ease'
          }}
          allow="autoplay; encrypted-media"
        />
      )}
    </div>
  );

  return { isMuted, toggleMute, renderTrailer, hasTrailer: !!videoId };
}

function NetflixModal({ movie, onClose, onPlay, onOpenDetails, onToggleMyList, isMyList, similarMovies, platform }: MovieDetailModalProps & { platform: string }) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const { detailedMovie, episodes, isLoadingEpisodes } = useMovieDetails(movie, selectedSeason, platform);
  const displayMovie = detailedMovie || movie;
  const isTvShow = Boolean(displayMovie?.isSeries || movie?.isSeries || (displayMovie?.seasonsCount ?? 0) > 0);
  const [activeTab, setActiveTab] = useState<'episodes' | 'similar'>(isTvShow ? 'episodes' : 'similar');
  const [isLiked, setIsLiked] = useState(false);
  const { isMuted, toggleMute, renderTrailer, hasTrailer } = useTrailerPlayer(displayMovie?.trailerUrl || '', movie?.backdropUrl || movie?.posterUrl || '');

  if (!movie) return null;
  const matchScore = parseInt(movie.id.replace(/\D/g, '') || '0') % 30 + 70;

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      backgroundColor: 'rgba(0,0,0,0.7)', overflowY: 'auto', padding: '32px 0'
    }}>
      <div className="detail-dialog" onClick={e => e.stopPropagation()} style={{
        width: '92%', maxWidth: '850px', backgroundColor: '#181818', borderRadius: '10px',
        overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.98)', position: 'relative',
        animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)', color: '#FFF', display: 'flex', flexDirection: 'column'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px',
          borderRadius: '50%', backgroundColor: '#181818', border: 'none', color: '#FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40, cursor: 'pointer'
        }}>
          <X size={20} />
        </button>

        <div className="detail-hero" style={{ position: 'relative', height: '420px', backgroundColor: '#000', flexShrink: 0 }}>
          {renderTrailer()}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #181818 0%, transparent 50%)', zIndex: 15 }} />

          <div className="detail-hero-content" style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 20 }}>
            <div>
              {displayMovie?.logoUrl ? (
                <img className="detail-logo-img" src={displayMovie.logoUrl} style={{ maxWidth: '350px', maxHeight: '120px', objectFit: 'contain', marginBottom: '20px' }} />
              ) : (
                <h2 className="detail-title-text" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{movie.title}</h2>
              )}

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button className="detail-play-btn" onClick={() => onPlay(movie)} style={{
                  background: '#FFF', color: '#000', border: 'none', borderRadius: '4px', padding: '8px 24px',
                  fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                }}>
                  <Play fill="#000" size={24} /> Play
                </button>
                <button className="detail-action-btn" onClick={() => onToggleMyList(movie.id)} style={{
                  background: 'rgba(42,42,42,0.6)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%',
                  width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF'
                }}>
                  {isMyList ? <Check size={20} /> : <Plus size={20} />}
                </button>
                <button className="detail-action-btn" onClick={() => setIsLiked(!isLiked)} style={{
                  background: isLiked ? '#E50914' : 'rgba(42,42,42,0.6)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%',
                  width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF',
                  transition: 'background 0.2s'
                }}>
                  <ThumbsUp size={20} fill={isLiked ? '#FFF' : 'none'} />
                </button>
              </div>
            </div>

            {hasTrailer && (
              <button onClick={toggleMute} style={{
                background: 'rgba(42,42,42,0.6)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%',
                width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF',
                zIndex: 50
              }}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            )}
          </div>
        </div>

        <div className="detail-body" style={{ padding: '20px 24px' }}>
          <div className="detail-overview-grid" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', fontSize: '1rem', fontWeight: 500 }}>
              <span style={{ color: '#46d369', fontWeight: 700 }}>{matchScore}% Match</span>
              <span style={{ color: '#BCBCBC' }}>{(displayMovie?.releaseDate || movie?.releaseDate || '').split('-')[0]}</span>
              <span style={{ border: '1px solid #BCBCBC', padding: '0 4px', color: '#BCBCBC', fontSize: '0.8rem' }}>U/A 16+</span>
              <span style={{ color: '#BCBCBC' }}>{displayMovie?.duration || movie?.duration}</span>
              <span style={{ border: '1px solid #BCBCBC', padding: '0 4px', color: '#BCBCBC', fontSize: '0.8rem', borderRadius: '3px' }}>HD</span>
              {(displayMovie?.audioLanguages?.length ?? 0) > 0 && (
                <span style={{ color: '#BCBCBC' }}>• {displayMovie?.audioLanguages?.slice(0, 2).join(', ')}</span>
              )}
            </div>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.5, color: '#FFF', fontWeight: 400 }}>
              {displayMovie?.longDescription || movie.description}
            </p>
          </div>
          <div style={{ flex: '1', fontSize: '0.9rem', color: '#777', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><span style={{ color: '#777' }}>Cast: </span><span style={{ color: '#FFF' }}>{formatCastNames(displayMovie?.cast?.slice(0,4))} {(displayMovie?.cast?.length ?? 0) > 4 ? ', more' : ''}</span></div>
            <div><span style={{ color: '#777' }}>Genres: </span><span style={{ color: '#FFF' }}>{displayMovie?.genres?.join(', ')}</span></div>
            <div><span style={{ color: '#777' }}>This show is: </span><span style={{ color: '#FFF' }}>{displayMovie?.tags?.slice(0,3).join(', ')}</span></div>
          </div>
        </div>        <div className="detail-bottom-section" style={{ padding: '0 40px 40px 40px' }}>
          {(displayMovie?.isSeries || movie.isSeries || (displayMovie?.seasonsCount ?? 0) > 0) ? (
            <div style={{ display: 'flex', gap: '30px', borderBottom: '2px solid #404040', marginBottom: '20px' }}>
              <button onClick={() => setActiveTab('episodes')} style={{ background: 'none', border: 'none', color: activeTab === 'episodes' ? '#FFF' : '#808080', fontSize: '1.2rem', fontWeight: 700, paddingBottom: '16px', borderBottom: activeTab === 'episodes' ? '4px solid #E50914' : '4px solid transparent', cursor: 'pointer', transition: 'color 0.2s' }}>Episodes</button>
              <button onClick={() => setActiveTab('similar')} style={{ background: 'none', border: 'none', color: activeTab === 'similar' ? '#FFF' : '#808080', fontSize: '1.2rem', fontWeight: 700, paddingBottom: '16px', borderBottom: activeTab === 'similar' ? '4px solid #E50914' : '4px solid transparent', cursor: 'pointer', transition: 'color 0.2s' }}>More Like This</button>
            </div>
          ) : (
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>More Like This</h3>
          )}

          {(!(displayMovie?.isSeries || movie.isSeries || (displayMovie?.seasonsCount ?? 0) > 0) || activeTab === 'similar') && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {similarMovies.slice(0, 9).map(sim => (
                <div key={sim.id} onClick={() => onOpenDetails(sim)} style={{ backgroundColor: '#2F2F2F', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                    <img src={sim.backdropUrl || sim.posterUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{sim.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#BCBCBC' }}>
                      <span style={{ color: '#46d369' }}>{parseInt(sim.id.replace(/\D/g, '') || '0') % 30 + 70}% Match</span>
                      <span>{(sim.releaseDate || '').split('-')[0]}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#D2D2D2', marginTop: '12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sim.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(displayMovie?.isSeries || movie.isSeries || (displayMovie?.seasonsCount ?? 0) > 0) && activeTab === 'episodes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.1rem', color: '#D2D2D2' }}>Season {selectedSeason}</span>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>

                  {displayMovie?.seasonsCount && displayMovie.seasonsCount > 1 && (
                    <select value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))} style={{ background: '#242424', color: '#FFF', border: '1px solid #4D4D4D', padding: '8px 16px', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', outline: 'none' }}>
                      {Array.from({ length: displayMovie.seasonsCount }, (_, i) => i + 1).map(s => <option key={s} value={s} style={{ background: '#181818', color: '#FFF' }}>Season {s}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isLoadingEpisodes ? (
                  <>
                    <EpisodeSkeleton />
                    <EpisodeSkeleton />
                    <EpisodeSkeleton />
                  </>
                ) : (
                  episodes.map((ep, idx) => (
                    <div key={ep.id} onClick={() => onPlay(movie, ep)} style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '4px', backgroundColor: '#222', cursor: 'pointer', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.5rem', color: '#D2D2D2', width: '30px', textAlign: 'center' }}>{idx + 1}</div>
                      <div style={{ position: 'relative', width: '130px', height: '73px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={ep.thumbnailUrl || movie.backdropUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}><Play size={30} fill="#FFF" color="#FFF" /></div>
                      </div>
                      <div style={{ flex: 1, paddingRight: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 700 }}>{ep.title}</span>
                          <span style={{ color: '#D2D2D2' }}>{ep.duration}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#D2D2D2', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ep.description || 'No description available for this episode.'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: '48px', paddingTop: '20px', borderTop: '2px solid #2F2F2F' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>About <strong style={{ fontWeight: 700 }}>{movie.title}</strong></h3>
            <div style={{ color: '#777', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><span style={{ color: '#777' }}>Director: </span><span style={{ color: '#FFF' }}>{displayMovie?.director || 'Unknown'}</span></div>
              <div><span style={{ color: '#777' }}>Cast: </span><span style={{ color: '#FFF' }}>{formatCastNames(displayMovie?.cast)}</span></div>
              <div><span style={{ color: '#777' }}>Genres: </span><span style={{ color: '#FFF' }}>{displayMovie?.genres?.join(', ')}</span></div>
              {(displayMovie?.audioLanguages?.length ?? 0) > 0 && (
                <div><span style={{ color: '#777' }}>Audio: </span><span style={{ color: '#FFF' }}>{displayMovie?.audioLanguages?.join(', ')}</span></div>
              )}
              {(displayMovie?.subtitleLanguages?.length ?? 0) > 0 && (
                <div><span style={{ color: '#777' }}>Subtitles: </span><span style={{ color: '#FFF' }}>{displayMovie?.subtitleLanguages?.join(', ')}</span></div>
              )}
              <div><span style={{ color: '#777' }}>Maturity Rating: </span><span style={{ color: '#FFF', border: '1px solid #FFF', padding: '0 4px', marginRight: '6px' }}>{displayMovie?.maturityRating || movie.maturityRating}</span> <span style={{ color: '#FFF' }}>Recommended for mature audiences.</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrimeModal({ movie, onClose, onPlay, onOpenDetails, onToggleMyList, isMyList, similarMovies, platform }: MovieDetailModalProps & { platform: string }) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const { detailedMovie, episodes, isLoadingEpisodes } = useMovieDetails(movie, selectedSeason, platform);
  const displayMovie = detailedMovie || movie;
  const isTvShow = Boolean(displayMovie?.isSeries || movie?.isSeries || (displayMovie?.seasonsCount ?? 0) > 0);
  const [activeTab, setActiveTab] = useState<'episodes' | 'related' | 'details'>(isTvShow ? 'episodes' : 'related');
  const [isLiked, setIsLiked] = useState(false);
  const { isMuted, toggleMute, renderTrailer, hasTrailer } = useTrailerPlayer(displayMovie?.trailerUrl || '', movie?.backdropUrl || movie?.posterUrl || '');

  if (!movie) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.8)', padding: '20px', overflowY: 'auto'
    }}>
      <div className="detail-dialog" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '960px', backgroundColor: '#0f171e', borderRadius: '8px',
        overflow: 'hidden', position: 'relative', color: '#FFF', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)', animation: 'fadeIn 0.3s ease', maxHeight: '90vh'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px',
          borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40, cursor: 'pointer'
        }}>
          <X size={24} />
        </button>

        <div style={{ position: 'relative', width: '100%', height: '400px', flexShrink: 0 }}>
          {renderTrailer()}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0f171e 30%, rgba(15,23,30,0) 80%), linear-gradient(to top, #0f171e 0%, transparent 40%)', zIndex: 15 }} />

          <div style={{ position: 'absolute', bottom: '30px', left: '40px', right: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 20 }}>
            <div style={{ maxWidth: '50%' }}>
              {displayMovie?.logoUrl ? (
                <img src={displayMovie.logoUrl} style={{ maxWidth: '300px', maxHeight: '100px', objectFit: 'contain', marginBottom: '10px' }} />
              ) : (
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '10px' }}>{movie.title}</h2>
              )}

              <div style={{ color: '#00a8e1', fontWeight: 700, fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={16} color="#00a8e1" /> Included with Prime
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={() => onPlay(movie)} style={{
                  background: '#0f79af', color: '#FFF', border: 'none', borderRadius: '4px', padding: '12px 32px',
                  fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                }}>
                  <Play fill="#FFF" size={20} /> Play
                </button>
                <button onClick={() => onToggleMyList(movie.id)} style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                  width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF'
                }}>
                  {isMyList ? <Check size={22} /> : <Plus size={22} />}
                </button>
                <button onClick={() => setIsLiked(!isLiked)} style={{
                  background: isLiked ? '#00A8E1' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                  width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF',
                  transition: 'background 0.2s'
                }}>
                  <ThumbsUp size={22} fill={isLiked ? '#FFF' : 'none'} />
                </button>
              </div>
            </div>

            {hasTrailer && (
              <button onClick={toggleMute} style={{
                background: 'rgba(15,23,30,0.6)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%',
                width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF',
                zIndex: 50
              }}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '0 40px 40px 40px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', fontSize: '0.95rem', color: '#8197a4', fontWeight: 600 }}>
            <span style={{ color: '#FFF' }}>IMDb {((parseInt(movie.id.replace(/\D/g, ''))%40)/10 + 6.0).toFixed(1)}</span>
            <span>{(displayMovie?.releaseDate || movie?.releaseDate || '').split('-')[0]}</span>
            <span>{displayMovie?.duration || movie?.duration}</span>
            <span style={{ border: '1px solid #8197a4', padding: '1px 4px', borderRadius: '3px', fontSize: '0.8rem' }}>X-Ray</span>
            <span style={{ border: '1px solid #8197a4', padding: '1px 4px', borderRadius: '3px', fontSize: '0.8rem' }}>UHD</span>
            <span style={{ border: '1px solid #8197a4', padding: '1px 4px', borderRadius: '3px', fontSize: '0.8rem' }}>AD</span>
          </div>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#FFF', fontWeight: 400, maxWidth: '80%' }}>
            {displayMovie?.longDescription || movie.description}
          </p>

          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginTop: '30px', marginBottom: '24px' }}>
            {(displayMovie?.isSeries || movie.isSeries || (displayMovie?.seasonsCount ?? 0) > 0) && <button onClick={() => setActiveTab('episodes')} style={{ background: 'none', border: 'none', color: activeTab === 'episodes' ? '#FFF' : '#8197a4', fontSize: '1.1rem', fontWeight: 700, paddingBottom: '12px', borderBottom: activeTab === 'episodes' ? '2px solid #FFF' : '2px solid transparent', cursor: 'pointer' }}>Episodes</button>}
            <button onClick={() => setActiveTab('related')} style={{ background: 'none', border: 'none', color: activeTab === 'related' ? '#FFF' : '#8197a4', fontSize: '1.1rem', fontWeight: 700, paddingBottom: '12px', borderBottom: activeTab === 'related' ? '2px solid #FFF' : '2px solid transparent', cursor: 'pointer' }}>Related</button>
            <button onClick={() => setActiveTab('details')} style={{ background: 'none', border: 'none', color: activeTab === 'details' ? '#FFF' : '#8197a4', fontSize: '1.1rem', fontWeight: 700, paddingBottom: '12px', borderBottom: activeTab === 'details' ? '2px solid #FFF' : '2px solid transparent', cursor: 'pointer' }}>Details</button>
          </div>

          {activeTab === 'episodes' && (displayMovie?.isSeries || movie.isSeries || (displayMovie?.seasonsCount ?? 0) > 0) && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '10px' }}>
                <select value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))} style={{ background: '#19232d', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 16px', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', width: 'fit-content', outline: 'none' }}>
                  {Array.from({ length: displayMovie?.seasonsCount || 1 }, (_, i) => i + 1).map(s => <option key={s} value={s} style={{ background: '#0f171e', color: '#FFF' }}>Season {s}</option>)}
                </select>
              </div>
              {isLoadingEpisodes ? (
                <>
                  <EpisodeSkeleton />
                  <EpisodeSkeleton />
                  <EpisodeSkeleton />
                </>
              ) : (
                episodes.map((ep, idx) => (
                  <div key={ep.id} onClick={() => onPlay(movie, ep)} style={{ display: 'flex', gap: '24px', padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'pointer', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '160px', height: '90px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                      <img src={ep.thumbnailUrl || movie.backdropUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}><Play size={30} fill="#FFF" color="#FFF" /></div>
                    </div>
                    <div style={{ flex: 1, paddingRight: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{idx + 1}. {ep.title}</h4>
                      <p style={{ fontSize: '0.9rem', color: '#8197a4', margin: '0 0 8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ep.description || 'No description available for this episode.'}</p>
                      <span style={{ fontSize: '0.8rem', color: '#8197a4' }}>{ep.duration}</span>
                    </div>
                  </div>
                ))
              )}
             </div>
          )}

          {activeTab === 'related' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Customers who watched this also watched</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {similarMovies.slice(0, 10).map(sim => (
                  <div key={sim.id} onClick={() => onOpenDetails(sim)} style={{ borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <img src={sim.backdropUrl || sim.posterUrl} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#00a8e1', marginBottom: '4px' }}>✓ Prime</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{sim.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#8197a4', fontSize: '1rem' }}>
              <div style={{ display: 'flex' }}><strong style={{ width: '150px', color: '#FFF' }}>Audio languages</strong> <span>{displayMovie?.audioLanguages?.join(', ') || 'English, English [Audio Description]'}</span></div>
              <div style={{ display: 'flex' }}><strong style={{ width: '150px', color: '#FFF' }}>Subtitles</strong> <span>{displayMovie?.subtitleLanguages?.join(', ') || 'English [CC]'}</span></div>
              <div style={{ display: 'flex' }}><strong style={{ width: '150px', color: '#FFF' }}>Directors</strong> <span>{displayMovie?.director || 'Unknown'}</span></div>
              <div style={{ display: 'flex' }}><strong style={{ width: '150px', color: '#FFF' }}>Starring</strong> <span>{formatCastNames(displayMovie?.cast)}</span></div>
              <div style={{ display: 'flex' }}><strong style={{ width: '150px', color: '#FFF' }}>Studio</strong> <span>Amazon Studios</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HotstarModal({ movie, onClose, onPlay, onOpenDetails, onToggleMyList, isMyList, similarMovies, platform }: MovieDetailModalProps & { platform: string }) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const { detailedMovie, episodes, isLoadingEpisodes } = useMovieDetails(movie, selectedSeason, platform);
  const displayMovie = detailedMovie || movie;
  const isTvShow = Boolean(displayMovie?.isSeries || movie?.isSeries || (displayMovie?.seasonsCount ?? 0) > 0);
  const [activeTab, setActiveTab] = useState<'episodes' | 'more'>(isTvShow ? 'episodes' : 'more');
  const { isMuted, toggleMute, renderTrailer, hasTrailer } = useTrailerPlayer(displayMovie?.trailerUrl || '', movie?.backdropUrl || movie?.posterUrl || '');

  if (!movie) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.85)', padding: '20px', overflowY: 'auto'
    }}>
      <div className="detail-dialog" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '900px', background: 'linear-gradient(to bottom, #0f1014, #000)', borderRadius: '12px',
        overflow: 'hidden', position: 'relative', color: '#FFF', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)', maxHeight: '90vh'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '24px', right: '24px', width: '36px', height: '36px',
          borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40, cursor: 'pointer'
        }}>
          <X size={20} />
        </button>

        <div style={{ position: 'relative', width: '100%', height: '420px', flexShrink: 0 }}>
          {renderTrailer()}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f1014 0%, rgba(15,16,20,0.6) 50%, transparent 100%), linear-gradient(to right, #0f1014 0%, transparent 50%)', zIndex: 15 }} />

          <div style={{ position: 'absolute', bottom: '30px', left: '40px', right: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 20 }}>
            <div>
              {displayMovie?.logoUrl ? (
                <img src={displayMovie.logoUrl} style={{ maxWidth: '320px', maxHeight: '110px', objectFit: 'contain', marginBottom: '16px' }} />
              ) : (
                <h2 style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>{movie.title}</h2>
              )}

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', fontSize: '0.9rem', color: '#FFF', fontWeight: 600 }}>
                <span>{(displayMovie?.releaseDate || movie?.releaseDate || '').split('-')[0]}</span>
                <span>•</span>
                <span>{displayMovie?.duration || movie?.duration}</span>
                <span>•</span>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>U/A 13+</span>
                <span>•</span>
                <span style={{ color: '#E1E6F0' }}>{displayMovie?.genres?.slice(0,3).join(', ')}</span>
                {(displayMovie?.audioLanguages?.length ?? 0) > 0 && (
                  <>
                    <span>•</span>
                    <span style={{ color: '#E1E6F0' }}>{displayMovie?.audioLanguages?.slice(0, 2).join(', ')}</span>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button onClick={() => onPlay(movie)} style={{
                  background: 'linear-gradient(90deg, #1f80e0, #14599c)', color: '#FFF', border: 'none', borderRadius: '8px', padding: '14px 48px',
                  fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(31,128,224,0.4)'
                }}>
                  <Play fill="#FFF" size={20} /> Watch Now
                </button>
                <button onClick={() => onToggleMyList(movie.id)} style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
                  width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF'
                }}>
                  {isMyList ? <Check size={24} /> : <Plus size={24} />}
                </button>

              </div>
            </div>

            {hasTrailer && (
              <button onClick={toggleMute} style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF',
                zIndex: 50
              }}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '20px 40px 40px 40px', color: '#E1E6F0', overflowY: 'auto' }}>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, fontWeight: 400, maxWidth: '90%', marginBottom: '24px' }}>
            {displayMovie?.longDescription || movie.description}
          </p>
          <div style={{ display: 'flex', gap: '40px', fontSize: '0.95rem', marginBottom: '32px' }}>
            {(displayMovie?.cast?.length ?? 0) > 0 && (
              <div>
                <strong style={{ color: '#FFF', display: 'block', marginBottom: '4px' }}>Cast</strong>
                <div style={{ color: '#979CA6' }}>{formatCastNames(displayMovie?.cast)}</div>
              </div>
            )}
            {displayMovie?.director && (
              <div>
                <strong style={{ color: '#FFF', display: 'block', marginBottom: '4px' }}>Director</strong>
                <div style={{ color: '#979CA6' }}>{displayMovie.director}</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
            {(displayMovie?.isSeries || movie.isSeries || (displayMovie?.seasonsCount ?? 0) > 0) && <button onClick={() => setActiveTab('episodes')} style={{ background: 'none', border: 'none', color: activeTab === 'episodes' ? '#FFF' : '#8F98B0', fontSize: '1.1rem', fontWeight: 700, paddingBottom: '12px', borderBottom: activeTab === 'episodes' ? '3px solid #FFF' : '3px solid transparent', cursor: 'pointer' }}>Episodes</button>}
            <button onClick={() => setActiveTab('more')} style={{ background: 'none', border: 'none', color: activeTab === 'more' ? '#FFF' : '#8F98B0', fontSize: '1.1rem', fontWeight: 700, paddingBottom: '12px', borderBottom: activeTab === 'more' ? '3px solid #FFF' : '3px solid transparent', cursor: 'pointer' }}>More Like This</button>
          </div>

          {activeTab === 'episodes' && (displayMovie?.isSeries || movie.isSeries || (displayMovie?.seasonsCount ?? 0) > 0) && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '10px' }}>
                <select value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))} style={{ background: '#191c24', color: '#FFF', border: '1px solid rgba(31,128,224,0.4)', padding: '10px 16px', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', width: 'fit-content', outline: 'none' }}>
                  {Array.from({ length: displayMovie?.seasonsCount || 1 }, (_, i) => i + 1).map(s => <option key={s} value={s} style={{ background: '#0f1014', color: '#FFF' }}>Season {s}</option>)}
                </select>
              </div>
              {isLoadingEpisodes ? (
                <>
                  <EpisodeSkeleton />
                  <EpisodeSkeleton />
                  <EpisodeSkeleton />
                </>
              ) : (
                episodes.map((ep, idx) => (
                  <div key={ep.id} onClick={() => onPlay(movie, ep)} style={{ display: 'flex', gap: '20px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', cursor: 'pointer', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '180px', height: '101px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={ep.thumbnailUrl || movie.backdropUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}><Play size={30} fill="#FFF" color="#FFF" /></div>
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{ep.duration}</div>
                    </div>
                    <div style={{ flex: 1, paddingRight: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 600 }}>E{idx + 1} - {ep.title}</h4>
                      <p style={{ fontSize: '0.9rem', color: '#979CA6', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ep.description || 'No description available for this episode.'}</p>
                    </div>
                  </div>
                ))
              )}
             </div>
          )}

          {(!isTvShow || activeTab === 'more') && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {similarMovies.slice(0, 10).map(sim => (
                <div key={sim.id} onClick={() => onOpenDetails(sim)} style={{ borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: '#151820' }}>
                  <img src={sim.posterUrl || sim.backdropUrl} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = (props) => {
  const { platform } = usePlatform();
  if (platform === 'nflix') return <NetflixModal {...props} platform={platform} />;
  if (platform === 'nprime') return <PrimeModal {...props} platform={platform} />;
  return <HotstarModal {...props} platform={platform} />;
};
