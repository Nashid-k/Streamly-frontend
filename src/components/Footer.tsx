import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ borderTop: '1px solid #333', marginTop: '80px', padding: '40px 4%', color: '#757575', fontSize: '0.85rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div>High-Speed Servers</div>
        <div>4K Ultra Resolution</div>
        <div>Audio & Subtitles</div>
        <div>Help Center</div>
        <div>Terms of Use</div>
        <div>Privacy Policy</div>
      </div>
      <p>Catalog metadata provided by TMDB.</p>
    </footer>
  );
};
