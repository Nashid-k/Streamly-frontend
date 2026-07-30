const fs = require('fs');
const path = require('path');

const heroPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/HeroBanner.tsx');
let heroContent = fs.readFileSync(heroPath, 'utf8');

heroContent = heroContent.replace(
  /<button\s*onClick=\{\(\) => onOpenDetails\(enrichedMovie\)\}[\s\S]*?<Info size=\{18\} \/> More Info\s*<\/button>/,
  `{platform !== 'hotstar' && (
          <button
            onClick={() => onOpenDetails(enrichedMovie)}
            style={{
              background: platform === 'nprime' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(109, 109, 110, 0.7)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '1rem',
              padding: platform === 'nprime' ? '12px 28px' : '10px 24px',
              borderRadius: platform === 'nprime' ? '50px' : '4px',
              border: platform === 'nprime' ? '1px solid rgba(255,255,255,0.4)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s',
            }}
          >
            <Info size={18} /> More Info
          </button>
          )}`
);

heroContent = heroContent.replace(
  /\{\(platform === 'nprime' \|\| platform === 'hotstar'\) && onToggleMyList && \([\s\S]*?<\/button>\s*\)\}/,
  `{(platform === 'nprime' || platform === 'hotstar') && onToggleMyList && (
            <button
              onClick={() => onToggleMyList(enrichedMovie.id)}
              style={{
                height: '48px',
                padding: platform === 'hotstar' ? '0 24px' : '0',
                width: platform === 'hotstar' ? 'auto' : '44px',
                borderRadius: platform === 'hotstar' ? '8px' : '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: platform === 'hotstar' ? 'none' : '1px solid rgba(255,255,255,0.4)',
                color: '#FFF', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                cursor: 'pointer', 
                transition: 'all 0.2s',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              {isMyList ? <Check size={platform === 'hotstar' ? 20 : 24} /> : <Plus size={platform === 'hotstar' ? 20 : 24} />}
              {platform === 'hotstar' && <span>Watchlist</span>}
            </button>
          )}`
);

heroContent = heroContent.replace(
  /borderRadius: \(platform === 'nprime' \|\| platform === 'hotstar'\) \? '50px' : '4px',/g,
  "borderRadius: platform === 'hotstar' ? '8px' : (platform === 'nprime' ? '50px' : '4px'),"
);

const oldGradRegex = /const shadowOverlay =[\s\S]*?rgba\(15, 23, 30, 0\) 80%\)'[\s\S]*?: 'linear-gradient\(90deg, rgba\(20,20,20,1\) 0%, rgba\(20,20,20,0\.8\) 30%, rgba\(20,20,20,0\) 80%\)';/;
const newGrad = `const shadowOverlay =
    platform === 'hotstar'
      ? 'linear-gradient(90deg, #0F1014 0%, rgba(15,16,20,0.95) 30%, rgba(15,16,20,0) 80%)'
      : platform === 'nprime'
      ? 'linear-gradient(90deg, rgba(15, 23, 30, 1) 0%, rgba(15, 23, 30, 0.8) 30%, rgba(15, 23, 30, 0) 80%)'
      : 'linear-gradient(90deg, rgba(20,20,20,1) 0%, rgba(20,20,20,0.8) 30%, rgba(20,20,20,0) 80%)';`;

heroContent = heroContent.replace(oldGradRegex, newGrad);

fs.writeFileSync(heroPath, heroContent);
console.log('done updating hero banner');
