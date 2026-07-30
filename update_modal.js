const fs = require('fs');
const path = require('path');

const modalPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/MovieDetailModal.tsx');
let modalContent = fs.readFileSync(modalPath, 'utf8');

// Play Button
modalContent = modalContent.replace(
  /<button\s*onClick=\{\(\) => onPlay\(movie\)\}[\s\S]*?Play\s*<\/button>/,
  `<button
                  onClick={() => onPlay(movie)}
                  style={{
                    background: (platform === 'nprime' || platform === 'hotstar') ? 'var(--primary-color)' : '#FFF',
                    color: (platform === 'nprime' || platform === 'hotstar') ? '#FFF' : '#000',
                    fontWeight: 800, fontSize: '0.95rem',
                    padding: '9px 22px', 
                    borderRadius: platform === 'hotstar' ? '8px' : (platform === 'nprime' ? '50px' : '4px'),
                    border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Play fill={(platform === 'nprime' || platform === 'hotstar') ? '#FFF' : '#000'} size={16} />
                  {platform === 'hotstar' ? 'Watch Now' : 'Play'}
                </button>`
);

// Watchlist Button
modalContent = modalContent.replace(
  /<button\s*onClick=\{\(\) => onToggleMyList\(movie\.id\)\}[\s\S]*?\{\s*isMyList \? <Check size=\{18\} \/> : <Plus size=\{18\} \/>\s*\}\s*<\/button>/,
  `<button
                  onClick={() => onToggleMyList(movie.id)}
                  style={{
                    width: platform === 'hotstar' ? 'auto' : '40px',
                    padding: platform === 'hotstar' ? '0 16px' : '0',
                    height: '40px', 
                    borderRadius: platform === 'hotstar' ? '8px' : '50%',
                    border: platform === 'hotstar' ? 'none' : '2px solid rgba(255,255,255,0.5)',
                    backgroundColor: isMyList ? 'var(--primary-color)' : 'rgba(30,30,30,0.8)',
                    color: '#FFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    cursor: 'pointer', transition: 'all 0.2s',
                    backdropFilter: 'blur(4px)',
                    fontWeight: 700,
                  }}
                  title={isMyList ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  {isMyList ? <Check size={18} /> : <Plus size={18} />}
                  {platform === 'hotstar' && <span>Watchlist</span>}
                </button>`
);

// Hide Like button on Hotstar (it doesn't have one on the main banner usually, but let's just leave it or hide it)
modalContent = modalContent.replace(
  /<button\s*onClick=\{\(\) => setIsLiked\(!isLiked\)\}[\s\S]*?<ThumbsUp size=\{18\} [\s\S]*?<\/button>/,
  `{platform !== 'hotstar' && (
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.5)',
                    backgroundColor: 'rgba(30,30,30,0.8)',
                    color: isLiked ? 'var(--primary-color)' : '#FFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                    backdropFilter: 'blur(4px)',
                  }}
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
                </button>
                )}`
);

fs.writeFileSync(modalPath, modalContent);
console.log('done updating detail modal');
