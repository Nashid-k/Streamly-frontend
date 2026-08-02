import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, FastForward, Rewind, Mic, ArrowLeft, HelpCircle, Layers, Gauge, MonitorPlay, PictureInPicture } from 'lucide-react';
import { usePlatform } from './PlatformContext';

export const CustomPlayer = ({ streamUrl, movie, onBack, onNext, hasNext, onError }: { streamUrl: string, movie: any, onBack?: () => void, onNext?: () => void, hasNext?: boolean, onError?: () => void }) => {
  const { platform } = usePlatform();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Hover preview state
  const [hoverPos, setHoverPos] = useState({ x: 0, time: 0, visible: false });
  const [showXRay, setShowXRay] = useState(false);
  const [xRayTab, setXRayTab] = useState<'cast' | 'music' | 'trivia'>('cast');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showNextEpisodePrompt, setShowNextEpisodePrompt] = useState(false);
  
  const toastTimeoutRef = useRef<NodeJS.Timeout>();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 1500);
  };

  const hlsRef = useRef<Hls | null>(null);
  const [audioTracks, setAudioTracks] = useState<{id: number, name: string}[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState(-1);
  const [subtitleTracks, setSubtitleTracks] = useState<{id: number, name: string}[]>([]);
  const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState(-1);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [qualities, setQualities] = useState<{id: number, height: number}[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const togglePiP = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (videoRef.current && document.pictureInPictureEnabled) {
      await videoRef.current.requestPictureInPicture();
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const handleQualityChange = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentQuality(level);
      setShowQualityMenu(false);
    }
  };

  // Failsafe: if stuck in waiting state for 12s, trigger fallback
  useEffect(() => {
    if (isWaiting) {
      const timer = setTimeout(() => {
        if (onError) {
          console.error('CustomPlayer timed out waiting for video data');
          onError();
        }
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [isWaiting, onError]);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const handleAudioTrackChange = (id: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = id;
      setCurrentAudioTrack(id);
    }
  };

  const handleSubtitleTrackChange = (id: number) => {
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = id;
      setCurrentSubtitleTrack(id);
    }
  };

  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;

    let hls: Hls;
    if (Hls.isSupported()) {
      hls = new Hls({ 
        maxMaxBufferLength: 600, // 10 minutes max buffer
        maxBufferSize: 60 * 1000 * 1000, // 60MB limit
        maxBufferLength: 30,
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (hls.audioTracks && hls.audioTracks.length > 1) {
          setAudioTracks(hls.audioTracks.map((t, idx) => ({ id: idx, name: t.name || `Audio ${idx + 1}` })));
          setCurrentAudioTrack(hls.audioTrack);
        } else {
          setAudioTracks([]);
        }
        
        if (hls.subtitleTracks && hls.subtitleTracks.length > 0) {
          setSubtitleTracks(hls.subtitleTracks.map((t, idx) => ({ id: idx, name: t.name || `Subtitle ${idx + 1}` })));
          setCurrentSubtitleTrack(hls.subtitleTrack);
        } else {
          setSubtitleTracks([]);
        }

        if (hls.levels && hls.levels.length > 1) {
          setQualities(hls.levels.map((l, idx) => ({ id: idx, height: l.height })));
          setCurrentQuality(hls.currentLevel);
        } else {
          setQualities([]);
        }
        videoRef.current?.play().catch(() => {});
      });
      let retryCount = 0;
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (retryCount < 3) {
                retryCount++;
                hls.startLoad();
              } else {
                if (onError) onError();
                else hls.destroy();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              if (onError) onError();
              hls.destroy();
              break;
          }
        }
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = streamUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current?.play().catch(() => {});
      });
    }

    // Load saved playback position
    if (movie?.id) {
      const saved = localStorage.getItem(`watch_pos_${movie.id}`);
      if (saved && videoRef.current) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.cur === 'number' && parsed.cur > 5) {
            videoRef.current.currentTime = parsed.cur;
          }
        } catch {
          // Fallback to legacy old format (just number)
          const parsed = parseFloat(saved);
          if (!isNaN(parsed) && parsed > 5) {
            videoRef.current.currentTime = parsed;
          }
        }
      }
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamUrl, movie?.id]);

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const handleSeekPos = (clientX: number) => {
    if (!progressContainerRef.current || !videoRef.current || !duration) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    let pos = (clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    handleSeekPos(e.clientX);
  };

  const [seekRipple, setSeekRipple] = useState<'left' | 'right' | null>(null);

  const handleVideoDoubleClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.33) {
      videoRef.current.currentTime -= 10;
      setSeekRipple('left');
      setTimeout(() => setSeekRipple(null), 500);
    } else if (x > rect.width * 0.66) {
      videoRef.current.currentTime += 10;
      setSeekRipple('right');
      setTimeout(() => setSeekRipple(null), 500);
    } else {
      toggleFullscreen();
    }
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressContainerRef.current || !duration) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    
    // Calculate tooltip center position in pixels
    let px = e.clientX - rect.left;
    
    setHoverPos({
      x: px,
      time: pos * duration,
      visible: true
    });
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input somewhere
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          showToast(videoRef.current?.paused ? 'Pause' : 'Play');
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          showToast(isMuted ? 'Unmuted' : 'Muted');
          break;
        case 'arrowright':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime += 10;
            showToast('+10s');
          }
          break;
        case 'arrowleft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime -= 10;
            showToast('-10s');
          }
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(v => {
            const nv = Math.min(1, Math.round((v + 0.1) * 10) / 10);
            if(videoRef.current) { videoRef.current.volume = nv; videoRef.current.muted = false; }
            setIsMuted(false);
            showToast(`Volume ${Math.round(nv * 100)}%`);
            return nv;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(v => {
            const nv = Math.max(0, Math.round((v - 0.1) * 10) / 10);
            if(videoRef.current) { videoRef.current.volume = nv; if(nv===0) videoRef.current.muted=true; }
            if(nv===0) setIsMuted(true);
            showToast(`Volume ${Math.round(nv * 100)}%`);
            return nv;
          });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMuted, volume]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const updateProgress = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    // Save position to localStorage every ~3 seconds
    if (movie?.id && cur > 5 && Math.abs(cur - (videoRef.current as any)._lastSavedPos || 0) > 3) {
      (videoRef.current as any)._lastSavedPos = cur;
      const progressData = { cur, duration: videoRef.current.duration };
      localStorage.setItem(`watch_pos_${movie.id}`, JSON.stringify(progressData));
    }

    if (hasNext && videoRef.current.duration > 0) {
      if (videoRef.current.duration - cur <= 15) {
        setShowNextEpisodePrompt(true);
      } else {
        setShowNextEpisodePrompt(false);
      }
      if (videoRef.current.duration - cur <= 0.5) {
        if (onNext) onNext();
      }
    }

    if (videoRef.current.buffered.length > 0) {
      let maxBuffered = 0;
      for (let i = 0; i < videoRef.current.buffered.length; i++) {
        if (videoRef.current.buffered.end(i) > maxBuffered) {
          maxBuffered = videoRef.current.buffered.end(i);
        }
      }
      setBuffered(maxBuffered);
    }
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration ? (buffered / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
      style={{
        position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', zIndex: 10
      }}
    >
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onTimeUpdate={updateProgress}
        onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsWaiting(true)}
        onPlaying={() => setIsWaiting(false)}
        onEnded={() => {
          if (onNext && hasNext) {
            onNext();
          } else {
            setIsPlaying(false);
          }
        }}
        onClick={togglePlay}
        onDoubleClick={handleVideoDoubleClick}
      />
      
      {/* Seek Ripples */}
      {seekRipple === 'left' && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%', background: 'radial-gradient(circle at center left, rgba(255,255,255,0.2) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', animation: 'fadeInOut 0.5s ease' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            <Rewind size={40} />
            <span style={{ fontWeight: 'bold' }}>-10s</span>
          </div>
        </div>
      )}
      {seekRipple === 'right' && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '30%', background: 'radial-gradient(circle at center right, rgba(255,255,255,0.2) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', animation: 'fadeInOut 0.5s ease' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            <FastForward size={40} />
            <span style={{ fontWeight: 'bold' }}>+10s</span>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: scale(0.9); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.1); }
        }
        @keyframes playPulse {
          0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes menuSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .player-btn {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease;
        }
        .player-btn:hover {
          transform: scale(1.15);
          opacity: 1;
        }
        .player-btn:active {
          transform: scale(0.95);
        }
        .menu-popup {
          animation: menuSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* Toast Notification (Speed, Volume, Seek feedback) */}
      {toastMessage && (
        <div style={{
          position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '8px 18px', borderRadius: '20px',
          fontSize: '0.95rem', fontWeight: 600, backdropFilter: 'blur(10px)', pointerEvents: 'none',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)', zIndex: 25, transition: 'all 0.2s ease'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Play/Pause Center Animation (Netflix style) */}
      {platform === 'nflix' && !isPlaying && showControls && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', animation: 'playPulse 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          background: 'rgba(0,0,0,0.55)', borderRadius: '50%', width: '84px', height: '84px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <Play size={44} fill="#fff" style={{ marginLeft: '6px' }} />
        </div>
      )}

      {/* Loading Spinner */}
      {isWaiting && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{
             width: '60px', height: '60px', border: '4px solid rgba(255,255,255,0.1)',
             borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}

      {/* Top Bar Overlay */}
      <div className="player-top-bar" style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
        padding: '24px 36px', transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: platform === 'nprime' ? 'center' : 'flex-start' }}>
          {onBack && (
            <button onClick={onBack} className="player-btn" style={{ gap: '8px', position: platform === 'nprime' ? 'absolute' : 'relative', left: platform === 'nprime' ? '30px' : 'auto' }}>
              <ArrowLeft size={30} />
              {platform === 'nflix' && <span style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '0.02em' }}>Back</span>}
            </button>
          )}
          {platform !== 'nflix' && (
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.4rem', fontWeight: 500, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {movie?.title || 'Unknown Title'}
            </h2>
          )}
        </div>
        
        {/* Platform Specific Top-Right UI */}
        {platform === 'nprime' && (
          <button 
            onClick={() => setShowXRay(!showXRay)}
            style={{
              background: showXRay ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)', 
              color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px',
              fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(5px)',
              transition: 'all 0.2s'
            }}>
            X-Ray
          </button>
        )}
      </div>

      {showNextEpisodePrompt && hasNext && (
        <div style={{ position: 'absolute', bottom: '120px', right: '40px', zIndex: 40, background: 'rgba(0,0,0,0.85)', padding: '16px 24px', borderRadius: '8px', border: '1px solid #1F80E0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <span style={{ color: '#FFF', fontWeight: 600 }}>Next Episode playing in {Math.max(0, Math.ceil(duration - currentTime))}...</span>
          <button onClick={() => { setShowNextEpisodePrompt(false); if (onNext) onNext(); }} style={{ background: '#1F80E0', color: '#FFF', border: 'none', padding: '8px 24px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>
            Play Now
          </button>
        </div>
      )}

      {/* X-Ray Cast Overlay (Prime Only) */}
      {platform === 'nprime' && showXRay && (
        <div className="menu-popup xray-panel" style={{
          position: 'absolute', top: '75px', left: '30px', bottom: '110px', width: '330px',
          background: 'rgba(15, 23, 30, 0.96)', backdropFilter: 'blur(20px)', borderRadius: '8px',
          padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto',
          border: '1px solid rgba(0, 168, 225, 0.35)', zIndex: 30, boxShadow: '0 12px 40px rgba(0,0,0,0.85)'
        }}>
          {/* Header & Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, color: '#00A8E1', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>X-Ray</h3>
              <span style={{ fontSize: '0.75rem', color: '#00A8E1', background: 'rgba(0,168,225,0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>In Scene ({formatTime(currentTime)})</span>
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
              <span 
                onClick={() => setXRayTab('cast')}
                style={{ color: xRayTab === 'cast' ? '#00A8E1' : '#8197a4', borderBottom: xRayTab === 'cast' ? '2px solid #00A8E1' : 'none', paddingBottom: '4px', cursor: 'pointer', transition: 'all 0.15s' }}>
                Cast
              </span>
              <span 
                onClick={() => setXRayTab('music')}
                style={{ color: xRayTab === 'music' ? '#00A8E1' : '#8197a4', borderBottom: xRayTab === 'music' ? '2px solid #00A8E1' : 'none', paddingBottom: '4px', cursor: 'pointer', transition: 'all 0.15s' }}>
                Music
              </span>
              <span 
                onClick={() => setXRayTab('trivia')}
                style={{ color: xRayTab === 'trivia' ? '#00A8E1' : '#8197a4', borderBottom: xRayTab === 'trivia' ? '2px solid #00A8E1' : 'none', paddingBottom: '4px', cursor: 'pointer', transition: 'all 0.15s' }}>
                Trivia
              </span>
            </div>
          </div>

          {/* TAB 1: CAST */}
          {xRayTab === 'cast' && (() => {
            const rawCast = movie?.cast?.length ? movie.cast : [
              { name: 'Lead Performer', character: 'Main Protagonist', profileUrl: null },
              { name: 'Supporting Lead', character: 'Co-Star', profileUrl: null },
              { name: 'Featured Guest', character: 'Special Appearance', profileUrl: null }
            ];
            const seed = Math.floor(currentTime / 45);
            const count = Math.min(4, rawCast.length);
            const inSceneCast = [];
            for (let i = 0; i < count; i++) {
              inSceneCast.push(rawCast[(seed + i) % rawCast.length]);
            }

            return inSceneCast.map((actor: any, idx: number) => {
              const isObject = typeof actor === 'object' && actor !== null;
              const name = isObject ? actor.name : actor;
              const character = isObject ? (actor.character || 'Cast') : 'Cast Member';
              const profileUrl = isObject ? actor.profileUrl : null;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,168,225,0.15)', border: '1px solid rgba(0,168,225,0.3)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {profileUrl ? (
                      <img src={profileUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#00A8E1', fontWeight: 700, fontSize: '1.1rem' }}>{name.charAt(0)}</span>
                    )}
                  </div>
                  <div style={{ color: '#fff', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFF' }}>{name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8197a4', fontWeight: 500 }}>{character}</div>
                  </div>
                </div>
              );
            });
          })()}

          {/* TAB 2: MUSIC */}
          {xRayTab === 'music' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '6px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '6px' }}>
                <Mic size={20} color="#00A8E1" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#FFF', fontWeight: 700, fontSize: '0.9rem' }}>Original Motion Picture Score</span>
                  <span style={{ color: '#8197a4', fontSize: '0.8rem' }}>Official Theme Stream</span>
                </div>
              </div>
              <div style={{ color: '#8197a4', fontSize: '0.8rem', fontStyle: 'italic', padding: '4px' }}>
                Track playing in current scene ({formatTime(currentTime)}).
              </div>
            </div>
          )}

          {/* TAB 3: TRIVIA */}
          {xRayTab === 'trivia' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '6px 0' }}>
              <div style={{ color: '#FFF', fontSize: '0.88rem', lineHeight: '1.4', background: 'rgba(0,168,225,0.08)', borderLeft: '3px solid #00A8E1', padding: '10px 12px', borderRadius: '0 6px 6px 0' }}>
                Did you know? This scene features custom spatial audio scoring mixed specifically for Dolby Surround formats.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hotstar Specific Center Seek Rings */}
      {platform === 'hotstar' && showControls && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          display: 'flex', gap: '80px', pointerEvents: 'auto', zIndex: 12
        }}>
          <button 
            onClick={() => { if(videoRef.current) videoRef.current.currentTime -= 10; }}
            style={{ background: 'rgba(0,0,0,0.4)', border: '2px solid #fff', borderRadius: '50%', width: '60px', height: '60px', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Rewind size={24} />
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>10</span>
          </button>
          <button 
            onClick={() => { if(videoRef.current) videoRef.current.currentTime += 10; }}
            style={{ background: 'rgba(0,0,0,0.4)', border: '2px solid #fff', borderRadius: '50%', width: '60px', height: '60px', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FastForward size={24} />
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>10</span>
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="custom-player-controls" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.65) 50%, transparent 100%)',
        padding: '40px 30px 24px', transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none',
        display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        
        {/* Platform Specific Floating Buttons */}
        {currentTime > 5 && currentTime < 180 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '10px' }}>
            <button 
              onClick={() => { if(videoRef.current) videoRef.current.currentTime += 85; showToast('Skipped Intro'); }}
              style={{
                background: platform === 'nprime' ? 'rgba(0,168,225,0.85)' : platform === 'hotstar' ? 'rgba(31,128,224,0.85)' : 'rgba(20,20,20,0.85)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.3)', 
                padding: '10px 22px', borderRadius: platform === 'hotstar' ? '8px' : '4px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s', backdropFilter: 'blur(10px)', boxShadow: '0 4px 14px rgba(0,0,0,0.6)'
              }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
              <span style={{ color: 'inherit' }}>Skip Intro</span>
            </button>
          </div>
        )}

        {/* Next Episode Floating Button */}
        {hasNext && progressPercent > 85 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '10px' }}>
            <button 
              onClick={onNext}
              style={{
                background: platform === 'hotstar' ? 'linear-gradient(90deg, #1f80e0, #14599c)' : 'var(--primary-color)',
                color: '#fff', border: 'none', 
                padding: '12px 26px', borderRadius: platform === 'hotstar' ? '8px' : '6px', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(0,0,0,0.8)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
              }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <FastForward size={18} fill="#FFF" /> Next Episode
            </button>
          </div>
        )}
        
        {/* Progress Bar Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#fff', fontSize: '13px', minWidth: '45px', textAlign: 'right' }}>
            {formatTime(currentTime)}
          </span>

          <div 
            ref={progressContainerRef}
            onClick={handleSeek}
            onMouseDown={(e) => {
              setIsDragging(true);
              handleSeekPos(e.clientX);
            }}
            onMouseMove={(e) => {
              handleProgressHover(e);
              if (isDragging) handleSeekPos(e.clientX);
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => {
              setIsDragging(false);
              setHoverPos(p => ({ ...p, visible: false }));
            }}
            style={{ 
              position: 'relative', flex: 1, height: hoverPos.visible || isDragging ? '9px' : '6px', background: 'rgba(255,255,255,0.2)', 
              borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'height 0.15s ease' 
            }}
          >
            {/* Hover Tooltip */}
            {hoverPos.visible && (
              <div style={{
                position: 'absolute', left: hoverPos.x, bottom: '25px', transform: 'translateX(-50%)',
                background: platform === 'nflix' ? '#E50914' : '#fff', color: platform === 'nflix' ? '#fff' : '#000', padding: '4px 8px', borderRadius: '4px',
                fontSize: '13px', fontWeight: 'bold', pointerEvents: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                border: platform === 'hotstar' ? '1px solid rgba(255,255,255,0.2)' : 'none'
              }}>
                {formatTime(hoverPos.time)}
              </div>
            )}
            
            {/* Buffer Bar */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: `${bufferPercent}%`,
              background: platform === 'nflix' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)', borderRadius: '3px'
            }} />
            
            {/* Progress Bar */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progressPercent}%`,
              background: platform === 'nflix' ? '#E50914' : platform === 'nprime' ? '#00A8E1' : '#1F80E0', borderRadius: '3px', transition: 'width 0.1s linear'
            }}>
              {/* Playhead Scrubber */}
              <div style={{
                position: 'absolute', right: '-8px', top: '50%', transform: `translateY(-50%) scale(${hoverPos.visible ? 1.2 : 1})`,
                width: '16px', height: '16px', borderRadius: '50%', 
                background: platform === 'nflix' ? '#E50914' : platform === 'nprime' ? '#00A8E1' : '#1F80E0',
                boxShadow: '0 2px 5px rgba(0,0,0,0.5)', transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </div>
          </div>

          <span style={{ color: '#ccc', fontSize: '13px', minWidth: '45px' }}>
            {formatTime(duration - currentTime)}
          </span>
        </div>

        {/* Controls Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <button onClick={togglePlay} className="player-btn">
              {isPlaying ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
            </button>
            <button onClick={() => { if(videoRef.current) videoRef.current.currentTime -= 10; }} className="player-btn">
              <Rewind size={24} />
            </button>
            <button onClick={() => { if(videoRef.current) videoRef.current.currentTime += 10; }} className="player-btn">
              <FastForward size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={toggleMute} className="player-btn">
                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input 
                type="range" min="0" max="1" step="0.1" value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{ width: '85px', accentColor: platform === 'nflix' ? '#E50914' : platform === 'nprime' ? '#00A8E1' : '#1F80E0', cursor: 'pointer' }}
              />
            </div>
            
            {/* Netflix Title in Bottom Controls */}
            {platform === 'nflix' && (
              <h2 style={{ color: '#fff', margin: '0 0 0 16px', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.01em', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                {movie?.title || 'Unknown Title'}
              </h2>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '22px', position: 'relative' }}>
            {/* Quality Selector */}
            {qualities.length > 1 && (
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); setShowAudioMenu(false); }} className="player-btn" title="Quality">
                  <Settings size={22} />
                </button>
                {showQualityMenu && (
                  <div className="menu-popup" style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '20px', background: 'rgba(20,20,20,0.96)', borderRadius: '6px', padding: '8px 0', minWidth: '130px', boxShadow: '0 8px 32px rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)' }}>
                    <div onClick={() => handleQualityChange(-1)} style={{ padding: '9px 20px', cursor: 'pointer', backgroundColor: currentQuality === -1 ? 'rgba(255,255,255,0.12)' : 'transparent', color: currentQuality === -1 ? (platform === 'nflix' ? '#E50914' : platform === 'nprime' ? '#00A8E1' : '#1F80E0') : '#FFF', transition: 'background 0.15s' }}>
                      Auto
                    </div>
                    {qualities.map(q => (
                      <div key={q.id} onClick={() => handleQualityChange(q.id)} style={{ padding: '9px 20px', cursor: 'pointer', backgroundColor: currentQuality === q.id ? 'rgba(255,255,255,0.12)' : 'transparent', color: currentQuality === q.id ? (platform === 'nflix' ? '#E50914' : platform === 'nprime' ? '#00A8E1' : '#1F80E0') : '#FFF', transition: 'background 0.15s' }}>
                        {q.height}p
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Playback Speed */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); setShowAudioMenu(false); }} className="player-btn" title="Speed">
                <Gauge size={22} />
              </button>
              {showSpeedMenu && (
                <div className="menu-popup" style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '20px', background: 'rgba(20,20,20,0.96)', borderRadius: '6px', padding: '8px 0', minWidth: '120px', boxShadow: '0 8px 32px rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)' }}>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                    <div key={s} onClick={() => handleSpeedChange(s)} style={{ padding: '9px 20px', cursor: 'pointer', backgroundColor: playbackSpeed === s ? 'rgba(255,255,255,0.12)' : 'transparent', color: playbackSpeed === s ? (platform === 'nflix' ? '#E50914' : platform === 'nprime' ? '#00A8E1' : '#1F80E0') : '#FFF', transition: 'background 0.15s' }}>
                      {s}x
                    </div>
                  ))}
                </div>
              )}
            </div>

            {platform === 'nflix' && (
              <button className="player-btn" title="Episodes">
                <Layers size={22} />
              </button>
            )}

            {(audioTracks.length > 1 || subtitleTracks.length > 0) && (
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setShowAudioMenu(!showAudioMenu); setShowQualityMenu(false); setShowSpeedMenu(false); }} className="player-btn" title="Audio & Subtitles">
                  <Mic size={22} />
                </button>
                {showAudioMenu && (
                  <div className="menu-popup" style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '20px', background: 'rgba(20,20,20,0.96)', borderRadius: '6px', padding: '18px', minWidth: '320px', boxShadow: '0 8px 32px rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', display: 'flex', gap: '30px' }}>
                    {/* Audio Column */}
                    {audioTracks.length > 1 && (
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>Audio</h4>
                        {audioTracks.map(track => (
                          <div key={track.id} onClick={() => handleAudioTrackChange(track.id)} style={{ padding: '7px 12px', margin: '3px 0', cursor: 'pointer', backgroundColor: currentAudioTrack === track.id ? 'rgba(255,255,255,0.12)' : 'transparent', color: currentAudioTrack === track.id ? (platform === 'nflix' ? '#E50914' : platform === 'nprime' ? '#00A8E1' : '#1F80E0') : '#FFF', borderRadius: '4px', transition: 'background 0.15s' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: currentAudioTrack === track.id ? 700 : 400 }}>{track.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Subtitles Column */}
                    {subtitleTracks.length > 0 && (
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>Subtitles</h4>
                        <div onClick={() => handleSubtitleTrackChange(-1)} style={{ padding: '7px 12px', margin: '3px 0', cursor: 'pointer', backgroundColor: currentSubtitleTrack === -1 ? 'rgba(255,255,255,0.12)' : 'transparent', color: currentSubtitleTrack === -1 ? (platform === 'nflix' ? '#E50914' : platform === 'nprime' ? '#00A8E1' : '#1F80E0') : '#FFF', borderRadius: '4px', transition: 'background 0.15s' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: currentSubtitleTrack === -1 ? 700 : 400 }}>Off</span>
                        </div>
                        {subtitleTracks.map(track => (
                          <div key={track.id} onClick={() => handleSubtitleTrackChange(track.id)} style={{ padding: '7px 12px', margin: '3px 0', cursor: 'pointer', backgroundColor: currentSubtitleTrack === track.id ? 'rgba(255,255,255,0.12)' : 'transparent', color: currentSubtitleTrack === track.id ? (platform === 'nflix' ? '#E50914' : platform === 'nprime' ? '#00A8E1' : '#1F80E0') : '#FFF', borderRadius: '4px', transition: 'background 0.15s' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: currentSubtitleTrack === track.id ? 700 : 400 }}>{track.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Picture in Picture */}
            <button onClick={togglePiP} className="player-btn" title="Picture in Picture">
              <PictureInPicture size={22} />
            </button>
            
            <button onClick={toggleFullscreen} className="player-btn" title="Fullscreen">
              <Maximize size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
