const fs = require('fs');
const path = require('path');

const rowPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/MovieRow.tsx');
let rowContent = fs.readFileSync(rowPath, 'utf8');

// Replace the style block inside catalog-row-track
const styleRegex = /style=\{\{\s*display:\s*'flex',\s*alignItems:\s*'center',[\s\S]*?scrollBehavior:\s*'smooth',\s*\}\}/;

const newStyle = `style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            overflowX: 'auto',
            padding: platform === 'nflix' 
                ? '40px 20px 180px 20px' // huge bottom padding for Netflix dropdown
                : '30px 20px 30px 20px',
            marginTop: platform === 'nflix' ? '-30px' : '-20px',
            marginBottom: platform === 'nflix' ? '-170px' : '-20px',
            scrollBehavior: 'smooth',
          }}`;

rowContent = rowContent.replace(styleRegex, newStyle);

fs.writeFileSync(rowPath, rowContent);
console.log('done fixing movie row clipping');
