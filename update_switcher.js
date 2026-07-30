const fs = require('fs');
const path = require('path');

const navbarPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

// Find the "Switch App" button inside the Hotstar sidebar.
const oldSwitcherMatch = /{[\s\S]*?\/\* Switcher Button inside Sidebar \*\/[\s\S]*?<div style=\{\{ marginTop: 'auto', width: '280px', padding: '24px 32px' \}\}>[\s\S]*?<button[\s\S]*?onClick=\{[\s\S]*?\}[\s\S]*?>[\s\S]*?<\/button>[\s\S]*?<\/div>/;

const newSwitcher = `{/* Switcher Button inside Sidebar */}
          <div style={{ marginTop: 'auto', width: '280px', padding: '24px 32px', position: 'relative' }}>
             {showAppSwitcher && (
               <div style={{ position: 'absolute', bottom: '80px', left: '32px', background: '#16181F', borderRadius: '8px', padding: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px', boxShadow: '0 8px 24px rgba(0,0,0,0.8)' }}>
                 <button
                   onClick={() => { setPlatform('nflix'); setShowAppSwitcher(false); }}
                   style={{ background: 'transparent', border: 'none', padding: '12px', color: '#FFF', textAlign: 'left', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
                   onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                   onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                 >
                   <span style={{ color: '#E50914', fontWeight: 900, fontFamily: 'Arial, sans-serif' }}>NETFLIX</span>
                 </button>
                 <button
                   onClick={() => { setPlatform('nprime'); setShowAppSwitcher(false); }}
                   style={{ background: 'transparent', border: 'none', padding: '12px', color: '#FFF', textAlign: 'left', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
                   onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                   onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                 >
                   <span style={{ color: '#00A8E1', fontWeight: 700 }}>prime video</span>
                 </button>
               </div>
             )}
             <button
               onClick={() => setShowAppSwitcher(!showAppSwitcher)}
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
          </div>`;

navbarContent = navbarContent.replace(oldSwitcherMatch, newSwitcher);

fs.writeFileSync(navbarPath, navbarContent);
console.log('done switcher update');
