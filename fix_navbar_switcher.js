const fs = require('fs');
const path = require('path');

const navbarPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

// Hide Netflix button when active
navbarContent = navbarContent.replace(
  /<button\s+onClick=\{\(\) => \{ setPlatform\('nflix'\); setShowAppSwitcher\(false\); \}\}\s+onMouseEnter=\{\(e\) => \(e\.currentTarget\.style\.background = 'rgba\(255,255,255,0\.15\)'\)\}\s+onMouseLeave=\{\(e\) => \(e\.currentTarget\.style\.background = platform === 'nflix' \? 'rgba\(255,255,255,0\.1\)' : 'transparent'\)\}\s+style=\{\{[\s\S]*?<\/button>/,
  `{platform !== 'nflix' && (
              <button
                onClick={() => { setPlatform('nflix'); setShowAppSwitcher(false); }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#E50914', letterSpacing: '-0.03em', fontFamily: 'Arial, sans-serif' }}>
                  NETFLIX
                </span>
              </button>
            )}`
);

// Hide Prime button when active
navbarContent = navbarContent.replace(
  /<button\s+onClick=\{\(\) => \{ setPlatform\('nprime'\); setShowAppSwitcher\(false\); \}\}\s+onMouseEnter=\{\(e\) => \(e\.currentTarget\.style\.background = 'rgba\(255,255,255,0\.15\)'\)\}\s+onMouseLeave=\{\(e\) => \(e\.currentTarget\.style\.background = \(platform === 'nprime'\) \? 'rgba\(255,255,255,0\.1\)' : 'transparent'\)\}\s+style=\{\{[\s\S]*?<\/button>/,
  `{platform !== 'nprime' && (
              <button
                onClick={() => { setPlatform('nprime'); setShowAppSwitcher(false); }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFF', letterSpacing: '-0.02em' }}>
                  prime
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 400, color: '#00A8E1', letterSpacing: '-0.02em' }}>
                  video
                </span>
              </button>
            )}`
);

// Hide Hotstar button when active in the top nav
navbarContent = navbarContent.replace(
  /<button\s+onClick=\{\(\) => \{ setPlatform\('hotstar'\); setShowAppSwitcher\(false\); \}\}\s+onMouseEnter=\{\(e\) => \(e\.currentTarget\.style\.background = 'rgba\(255,255,255,0\.15\)'\)\}\s+onMouseLeave=\{\(e\) => \(e\.currentTarget\.style\.background = 'transparent'\)\}\s+style=\{\{[\s\S]*?<\/button>/,
  `{platform !== 'hotstar' && (
              <button
                onClick={() => { setPlatform('hotstar'); setShowAppSwitcher(false); }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', letterSpacing: '-0.02em' }}>
                  Disney+
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1F80E0', letterSpacing: '-0.02em' }}>
                  Hotstar
                </span>
              </button>
            )}`
);

fs.writeFileSync(navbarPath, navbarContent);
console.log('done fixing navbar switcher hide active');
