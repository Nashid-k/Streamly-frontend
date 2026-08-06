import React from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  showScrollTop: boolean;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ showScrollTop }) => {
  if (!showScrollTop) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary-color)',
        color: '#FFF',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 6px 18px var(--primary-glow-strong)',
        transition: 'transform 0.2s',
      }}
      title="Scroll to Top"
    >
      <ArrowUp size={22} />
    </button>
  );
};
