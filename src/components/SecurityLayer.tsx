'use client';

import React, { useEffect } from 'react';

export const SecurityLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Note: Blocking Right-Click and F12 is heavily correlated with Tech Support Scams 
    // and causes Google Safe Browsing to flag the site as "Dangerous" or "Deceptive".
    // We have removed these blocks to maintain a clean reputation score.
  }, []);

  return <>{children}</>;
};
