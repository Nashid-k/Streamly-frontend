const fs = require('fs');
const path = require('path');

const navbarPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

// The early return is at the beginning of the component: `if (platform === 'hotstar') { ... } return ( <header...`
// Let's just find everything after `return (\n    <header` and remove `|| platform === 'hotstar'`
const parts = navbarContent.split('return (\n    <header');
if (parts.length === 2) {
  let rest = parts[1];
  
  // 1. Remove ` || platform === 'hotstar'`
  rest = rest.replace(/ \|\| platform === 'hotstar'/g, "");
  
  // 2. Remove `platform === 'hotstar' ? '...' : ` or similar logic.
  // We can just cast `platform as string` to satisfy TS for the ones we need to keep,
  // or simply replace the comparisons. Actually, `platform` will only be 'nflix' or 'nprime' here.
  rest = rest.replace(/platform === 'hotstar' \? '[^']*' : /g, "");
  rest = rest.replace(/platform === 'hotstar' \? `[^`]*` : /g, "");
  
  // Specific fix for avatar url: `platform === 'hotstar' ? '...' : platform === 'nprime' ? '...' : '...'`
  // We can just remove the hotstar part.
  rest = rest.replace(/platform === 'hotstar' \? 'https:\/\/img1\.hotstarext\.com\/image\/upload\/w_200,h_200,c_fill\/feature\/profile\/36\.png' : /g, "");
  
  // For the switcher button of hotstar:
  /*
                onMouseLeave={(e) => (e.currentTarget.style.background = platform === 'hotstar' ? 'rgba(255,255,255,0.1)' : 'transparent')}
                style={{
                  background: platform === 'hotstar' ? 'rgba(255,255,255,0.1)' : 'transparent',
  */
  // since `platform` can never be `hotstar` here, it is always `transparent`.
  // So we just replace `platform === 'hotstar' ? 'rgba(255,255,255,0.1)' : 'transparent'` with `'transparent'`
  rest = rest.replace(/platform === 'hotstar' \? 'rgba\(255,255,255,0\.1\)' : 'transparent'/g, "'transparent'");
  
  navbarContent = parts[0] + 'return (\n    <header' + rest;
  fs.writeFileSync(navbarPath, navbarContent);
  console.log("Navbar fixed");
} else {
  console.log("Could not find header split point");
}
