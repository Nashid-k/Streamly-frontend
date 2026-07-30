const fs = require('fs');
const path = require('path');

const navbarPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

// We need to add `const [isHotstarExpanded, setIsHotstarExpanded] = useState(false);`
// to Navbar.tsx if it's not there.
if (!navbarContent.includes('isHotstarExpanded')) {
  navbarContent = navbarContent.replace(/const \[isScrolled, setIsScrolled\] = useState\(false\);/, 
    "const [isScrolled, setIsScrolled] = useState(false);\n  const [isHotstarExpanded, setIsHotstarExpanded] = useState(false);");
}

// Now replace the Hotstar sidebar JSX.
const oldSidebarRegex = /if \(platform === 'hotstar'\) \{[\s\S]*?return \(\n    <header/;

const newHotstarSidebar = `if (platform === 'hotstar') {
    return (
      <>
        {/* Overlay when sidebar is expanded */}
        {isHotstarExpanded && (
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1999 }}
            onMouseEnter={() => setIsHotstarExpanded(false)}
          />
        )}
        <aside
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: isHotstarExpanded ? '280px' : '96px',
            background: isHotstarExpanded ? '#0F1014' : 'linear-gradient(to right, rgba(15,16,20,0.9) 0%, transparent 100%)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 0',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s',
            overflow: 'hidden',
          }}
          onMouseEnter={() => setIsHotstarExpanded(true)}
          onMouseLeave={() => setIsHotstarExpanded(false)}
        >
          {/* Logo container */}
          <div style={{ marginBottom: '40px', padding: '0 32px', display: 'flex', alignItems: 'center', height: '48px', minWidth: '280px' }}>
            <img 
              src="https://secure-media.hotstarext.com/web-assets/prod/images/brand-logos/disney-hotstar-logo-dark.svg" 
              alt="Disney+ Hotstar" 
              style={{ 
                height: '42px',
                transition: 'opacity 0.3s',
                opacity: isHotstarExpanded ? 1 : 0, // Logo hides when collapsed? Actually Hotstar's full logo shows when expanded.
                position: 'absolute',
                left: '32px'
              }} 
            />
            {/* Small icon for collapsed state if we wanted, but standard Disney+ just fades out text and logo or uses a small D+ */}
            {!isHotstarExpanded && (
               <div style={{ position: 'absolute', left: '32px', color: '#FFF', fontWeight: 900, fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>
                 D<span style={{color: '#1F80E0'}}>+</span>H
               </div>
            )}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px' }}>
            {/* Profile Space */}
            <button
              onClick={onOpenProfileModal}
              style={{
                background: 'none', border: 'none', color: '#8F98B2', fontSize: '1.1rem',
                fontWeight: 600, padding: '16px 36px', textAlign: 'left',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '24px',
                whiteSpace: 'nowrap', transition: 'all 0.2s', width: '100%'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.transform = isHotstarExpanded ? 'scale(1.05) translateX(10px)' : 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#8F98B2'; e.currentTarget.style.transform = 'scale(1) translateX(0)'; }}
            >
              <User size={24} style={{ flexShrink: 0 }} />
              <span style={{ opacity: isHotstarExpanded ? 1 : 0, transition: 'opacity 0.2s 0.1s' }}>My Space</span>
            </button>

            {/* Search */}
            <button
              onClick={() => { document.querySelector('input')?.focus(); }}
              style={{
                background: 'none', border: 'none', color: searchQuery ? '#FFF' : '#8F98B2', fontSize: '1.1rem',
                fontWeight: 600, padding: '16px 36px', textAlign: 'left',
                cursor: 'text', display: 'flex', alignItems: 'center', gap: '24px',
                whiteSpace: 'nowrap', transition: 'all 0.2s', width: '100%'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.transform = isHotstarExpanded ? 'scale(1.05) translateX(10px)' : 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = searchQuery ? '#FFF' : '#8F98B2'; e.currentTarget.style.transform = 'scale(1) translateX(0)'; }}
            >
              <Search size={24} style={{ flexShrink: 0 }} />
              <div style={{ opacity: isHotstarExpanded ? 1 : 0, transition: 'opacity 0.2s 0.1s', display: 'flex', alignItems: 'center', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#FFF', outline: 'none', width: '100%', fontSize: '1rem', fontFamily: 'inherit' }}
                />
              </div>
            </button>

            {navItems.map((item) => {
              const isActive = activeTab === item.id && !searchQuery;
              const Icon = item.id === 'home' ? Home : item.id === 'series' ? Tv : item.id === 'movies' ? Film : item.id === 'mylist' ? Plus : Home;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); onSearchChange(''); }}
                  style={{
                    background: 'none', border: 'none', 
                    color: isActive ? '#FFF' : '#8F98B2', fontSize: '1.1rem',
                    fontWeight: isActive ? 700 : 500, padding: '16px 36px', textAlign: 'left',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '24px',
                    whiteSpace: 'nowrap', transition: 'all 0.2s', width: '100%'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.transform = isHotstarExpanded ? 'scale(1.05) translateX(10px)' : 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? '#FFF' : '#8F98B2'; e.currentTarget.style.transform = 'scale(1) translateX(0)'; }}
                >
                  <Icon size={24} style={{ flexShrink: 0, color: isActive ? '#FFF' : 'inherit' }} />
                  <span style={{ opacity: isHotstarExpanded ? 1 : 0, transition: 'opacity 0.2s 0.1s' }}>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Switcher Button inside Sidebar */}
          <div style={{ marginTop: 'auto', width: '280px', padding: '24px 32px' }}>
             <button
               onClick={() => setPlatform('nflix')}
               style={{ 
                 background: '#1F80E0', color: '#FFF', border: 'none', padding: '12px', 
                 width: isHotstarExpanded ? '100%' : '32px', height: '48px',
                 borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', 
                 display: 'flex', alignItems: 'center', justifyContent: isHotstarExpanded ? 'center' : 'flex-start', 
                 gap: '12px', overflow: 'hidden', transition: 'all 0.3s'
               }}
             >
               <Grip size={20} style={{ flexShrink: 0 }} />
               <span style={{ opacity: isHotstarExpanded ? 1 : 0, whiteSpace: 'nowrap' }}>Switch App</span>
             </button>
          </div>
        </aside>
      </>
    );
  }
  return (
    <header`;

navbarContent = navbarContent.replace(oldSidebarRegex, newHotstarSidebar);
fs.writeFileSync(navbarPath, navbarContent);
console.log('done hotstar update');
