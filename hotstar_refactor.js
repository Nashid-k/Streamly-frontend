const fs = require('fs');
const path = require('path');

const navbarPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

// We will inject the Hotstar Sidebar rendering logic inside Navbar.
// Replace the main return statement in Navbar to conditionally render a sidebar for hotstar.
const returnStatementRegex = /return \(\n    <header/g;
const hotstarSidebar = `
  if (platform === 'hotstar') {
    return (
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '96px',
          background: 'linear-gradient(to right, #030B17 60%, transparent)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 0',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.width = '240px'; e.currentTarget.style.background = '#0C111B'; }}
        onMouseLeave={(e) => { e.currentTarget.style.width = '96px'; e.currentTarget.style.background = 'linear-gradient(to right, #030B17 60%, transparent)'; }}
      >
        {/* Hotstar Logo */}
        <div style={{ marginBottom: '40px', width: '100%', padding: '0 20px', display: 'flex', alignItems: 'center' }}>
          <img src="https://secure-media.hotstarext.com/web-assets/prod/images/brand-logos/disney-hotstar-logo-dark.svg" alt="Disney+ Hotstar" style={{ width: '100%', maxWidth: '120px' }} />
        </div>

        {/* Profile */}
        <div style={{ width: '100%', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', cursor: 'pointer' }} onClick={onOpenProfileModal}>
          <img src={currentProfile?.avatarUrl || 'https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/feature/profile/36.png'} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <span style={{ color: '#FFF', fontWeight: 600, whiteSpace: 'nowrap' }}>{currentProfile?.name || 'My Space'}</span>
        </div>

        {/* Search */}
        <div style={{ width: '100%', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', cursor: 'text' }}>
           <Search size={24} color="#FFF" />
           <input
             type="text"
             placeholder="Search"
             value={searchQuery}
             onChange={(e) => onSearchChange(e.target.value)}
             style={{ background: 'transparent', border: 'none', color: '#FFF', outline: 'none', width: '100%', fontSize: '1rem' }}
           />
        </div>

        {/* Navigation Tabs */}
        <nav style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id && !searchQuery;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); onSearchChange(''); }}
                style={{
                  background: 'none', border: 'none', color: isActive ? '#FFF' : '#AAA', fontSize: '1.1rem',
                  fontWeight: isActive ? 700 : 500, padding: '12px 20px', textAlign: 'left',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px',
                  whiteSpace: 'nowrap', transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? '#FFF' : '#AAA')}
              >
                {/* Dummy icon for now, real hotstar has icons */}
                <div style={{ width: '24px', height: '24px', background: isActive ? '#FFF' : '#AAA', mask: 'url(#)', WebkitMask: 'url(#)', opacity: 0.5 }} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* App Switcher */}
        <div style={{ marginTop: 'auto', width: '100%', padding: '20px' }}>
          <button
             onClick={() => setPlatform('nflix')}
             style={{ background: 'var(--primary-color)', color: '#FFF', border: 'none', padding: '10px', width: '100%', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
             Switch App
          </button>
        </div>
      </aside>
    );
  }

  return (
    <header`;

navbarContent = navbarContent.replace(returnStatementRegex, hotstarSidebar);
fs.writeFileSync(navbarPath, navbarContent);

// Add left padding to main layout in page.tsx for hotstar
const pagePath = path.join('/home/edure/Desktop/nflix/frontend', 'src/app/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Replace main wrapper padding
pageContent = pageContent.replace(/<main style=\{\{ minHeight: '100vh', backgroundColor: 'var\(--bg-color\)', color: '#FFF', width: '100%', position: 'relative' \}\}>/g, 
  "<main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: '#FFF', width: '100%', position: 'relative', paddingLeft: platform === 'hotstar' ? '96px' : '0' }}>");

// For hero banner in hotstar, we need to adjust its padding-left as well or maybe the main paddingLeft handles it.
// Wait, if main has paddingLeft: 96px, it shrinks the width, so HeroBanner which is 100% width will fit correctly! 
fs.writeFileSync(pagePath, pageContent);

// MovieCard.tsx -> Update styling for hotstar cards
const movieCardPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/MovieCard.tsx');
let movieCardContent = fs.readFileSync(movieCardPath, 'utf8');
movieCardContent = movieCardContent.replace(/width: platform === 'nprime' \? '300px' : '290px',/g, "width: platform === 'hotstar' ? '240px' : platform === 'nprime' ? '300px' : '290px',");
movieCardContent = movieCardContent.replace(/height: platform === 'nprime' \? '169px' : '435px',/g, "height: platform === 'hotstar' ? '135px' : platform === 'nprime' ? '169px' : '435px',");
// Hotstar uses landscape images like Prime, but slightly different aspect. (16:9 is 240x135)
fs.writeFileSync(movieCardPath, movieCardContent);

console.log('done refactoring');
