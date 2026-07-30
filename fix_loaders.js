const fs = require('fs');
const path = require('path');

const cssPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/app/globals.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const loaderCss = `
/* Authentic Platform Loaders */
[data-theme="nprime"] .netflix-spinner {
  border: 4px solid rgba(0, 168, 225, 0.15) !important;
  border-top: 4px solid #00A8E1 !important;
  box-shadow: none !important;
  animation: netflixSpin 0.9s linear infinite !important;
}

[data-theme="hotstar"] .netflix-spinner {
  border: 4px solid rgba(31, 128, 224, 0.15) !important;
  border-top: 4px solid #1F80E0 !important;
  border-right: 4px solid transparent !important;
  border-bottom: 4px solid transparent !important;
  border-left: 4px solid transparent !important;
  box-shadow: 0 0 12px rgba(31, 128, 224, 0.6) !important;
  animation: netflixSpin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite !important;
}
`;

if (!cssContent.includes('[data-theme="nprime"] .netflix-spinner')) {
  cssContent = cssContent.replace(
    /\.netflix-spinner-sm \{/,
    loaderCss + '\n.netflix-spinner-sm {'
  );
  fs.writeFileSync(cssPath, cssContent);
  console.log('done fixing loaders');
}
