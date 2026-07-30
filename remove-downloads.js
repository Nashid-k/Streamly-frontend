const fs = require('fs');
const path = './src/components/MovieDetailModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove DownloadAction definition
content = content.replace(/const DownloadAction = \([^]+?^};/m, '');

// Remove all <DownloadAction ... /> occurrences
// Using regex to match <DownloadAction and everything until />
content = content.replace(/<DownloadAction[^>]*\/>/g, '');

// Remove any remaining DownloadAction references if they exist
// content = content.replace(/DownloadAction/g, '');

// Clean up empty lines created by removals
content = content.replace(/^\s*[\r\n]/gm, '\n');

fs.writeFileSync(path, content);
console.log('Removed DownloadAction references');
