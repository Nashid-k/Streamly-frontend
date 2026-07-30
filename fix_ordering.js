const fs = require('fs');
const path = require('path');

const pagePath = path.join('/home/edure/Desktop/nflix/frontend', 'src/app/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// 1. Remove the misplaced block
const badBlock = `  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false);

  useEffect(() => {
    if (!isLoadingPage) {
      if (searchQuery.trim() !== '' || activeTab === 'mylist' || isHeroReady) {
        setHasCompletedInitialLoad(true);
      }
    }
  }, [isLoadingPage, searchQuery, activeTab, isHeroReady]);`;

pageContent = pageContent.replace(badBlock, '');

// 2. Insert it after `const [isLoadingPage, setIsLoadingPage] = useState(true);`
const loadingPageRegex = /const \[isLoadingPage, setIsLoadingPage\] = useState\(true\);/;
pageContent = pageContent.replace(loadingPageRegex, `const [isLoadingPage, setIsLoadingPage] = useState(true);\n\n${badBlock}`);

fs.writeFileSync(pagePath, pageContent);
console.log('fixed ordering');
