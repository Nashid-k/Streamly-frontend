const fs = require('fs');
const path = require('path');

const rowPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/MovieRow.tsx');
let rowContent = fs.readFileSync(rowPath, 'utf8');

// 1. Add useState and useEffect to imports
rowContent = rowContent.replace(
  /import React, \{ useRef \} from 'react';/,
  "import React, { useRef, useState, useEffect } from 'react';"
);

// 2. Add state and scroll listener
const hookBlock = `
  const { platform } = usePlatform();
  const rowRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setIsAtStart(scrollLeft <= 5);
      setIsAtEnd(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [movies]);
`;

rowContent = rowContent.replace(
  /const \{ platform \} = usePlatform\(\);\s+const rowRef = useRef<HTMLDivElement>\(null\);/,
  hookBlock
);

// Add onScroll to the track
rowContent = rowContent.replace(
  /className="catalog-row-track hide-scrollbar"\s+ref=\{rowRef\}/,
  'className="catalog-row-track hide-scrollbar"\n          ref={rowRef}\n          onScroll={checkScroll}'
);

// Conditionally render left button
rowContent = rowContent.replace(
  /\{\/\* Left Arrow Button \*\/\}\s+<button/,
  '{/* Left Arrow Button */}\n        {!isAtStart && (\n        <button'
);

rowContent = rowContent.replace(
  /<ChevronLeft size=\{26\} \/>\s+<\/button>/,
  '<ChevronLeft size={26} />\n        </button>\n        )}'
);

// Conditionally render right button
rowContent = rowContent.replace(
  /\{\/\* Right Arrow Button \*\/\}\s+<button/,
  '{/* Right Arrow Button */}\n        {!isAtEnd && (\n        <button'
);

rowContent = rowContent.replace(
  /<ChevronRight size=\{26\} \/>\s+<\/button>/,
  '<ChevronRight size={26} />\n        </button>\n        )}'
);

fs.writeFileSync(rowPath, rowContent);
console.log('done fixing scroll buttons');
