const fs = require('fs');
const path = require('path');

const cssPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/app/globals.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('.catalog-row:hover')) {
  cssContent += `
/* Fix Row Stacking Context for Expanding Hover Cards */
.catalog-row {
  position: relative;
  z-index: 1;
}

.catalog-row:hover {
  z-index: 50 !important;
}
`;
  fs.writeFileSync(cssPath, cssContent);
  console.log('done fixing catalog row z-index');
} else {
  console.log('already exists');
}
