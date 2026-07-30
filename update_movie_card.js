const fs = require('fs');
const path = require('path');

const cardPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/MovieCard.tsx');
let cardContent = fs.readFileSync(cardPath, 'utf8');

// 1. Add Prime Badge right under Nflix Original N
cardContent = cardContent.replace(
  /\{\/\* Badges Overlay \*\/\}/,
  `{/* Prime Badge */}
      {platform === 'nprime' && (
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 30, background: '#00A8E1', padding: '2px 8px', borderBottomRightRadius: '4px', fontSize: '0.65rem', fontWeight: 900, color: '#FFF', fontStyle: 'italic', letterSpacing: '0.05em' }}>
          prime
        </div>
      )}

      {/* Badges Overlay */}`
);

// 2. Replace Action Buttons
const newActionButtons = `        {/* Action Buttons */}
        {platform === 'hotstar' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', width: '100%' }}>
            <button
              onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
              style={{
                flex: 1, height: '32px', borderRadius: '4px', backgroundColor: 'var(--primary-color)',
                border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', transition: 'transform 0.2s',
              }}
            >
              <Play fill="#FFF" size={14} /> Watch Now
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleMyList(movie.id); }}
              style={{
                width: '32px', height: '32px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
              }}
            >
              {isMyList ? <Check size={16} /> : <Plus size={16} />}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            {/* Play Trailer */}
            <button
              onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
              style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                backgroundColor: platform === 'nprime' ? '#00A8E1' : '#FFF',
                border: 'none',
                color: platform === 'nprime' ? '#FFF' : '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
                transition: 'transform 0.2s',
                flexShrink: 0,
              }}
              title="Play Trailer"
            >
              <Play fill={platform === 'nprime' ? "#FFF" : "#000"} size={16} />
            </button>

            {/* Watchlist */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleMyList(movie.id); }}
              style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                backgroundColor: isMyList ? 'var(--primary-glow-strong)' : (platform === 'nprime' ? 'rgba(15,23,30,0.8)' : 'rgba(255,255,255,0.15)'),
                border: platform === 'nprime' ? '2px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.3)',
                color: '#FFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              title={isMyList ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {isMyList ? <Check size={16} /> : <Plus size={16} />}
            </button>

            {/* Info Modal Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenDetails(movie); }}
              style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                backgroundColor: platform === 'nprime' ? 'rgba(15,23,30,0.8)' : 'rgba(255,255,255,0.15)',
                border: platform === 'nprime' ? '2px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.3)',
                color: '#FFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                marginLeft: 'auto',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              title="More Info"
            >
              <Info size={18} />
            </button>
          </div>
        )}`;

// Replace everything from {/* Action Buttons */} to the closing </div> of that section (before {/* Metadata */})
const actionButtonsRegex = /\{\/\* Action Buttons \*\/\}[\s\S]*?(?=\{\/\* Metadata \*\/\}|{movie\.matchScore}% Match)/;
cardContent = cardContent.replace(actionButtonsRegex, newActionButtons + '\n\n        {/* Metadata */}\n        ');

// Update Hotstar Title styling inside hover overlay to match
// Hotstar puts it directly above the Watch Now button.
// And Prime has it.
cardContent = cardContent.replace(
  /<h4\s*style=\{\{\s*fontSize: '1\.08rem'[\s\S]*?<\/h4>/,
  `<h4
          style={{
            fontSize: '1.08rem',
            fontWeight: 800,
            color: '#FFF',
            marginBottom: '10px',
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {movie.title}
        </h4>`
);

fs.writeFileSync(cardPath, cardContent);
console.log('done updating MovieCard');
