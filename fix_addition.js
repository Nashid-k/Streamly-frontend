const fs = require('fs');
const path = require('path');

const pagePath = path.join('/home/edure/Desktop/nflix/frontend', 'src/app/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

pageContent = pageContent.replace(/\n\nexport function addition\(x: number, y: number\) \{ return x \+ y; \}\n/, '');
fs.writeFileSync(pagePath, pageContent);

const utilsPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/lib/utils.ts');
if (fs.existsSync(utilsPath)) {
  let utilsContent = fs.readFileSync(utilsPath, 'utf8');
  if (!utilsContent.includes('export function addition')) {
    utilsContent += '\nexport function addition(x: number, y: number) { return x + y; }\n';
    fs.writeFileSync(utilsPath, utilsContent);
  }
} else {
  fs.writeFileSync(utilsPath, 'export function addition(x: number, y: number) { return x + y; }\n');
}

console.log('done moving addition');
