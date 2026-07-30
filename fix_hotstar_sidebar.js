const fs = require('fs');
const path = require('path');

const navbarPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

// Update Hotstar sidebar expanded gradient
navbarContent = navbarContent.replace(
  /background: isHotstarExpanded \? '#0F1014' : 'linear-gradient\(to right, rgba\(15,16,20,0\.9\) 0%, transparent 100%\)',/,
  "background: isHotstarExpanded ? 'linear-gradient(to right, #0F1014 65%, rgba(15,16,20,0) 100%)' : 'linear-gradient(to right, rgba(15,16,20,0.95) 0%, transparent 100%)',"
);

// Update padding on switcher wrapper to align 9-dot menu
navbarContent = navbarContent.replace(
  /<div style=\{\{ marginTop: 'auto', width: '280px', padding: '24px 32px', position: 'relative' \}\}>/,
  "<div style={{ marginTop: 'auto', width: '280px', paddingBottom: '24px', position: 'relative' }}>"
);

fs.writeFileSync(navbarPath, navbarContent);
console.log('done fixing hotstar sidebar padding and gradient');
