const fs = require('fs');
const path = require('path');

const heroPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/HeroBanner.tsx');
let heroContent = fs.readFileSync(heroPath, 'utf8');

heroContent = heroContent.replace(/className="hero-backdrop-animate"/g, '');
heroContent = heroContent.replace(/className="hero-text-animate"/g, '');

fs.writeFileSync(heroPath, heroContent);
console.log('done removing hero animations');
