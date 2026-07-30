const fs = require('fs');
const path = require('path');

const navbarPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

navbarContent = navbarContent.replace(
  /<button\s*onClick=\{\(\) => setShowAppSwitcher\(!showAppSwitcher\)\}\s*style=\{\{\s*background: '#1F80E0'[\s\S]*?<\/button>/,
  `<button
               onClick={() => setShowAppSwitcher(!showAppSwitcher)}
               className="hotstar-sidebar-btn"
               style={{ color: showAppSwitcher ? '#FFF' : 'inherit' }}
             >
               <Grip size={24} style={{ flexShrink: 0, color: showAppSwitcher ? '#FFF' : 'inherit' }} />
               <span style={{ opacity: isHotstarExpanded ? 1 : 0, transition: 'opacity 0.2s 0.1s' }}>Switch App</span>
             </button>`
);

fs.writeFileSync(navbarPath, navbarContent);

const pagePath = path.join('/home/edure/Desktop/nflix/frontend', 'src/app/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');
if (!pageContent.includes('export function addition(x, y)')) {
  pageContent += '\n\nexport function addition(x: number, y: number) { return x + y; }\n';
  fs.writeFileSync(pagePath, pageContent);
}

console.log('done fixing navbar switcher and adding addition');
