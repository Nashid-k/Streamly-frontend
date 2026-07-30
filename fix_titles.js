const fs = require('fs');
const path = require('path');

const contextPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/PlatformContext.tsx');
let contextContent = fs.readFileSync(contextPath, 'utf8');

contextContent = contextContent.replace(/document\.title = 'Prime Video — Movie & TV Discovery';/g, "document.title = 'Prime Video';");
contextContent = contextContent.replace(/document\.title = 'Disney\+ Hotstar — Movie & TV Discovery';/g, "document.title = 'Disney+ Hotstar';");
contextContent = contextContent.replace(/document\.title = 'Netflix — Movie & TV Discovery';/g, "document.title = 'Netflix';");

fs.writeFileSync(contextPath, contextContent);
console.log('done fixing titles');
