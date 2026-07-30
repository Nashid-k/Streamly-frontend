const fs = require('fs');
const path = require('path');

const contextPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/PlatformContext.tsx');
let contextContent = fs.readFileSync(contextPath, 'utf8');

const setFaviconFunc = `
const setFavicon = (platform: Platform) => {
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  if (platform === 'nprime') {
    link.href = 'https://m.media-amazon.com/images/G/01/digital/video/web/favicon_144x144.png';
  } else if (platform === 'hotstar') {
    link.href = 'https://secure-media.hotstarext.com/web-assets/prod/images/favicon.ico';
  } else {
    link.href = 'https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.ico';
  }
};
`;

// Insert the function above PlatformProvider
contextContent = contextContent.replace(
  /export const PlatformProvider/,
  `${setFaviconFunc}\nexport const PlatformProvider`
);

// Call it in the useEffect
contextContent = contextContent.replace(
  /document\.title = 'Prime Video — Movie & TV Discovery';/,
  "document.title = 'Prime Video — Movie & TV Discovery';\n        setFavicon('nprime');"
);
contextContent = contextContent.replace(
  /document\.title = 'Disney\+ Hotstar — Movie & TV Discovery';/,
  "document.title = 'Disney+ Hotstar — Movie & TV Discovery';\n        setFavicon('hotstar');"
);
contextContent = contextContent.replace(
  /document\.documentElement\.setAttribute\('data-theme', 'nflix'\);\s*document\.title = 'Netflix — Movie & TV Discovery';/,
  "document.documentElement.setAttribute('data-theme', 'nflix');\n        document.title = 'Netflix — Movie & TV Discovery';\n        setFavicon('nflix');"
);
contextContent = contextContent.replace(
  /\} else \{\s*document\.title = 'Netflix — Movie & TV Discovery';\s*\}/,
  "} else {\n      document.title = 'Netflix — Movie & TV Discovery';\n      setFavicon('nflix');\n    }"
);

fs.writeFileSync(contextPath, contextContent);
console.log('done updating favicon in context');
