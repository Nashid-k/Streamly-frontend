const fs = require('fs');
const path = require('path');

function replaceFile(filename, replacements) {
  const filePath = path.join('/home/edure/Desktop/nflix/frontend', filename);
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }
  fs.writeFileSync(filePath, content);
}

// 1. Navbar.tsx
replaceFile('src/components/Navbar.tsx', [
  // Fix the previously added "(platform === 'nprime' || platform === 'hotstar')" if we ever did it.
  // Wait, I haven't done it yet in Navbar.tsx (except manual edit for switcher).
  [/platform === 'nprime'/g, "(platform === 'nprime' || platform === 'hotstar')"],
  // Revert specific ones:
  // Logo logic in Navbar.tsx
  [/\(platform === 'nprime' \|\| platform === 'hotstar'\) \? \(\n            <span style=\{\{ display: 'flex', alignItems: 'center', gap: '4px' \}\}>\n              <span style=\{\{ fontSize: '1.4rem', fontWeight: 900, color: 'var\(--text-color\)', letterSpacing: '-0.02em' \}\}>\n                prime/g, 
  "platform === 'hotstar' ? (\n            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>\n              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFF', letterSpacing: '-0.02em' }}>\n                Disney+\n              </span>\n              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1F80E0', letterSpacing: '-0.02em' }}>\n                Hotstar\n              </span>\n            </span>\n          ) : platform === 'nprime' ? (\n            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>\n              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-color)', letterSpacing: '-0.02em' }}>\n                prime"],
  // Navbar.tsx avatar url
  [/\(platform === 'nprime' \|\| platform === 'hotstar'\) \? 'https:\/\/m.media-amazon.com\/images\/G\/01\/digital\/video\/web\/v2\/default_avatar._CB1582236592_.png'/g, 
  "platform === 'hotstar' ? 'https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/feature/profile/36.png' : platform === 'nprime' ? 'https://m.media-amazon.com/images/G/01/digital/video/web/v2/default_avatar._CB1582236592_.png'"],
  // In the switcher, I already added Hotstar, so I should make sure my previous edit wasn't broken
  [/platform === '\(platform === 'nprime' \|\| platform === 'hotstar'\)'/g, "platform === 'nprime'"] // Just in case
]);

// 2. HeroBanner.tsx
replaceFile('src/components/HeroBanner.tsx', [
  [/platform === 'nprime'/g, "(platform === 'nprime' || platform === 'hotstar')"],
  // "COMING SOON TO PRIME"
  [/COMING SOON TO \{\(platform === 'nprime' \|\| platform === 'hotstar'\) \? 'PRIME' : 'NETFLIX'\}/g, 
  "COMING SOON TO {platform === 'hotstar' ? 'HOTSTAR' : platform === 'nprime' ? 'PRIME' : 'NETFLIX'}"],
  // color: platform === 'nprime' ? '#00A8E1' : '#46d369'
  [/color: \(platform === 'nprime' \|\| platform === 'hotstar'\) \? '#00A8E1' : '#46d369'/g,
  "color: platform === 'hotstar' ? '#1F80E0' : platform === 'nprime' ? '#00A8E1' : '#46d369'"]
]);

// 3. MovieCard.tsx
replaceFile('src/components/MovieCard.tsx', [
  [/platform === 'nprime'/g, "(platform === 'nprime' || platform === 'hotstar')"],
  [/color: \(platform === 'nprime' \|\| platform === 'hotstar'\) \? '#00A8E1' : '#46d369'/g,
  "color: platform === 'hotstar' ? '#1F80E0' : platform === 'nprime' ? '#00A8E1' : '#46d369'"]
]);

// 4. VideoPlayerModal.tsx
replaceFile('src/components/VideoPlayerModal.tsx', [
  [/platform === 'nprime'/g, "(platform === 'nprime' || platform === 'hotstar')"],
  [/\{\(platform === 'nprime' \|\| platform === 'hotstar'\) \? 'P' : 'N'\}/g, 
  "{platform === 'hotstar' ? 'H' : platform === 'nprime' ? 'P' : 'N'}"]
]);

// 5. ProfileModal.tsx
replaceFile('src/components/ProfileModal.tsx', [
  [/platform === 'nprime'/g, "(platform === 'nprime' || platform === 'hotstar')"],
  [/\(platform === 'nprime' \|\| platform === 'hotstar'\) \? 'https:\/\/m.media-amazon.com\/images\/G\/01\/digital\/video\/web\/v2\/default_avatar._CB1582236592_.png'/g, 
  "platform === 'hotstar' ? 'https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/feature/profile/36.png' : platform === 'nprime' ? 'https://m.media-amazon.com/images/G/01/digital/video/web/v2/default_avatar._CB1582236592_.png'"]
]);

console.log('done replacing');
