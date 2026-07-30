const fs = require('fs');
const path = require('path');

const heroPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/HeroBanner.tsx');
let heroContent = fs.readFileSync(heroPath, 'utf8');

// Prime Play Button
heroContent = heroContent.replace(
  /background: \(platform === 'nprime' \|\| platform === 'hotstar'\) \? 'var\(--primary-color\)' : '#FFF',/g,
  "background: platform === 'hotstar' ? 'var(--primary-color)' : '#FFF',"
);
heroContent = heroContent.replace(
  /color: \(platform === 'nprime' \|\| platform === 'hotstar'\) \? '#FFF' : '#000',/g,
  "color: platform === 'hotstar' ? '#FFF' : '#000',"
);
heroContent = heroContent.replace(
  /boxShadow: \(platform === 'nprime' \|\| platform === 'hotstar'\) \? '0 4px 14px var\(--primary-glow\)' : '0 4px 14px rgba\(0,0,0,0\.5\)',/g,
  "boxShadow: platform === 'hotstar' ? '0 4px 14px var(--primary-glow)' : '0 4px 14px rgba(0,0,0,0.5)',"
);
heroContent = heroContent.replace(
  /<Play fill=\{\(platform === 'nprime' \|\| platform === 'hotstar'\) \? '#FFF' : '#000'\} size=\{18\} \/>/g,
  "<Play fill={platform === 'hotstar' ? '#FFF' : '#000'} size={18} />"
);

// Prime More Info Button
heroContent = heroContent.replace(
  /\{platform !== 'hotstar' && \([\s\S]*?<Info size=\{18\} \/> More Info\s*<\/button>\s*\)\}/,
  `{platform !== 'hotstar' && (
          <button
            onClick={() => onOpenDetails(enrichedMovie)}
            style={{
              background: platform === 'nprime' ? 'rgba(255,255,255,0.15)' : 'rgba(109, 109, 110, 0.7)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '1rem',
              padding: platform === 'nprime' ? '0' : '10px 24px',
              width: platform === 'nprime' ? '48px' : 'auto',
              height: platform === 'nprime' ? '48px' : 'auto',
              borderRadius: platform === 'nprime' ? '50%' : '4px',
              border: platform === 'nprime' ? '1px solid rgba(255,255,255,0.4)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <Info size={platform === 'nprime' ? 22 : 18} /> {platform !== 'nprime' && 'More Info'}
          </button>
          )}`
);

// Prime Watchlist Button
heroContent = heroContent.replace(
  /width: platform === 'hotstar' \? 'auto' : '44px',/,
  "width: platform === 'hotstar' ? 'auto' : (platform === 'nprime' ? '48px' : '44px'),"
);
heroContent = heroContent.replace(
  /height: '48px',/,
  "height: platform === 'nprime' ? '48px' : (platform === 'hotstar' ? '48px' : '44px'),"
);

// Prime Badge
heroContent = heroContent.replace(
  /\{!\(displayMovie\.logoUrl \|\| movie\.logoUrl\) && \(/,
  `{platform === 'nprime' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
             <span style={{ background: '#00A8E1', color: '#FFF', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 900, fontStyle: 'italic' }}>prime</span>
             <span style={{ color: '#00A8E1', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.5px' }}>Included with Prime</span>
          </div>
        )}
        {!(displayMovie.logoUrl || movie.logoUrl) && (`
);

fs.writeFileSync(heroPath, heroContent);
console.log('done updating prime hero banner');
