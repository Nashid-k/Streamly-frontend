const fs = require('fs');
const path = require('path');

const modalPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/MovieDetailModal.tsx');
let modalContent = fs.readFileSync(modalPath, 'utf8');

// Prime Play Button
modalContent = modalContent.replace(
  /background: \(platform === 'nprime' \|\| platform === 'hotstar'\) \? 'var\(--primary-color\)' : '#FFF',/g,
  "background: platform === 'hotstar' ? 'var(--primary-color)' : '#FFF',"
);
modalContent = modalContent.replace(
  /color: \(platform === 'nprime' \|\| platform === 'hotstar'\) \? '#FFF' : '#000',/g,
  "color: platform === 'hotstar' ? '#FFF' : '#000',"
);
modalContent = modalContent.replace(
  /<Play fill=\{\(platform === 'nprime' \|\| platform === 'hotstar'\) \? '#FFF' : '#000'\} size=\{16\} \/>/g,
  "<Play fill={platform === 'hotstar' ? '#FFF' : '#000'} size={16} />"
);

// We had this inside MovieDetailModal.tsx for Watchlist Button:
// borderRadius: platform === 'hotstar' ? '8px' : '50%',
// That is already good for Prime since it falls back to '50%'.

fs.writeFileSync(modalPath, modalContent);
console.log('done updating prime detail modal');
