'use client';

import React, { useEffect } from 'react';

export const SecurityLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Block Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Block common developer tools shortcuts and copy/paste
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Ctrl+Shift+I, J, C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }
    };

    // Block copy, cut, paste, drag
    const preventDefault = (e: Event) => e.preventDefault();

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('copy', preventDefault);
    window.addEventListener('cut', preventDefault);
    window.addEventListener('paste', preventDefault);
    window.addEventListener('dragstart', preventDefault);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('copy', preventDefault);
      window.removeEventListener('cut', preventDefault);
      window.removeEventListener('paste', preventDefault);
      window.removeEventListener('dragstart', preventDefault);
    };
  }, []);

  return <>{children}</>;
};
