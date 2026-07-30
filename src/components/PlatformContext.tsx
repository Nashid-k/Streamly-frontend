'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Platform = 'nflix' | 'nprime' | 'hotstar';

interface PlatformContextType {
  platform: Platform;
  setPlatform: (platform: Platform) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);


const setFavicon = (platform: Platform) => {
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  if (platform === 'nprime') {
    link.href = 'https://www.primevideo.com/favicon.ico';
  } else if (platform === 'hotstar') {
    link.href = 'https://www.hotstar.com/favicon.ico';
  } else {
    link.href = 'https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.ico';
  }
};

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [platform, setPlatformState] = useState<Platform>('nflix');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app_platform') as Platform;
    if (saved === 'nprime' || saved === 'nflix' || saved === 'hotstar') {
      setPlatformState(saved);
      document.documentElement.setAttribute('data-theme', saved);
      if (saved === 'nprime') {
        document.title = 'Prime Video';
        setFavicon('nprime');
      } else if (saved === 'hotstar') {
        document.title = 'Disney+ Hotstar';
        setFavicon('hotstar');
      } else {
        document.title = 'Netflix';
        setFavicon('nflix');
      }
    } else {
      document.title = 'Netflix';
      setFavicon('nflix');
    }
    setIsMounted(true);
  }, []);

  const setPlatform = (p: Platform) => {
    localStorage.setItem('app_platform', p);
    sessionStorage.setItem('is_switching', 'true');
    document.documentElement.setAttribute('data-theme', p);
    setPlatformState(p);
    // Reload the page to reset all data and re-fetch with new platform
    window.location.reload();
  };

  return (
    <PlatformContext.Provider value={{ platform, setPlatform }}>
      {isMounted ? children : null}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error('usePlatform must be used within a PlatformProvider');
  return context;
};
