const fs = require('fs');
const path = require('path');

// Fix page.tsx to not hang loader if featuredMovie is null
const pagePath = path.join('/home/edure/Desktop/nflix/frontend', 'src/app/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// The effect currently looks like:
//   useEffect(() => {
//     if (!isLoadingPage) {
//       if (searchQuery.trim() !== '' || activeTab === 'mylist' || isHeroReady) {
//         setHasCompletedInitialLoad(true);
//       }
//     }
//   }, [isLoadingPage, searchQuery, activeTab, isHeroReady]);

pageContent = pageContent.replace(
  /if \(searchQuery\.trim\(\) !== '' \|\| activeTab === 'mylist' \|\| isHeroReady\) \{/,
  "if (searchQuery.trim() !== '' || activeTab === 'mylist' || isHeroReady || !featuredMovie) {"
);
pageContent = pageContent.replace(
  /}, \[isLoadingPage, searchQuery, activeTab, isHeroReady\]\);/,
  "}, [isLoadingPage, searchQuery, activeTab, isHeroReady, featuredMovie]);"
);
fs.writeFileSync(pagePath, pageContent);

// Fix backend movies.service.ts TMDB Provider ID for Hotstar
const servicePath = path.join('/home/edure/Desktop/nflix/backend/src/movies/movies.service.ts');
let serviceContent = fs.readFileSync(servicePath, 'utf8');

serviceContent = serviceContent.replace(
  /const providerId = this\.activePlatform === 'hotstar' \? '122' : \(this\.activePlatform === 'nprime' \? '9\|119\|10' : '8'\);/,
  "const providerId = this.activePlatform === 'hotstar' ? '2336|337|122' : (this.activePlatform === 'nprime' ? '9|119|10' : '8');"
);

serviceContent = serviceContent.replace(
  /\$\{this\.activePlatform === 'hotstar' \? '122' : \(this\.activePlatform === 'nprime' \? '9\|119\|10' : '8'\)\}/g,
  "${this.activePlatform === 'hotstar' ? '2336|337|122' : (this.activePlatform === 'nprime' ? '9|119|10' : '8')}"
);

fs.writeFileSync(servicePath, serviceContent);
console.log('done fixing hotstar provider and loader');
