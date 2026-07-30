const fs = require('fs');
const path = require('path');

const contextPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/PlatformContext.tsx');
let contextContent = fs.readFileSync(contextPath, 'utf8');

// Replace Prime URL
contextContent = contextContent.replace(
  /'https:\/\/m\.media-amazon\.com\/images\/G\/01\/digital\/video\/web\/favicon_144x144\.png'/,
  "'https://www.primevideo.com/favicon.ico'"
);

// Replace Hotstar URL
contextContent = contextContent.replace(
  /'https:\/\/secure-media\.hotstarext\.com\/web-assets\/prod\/images\/favicon\.ico'/,
  "'https://www.hotstar.com/favicon.ico'"
);

fs.writeFileSync(contextPath, contextContent);
console.log('done fixing favicon urls');
