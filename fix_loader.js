const fs = require('fs');
const path = require('path');

const pagePath = path.join('/home/edure/Desktop/nflix/frontend', 'src/app/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// 1. Add `hasCompletedInitialLoad` state and effect.
// We can insert it right after `const [isHeroReady, setIsHeroReady] = useState(false);`
const heroReadyRegex = /const \[isHeroReady, setIsHeroReady\] = useState\(false\);/;
const heroReadyReplacement = `const [isHeroReady, setIsHeroReady] = useState(false);
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false);

  useEffect(() => {
    if (!isLoadingPage) {
      if (searchQuery.trim() !== '' || activeTab === 'mylist' || isHeroReady) {
        setHasCompletedInitialLoad(true);
      }
    }
  }, [isLoadingPage, searchQuery, activeTab, isHeroReady]);`;

if (!pageContent.includes('hasCompletedInitialLoad')) {
  pageContent = pageContent.replace(heroReadyRegex, heroReadyReplacement);
}

// 2. Replace the loader overlay condition
// Currently it is: `{(isLoadingPage || (searchQuery.trim() === '' && activeTab !== 'mylist' && !isHeroReady)) && (`
const oldLoaderRegex = /\{\(isLoadingPage \|\| \(searchQuery\.trim\(\) === '' && activeTab !== 'mylist' && !isHeroReady\)\) && \(/g;
const newLoaderCond = `{!hasCompletedInitialLoad && (`

pageContent = pageContent.replace(oldLoaderRegex, newLoaderCond);

// 3. Replace the opacity condition for main content wrapper
// Currently: `<div style={{ opacity: (isLoadingPage || (searchQuery.trim() === '' && activeTab !== 'mylist' && !isHeroReady)) ? 0 : 1, transition: 'opacity 0.3s' }}>`
const oldOpacityRegex = /<div style=\{\{ opacity: \(isLoadingPage \|\| \(searchQuery\.trim\(\) === '' && activeTab !== 'mylist' && !isHeroReady\)\) \? 0 : 1, transition: 'opacity 0\.3s' \}\}>/g;
const newOpacityCond = `<div style={{ opacity: hasCompletedInitialLoad ? 1 : 0, transition: 'opacity 0.3s' }}>`;

pageContent = pageContent.replace(oldOpacityRegex, newOpacityCond);

fs.writeFileSync(pagePath, pageContent);
console.log('done fixing loader');
