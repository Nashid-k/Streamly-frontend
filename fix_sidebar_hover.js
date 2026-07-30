const fs = require('fs');
const path = require('path');

const cssPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/app/globals.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const newCSS = `

/* Hotstar Sidebar Button Styles */
.hotstar-sidebar-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 16px 36px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 24px;
  white-space: nowrap;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s;
  width: 100%;
  color: #8F98B2;
}

.hotstar-sidebar-btn.active {
  color: #FFF;
  font-weight: 700;
}

/* Base transform when hovered (always scale up) */
.hotstar-sidebar-btn:hover {
  color: #FFF;
  transform: scale(1.1);
}

/* But when the sidebar wrapper is expanded (meaning parent has width > 96px, or we can use a class) */
/* Wait, we can toggle a class on the wrapper! */
`;

cssContent += newCSS;
fs.writeFileSync(cssPath, cssContent);

// Wait, the transform needs to be different if the sidebar is expanded: `isHotstarExpanded ? 'scale(1.05) translateX(10px)' : 'scale(1.1)'`
// Instead of writing complex CSS, what if we just use a class on the `aside` itself?
// `<aside className={isHotstarExpanded ? 'hotstar-sidebar expanded' : 'hotstar-sidebar'}>`
const newCSS2 = `
.hotstar-sidebar .hotstar-sidebar-btn:hover {
  transform: scale(1.1);
}
.hotstar-sidebar.expanded .hotstar-sidebar-btn:hover {
  transform: scale(1.05) translateX(10px);
}
`;
fs.appendFileSync(cssPath, newCSS2);

const navbarPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

// Add class to aside
navbarContent = navbarContent.replace(
  /<aside\s+style=\{\{/g,
  `<aside className={isHotstarExpanded ? 'hotstar-sidebar expanded' : 'hotstar-sidebar'} style={{`
);

// Replace profile button inline styles
navbarContent = navbarContent.replace(
  /onClick=\{onOpenProfileModal\}[\s\S]*?onMouseLeave=\{[\s\S]*?\}/g,
  `onClick={onOpenProfileModal}
              className="hotstar-sidebar-btn"`
);

// Replace search button inline styles
navbarContent = navbarContent.replace(
  /onClick=\{[\s\S]*?querySelector\('input'\)\?\.focus\(\); \}\}[\s\S]*?onMouseLeave=\{[\s\S]*?\}/g,
  `onClick={() => { document.querySelector('input')?.focus(); }}
              className={\`hotstar-sidebar-btn \${searchQuery ? 'active' : ''}\`}`
);

// Replace map items inline styles
navbarContent = navbarContent.replace(
  /onClick=\{[\s\S]*?setActiveTab\(item\.id\); onSearchChange\(''\); \}\}[\s\S]*?onMouseLeave=\{[\s\S]*?\}/g,
  `onClick={() => { setActiveTab(item.id); onSearchChange(''); }}
                  className={\`hotstar-sidebar-btn \${isActive ? 'active' : ''}\`}`
);

fs.writeFileSync(navbarPath, navbarContent);
console.log('done fixing sidebar hover');
