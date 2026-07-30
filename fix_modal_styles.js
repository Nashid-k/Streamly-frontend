const fs = require('fs');
const path = require('path');

const modalPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/MovieDetailModal.tsx');
let modalContent = fs.readFileSync(modalPath, 'utf8');

// Update border radius based on platform
modalContent = modalContent.replace(
  /borderRadius: '10px',/,
  "borderRadius: platform === 'nflix' ? '10px' : platform === 'nprime' ? '4px' : '12px',"
);

// Update gradient to be authentic transparent instead of hardcoded grey
modalContent = modalContent.replace(
  /background: 'linear-gradient\\(to top, var\\(--bg-elevated\\) 0%, rgba\\(24,24,24,0\\.3\\) 55%, rgba\\(0,0,0,0\\.45\\) 100%\\)'/g,
  "background: 'linear-gradient(to top, var(--bg-elevated) 0%, transparent 65%, rgba(0,0,0,0.45) 100%)'"
);

// We should also replace the close button background to match the platform
// It is currently rgba(30,30,30,0.8).
modalContent = modalContent.replace(
  /backgroundColor: isMyList \? 'var\(--primary-glow-strong\)' : 'rgba\(30,30,30,0\.8\)',/,
  "backgroundColor: isMyList ? 'var(--primary-glow-strong)' : (platform === 'nprime' ? 'rgba(15,23,30,0.8)' : platform === 'hotstar' ? 'rgba(22,24,31,0.8)' : 'rgba(30,30,30,0.8)'),"
);

// Update the overview/text section styling
modalContent = modalContent.replace(
  /<p style=\{\{ fontSize: '1rem', lineHeight: '1\.5', color: '#FFF' \}\}>/,
  "<p style={{ fontSize: '1rem', lineHeight: '1.5', color: platform === 'hotstar' ? '#E1E6F0' : '#FFF' }}>"
);

fs.writeFileSync(modalPath, modalContent);
console.log('done fixing modal styles');
