'use client';

import React, { useEffect } from 'react';

export const SecurityLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // 1. Disable Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.metaKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // 3. DevTools Detector (Debugger Loop)
    // This constantly triggers the debugger if devtools is open, preventing inspection
    const antiDebug = setInterval(() => {
      const start = Date.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = Date.now();
      if (end - start > 100) {
        // Devtools likely opened because execution was paused
        document.body.innerHTML = '<div style="display:flex;height:100vh;width:100vw;align-items:center;justify-content:center;background:#000;color:#fff;font-family:sans-serif;font-size:24px;">Security Violation: Developer Tools are not allowed.</div>';
      }
    }, 1000);

    // 4. Overwrite console to prevent logging
    const noOp = () => {};
    const originalConsole = { ...console };
    console.log = noOp;
    console.info = noOp;
    console.warn = noOp;
    console.error = noOp;
    console.debug = noOp;
    console.table = noOp;
    console.dir = noOp;
    console.trace = noOp;

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(antiDebug);
      // Restore console
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.debug = originalConsole.debug;
      console.table = originalConsole.table;
      console.dir = originalConsole.dir;
      console.trace = originalConsole.trace;
    };
  }, []);

  return <>{children}</>;
};
