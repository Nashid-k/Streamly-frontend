import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className="toast-animate"
      data-testid="toast-notification"
      style={{
        position: 'fixed',
        bottom: '30px',
        left: '30px',
        backgroundColor: 'rgba(20, 20, 20, 0.94)',
        color: '#FFF',
        border: '1px solid var(--primary-glow-strong)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.85), 0 0 16px var(--primary-glow)',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: 800,
        zIndex: 2000,
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'inline-block', boxShadow: '0 0 8px var(--primary-color)' }} />
      {message}
    </div>
  );
};
