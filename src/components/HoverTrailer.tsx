import React, { useEffect, useRef, useState } from 'react';

interface HoverTrailerProps {
  trailerUrl: string;
  isMuted: boolean;
}

export const HoverTrailer: React.FC<HoverTrailerProps> = ({ trailerUrl, isMuted }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Decode basic encoded URL logic if needed
  const decodeTrailerUrl = (encodedUrl: string): string => {
    if (!encodedUrl) return '';
    if (encodedUrl.includes('youtube.com/embed')) return encodedUrl;

    try {
      const secret = process.env.NEXT_PUBLIC_URL_ENCRYPTION_KEY || 'STREAMLY_SECURE';
      const b64 = atob(encodedUrl);
      return b64.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ secret.charCodeAt(i % secret.length))).join('');
    } catch {
      return encodedUrl;
    }

  };

  const decodedUrl = decodeTrailerUrl(trailerUrl);
  const videoIdMatch = decodedUrl.match(/embed\/([^?]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : '';

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      if (iframeRef.current && iframeRef.current.contentWindow !== event.source) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        const isPlayingEvent = (data.event === 'infoDelivery' && data.info && data.info.playerState === 1) || 
                               (data.event === 'onStateChange' && data.info === 1);

        if (isPlayingEvent) {
          setIsPlaying(true);
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!videoId) return null;

  return (
    <iframe
      ref={iframeRef}
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? '1' : '0'}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1&playsinline=1`}
      style={{ 
        width: '150%', 
        height: '150%', 
        position: 'absolute', 
        top: '-25%', 
        left: '-25%', 
        border: 'none', 
        pointerEvents: 'none', 
        zIndex: 5, 
        opacity: isPlaying ? 1 : 0, 
        transition: 'opacity 0.6s ease'
      }}
      allow="autoplay; encrypted-media"
    />
  );
};
