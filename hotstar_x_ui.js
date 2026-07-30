const fs = require('fs');
const path = require('path');

const globalsPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/app/globals.css');
let globalsContent = fs.readFileSync(globalsPath, 'utf8');

globalsContent = globalsContent.replace(/\[data-theme="hotstar"\] \{[\s\S]*?\}/, `[data-theme="hotstar"] {
  --primary-color: #1F80E0;
  --primary-glow: rgba(31, 128, 224, 0.4);
  --primary-glow-strong: rgba(31, 128, 224, 0.8);
  --primary-faded: rgba(31, 128, 224, 0.22);
  --primary-border: rgba(31, 128, 224, 0.15);
  --bg-color: #0F1014;
  --bg-elevated: #16181F;
  --text-color: #E1E6F0;
}`);
fs.writeFileSync(globalsPath, globalsContent);

const navbarPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

// The sidebar logic for Hotstar
// We will use lucide-react icons which are already imported at the top of Navbar (or we can import them)
// Let's add imports to Navbar if they don't exist.
const navbarImportsMatch = navbarContent.match(/import \{([^}]+)\} from 'lucide-react';/);
if (navbarImportsMatch) {
  let imports = navbarImportsMatch[1];
  ['Home', 'Tv', 'Film', 'Plus', 'Search', 'User', 'Grip'].forEach(icon => {
    if (!imports.includes(icon)) imports += `, ${icon}`;
  });
  navbarContent = navbarContent.replace(/import \{([^}]+)\} from 'lucide-react';/, `import {${imports}} from 'lucide-react';`);
}

const newHotstarSidebar = `  if (platform === 'hotstar') {
    return (
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '96px',
          background: 'linear-gradient(to right, #0F1014 60%, transparent)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '32px 0',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.width = '240px'; e.currentTarget.style.background = 'rgba(15, 16, 20, 0.95)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.width = '96px'; e.currentTarget.style.background = 'linear-gradient(to right, #0F1014 60%, transparent)'; }}
      >
        <div style={{ marginBottom: '40px', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
          <img src="https://secure-media.hotstarext.com/web-assets/prod/images/brand-logos/disney-hotstar-logo-dark.svg" alt="Disney+ Hotstar" style={{ width: '100%', maxWidth: '140px', minWidth: '48px' }} />
        </div>

        <nav style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Profile Space */}
          <button
            onClick={onOpenProfileModal}
            style={{
              background: 'none', border: 'none', color: '#8F98B2', fontSize: '1.1rem',
              fontWeight: 600, padding: '16px 36px', textAlign: 'left',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px',
              whiteSpace: 'nowrap', transition: 'all 0.2s', width: '100%'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8F98B2'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <User size={24} />
            <span>My Space</span>
          </button>

          {/* Search */}
          <button
            onClick={() => { document.querySelector('input')?.focus(); }}
            style={{
              background: 'none', border: 'none', color: searchQuery ? '#FFF' : '#8F98B2', fontSize: '1.1rem',
              fontWeight: 600, padding: '16px 36px', textAlign: 'left',
              cursor: 'text', display: 'flex', alignItems: 'center', gap: '20px',
              whiteSpace: 'nowrap', transition: 'all 0.2s', width: '100%'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = searchQuery ? '#FFF' : '#8F98B2'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Search size={24} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#FFF', outline: 'none', width: '100%', fontSize: '1rem', fontFamily: 'inherit' }}
            />
          </button>

          {navItems.map((item) => {
            const isActive = activeTab === item.id && !searchQuery;
            const Icon = item.id === 'home' ? Home : item.id === 'series' ? Tv : item.id === 'movies' ? Film : item.id === 'mylist' ? Plus : Home;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); onSearchChange(''); }}
                style={{
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'none', border: 'none', 
                  color: isActive ? '#FFF' : '#8F98B2', fontSize: '1.1rem', borderRadius: '8px',
                  fontWeight: isActive ? 700 : 500, padding: '16px 36px', textAlign: 'left',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', margin: '0 12px',
                  whiteSpace: 'nowrap', transition: 'all 0.2s', width: 'calc(100% - 24px)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? '#FFF' : '#8F98B2'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Icon size={24} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Switcher Button inside Sidebar */}
        <div style={{ marginTop: 'auto', width: '100%', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
           <button
             onClick={() => setPlatform('nflix')}
             style={{ background: '#1F80E0', color: '#FFF', border: 'none', padding: '12px', width: '100%', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
           >
             <Grip size={18} />
             <span>Switch App</span>
           </button>
        </div>
      </aside>
    );
  }`;

navbarContent = navbarContent.replace(/if \(platform === 'hotstar'\) \{[\s\S]*?return \(\n    <header/m, newHotstarSidebar + "\n  return (\n    <header");
fs.writeFileSync(navbarPath, navbarContent);

console.log('done hotstar X ui');
