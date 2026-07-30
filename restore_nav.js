const fs = require('fs');
const path = require('path');

const navbarPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/Navbar.tsx');
let content = fs.readFileSync(navbarPath, 'utf8');

// I will find the exact spot to insert the deleted block
// The spot is right after:
/*
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1F80E0', letterSpacing: '-0.02em' }}>
                  Hotstar
                </span>
              </button>
            )}
            </div>
          )}
        </div>
*/
// Let's replace that exact string with the string + the missing block

const searchString = `            </div>
          )}
        </div>`;

const missingBlock = `            </div>
          )}
        </div>
      </aside>
      )}

      {/* Main Top Nav */}
      <header>
      <div
        className={\`navbar \${isScrolled ? 'scrolled' : ''}\`}
        style={{
          marginLeft: (platform === 'hotstar' && isHotstarExpanded) ? '280px' : (platform === 'hotstar' ? '80px' : '0'),
          transition: 'margin-left 0.3s ease',
          background: isScrolled ? (platform === 'nprime' ? 'rgba(15, 23, 30, 0.95)' : 'var(--bg-elevated)') : 'transparent',
          boxShadow: isScrolled ? '0 4px 12px rgba(0,0,0,0.5)' : 'none',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          height: '68px',
          padding: '0 4%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0, right: 0, left: 0,
          zIndex: 90,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          {/* Brand Logo */}
          {platform === 'nflix' && (
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" style={{ height: '24px', cursor: 'pointer' }} onClick={() => setActiveTab('home')} />
          )}
          {platform === 'nprime' && (
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png" alt="Prime Video" style={{ height: '32px', cursor: 'pointer' }} onClick={() => setActiveTab('home')} />
          )}
          
          {/* Top Nav Links (Hidden on Hotstar since it uses Sidebar) */}
          {platform !== 'hotstar' && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: activeTab === item.id ? '#FFF' : '#E5E5E5',
                    fontWeight: activeTab === item.id ? 700 : 400,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#B3B3B3'}
                  onMouseLeave={(e) => e.currentTarget.style.color = activeTab === item.id ? '#FFF' : '#E5E5E5'}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* 9-dot App Switcher in Top Nav */}
          {platform !== 'hotstar' && (
            <div style={{ position: 'relative' }} ref={appSwitcherRef}>
              <button
                onClick={() => setShowAppSwitcher(!showAppSwitcher)}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Switch App"
              >
                <Grip size={20} />
              </button>
              
              {showAppSwitcher && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '42px',
                    width: '180px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '8px',
                    borderRadius: '8px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  <style>{\`
                    @keyframes fadeIn {
                      from { opacity: 0; transform: translateY(-10px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                  \`}</style>
                  {platform !== 'nflix' && (
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
                  )}
                  {platform !== 'nprime' && (
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
                  )}
                  {platform !== 'hotstar' && (
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
                  )}
                </div>
              )}
            </div>
          )}`;

const splitContent = content.split(searchString);
if (splitContent.length === 2) {
  content = splitContent[0] + missingBlock + splitContent[1];
  fs.writeFileSync(navbarPath, content);
  console.log('done restoring missing block');
} else {
  console.log('could not split exactly once, got: ' + splitContent.length);
}
