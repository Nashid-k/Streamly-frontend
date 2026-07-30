const fs = require('fs');
const path = require('path');

const pagePath = path.join('/home/edure/Desktop/nflix/frontend', 'src/app/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Find the section starting at `{/* Main Page Content Router */}`
// and ending just before `{/* Video Player Modal */}` or `</main>`
// Wait, I can just replace the specific block.
// Currently it is:
/*
      {/* Main Page Content Router * /}
      {isLoadingPage ? (
        <div className="netflix-spinner-wrapper" style={{ minHeight: '80vh' }}>
          <div className="netflix-spinner" />
          <p style={{ color: '#AAA', marginTop: '16px', fontSize: '0.9rem', fontWeight: 600 }}>
            {isSwitching 
              ? (platform === 'nprime' ? 'Switching to Prime Video…' : 'Switching to Netflix…') 
              : (platform === 'nprime' ? 'Loading Prime Video Catalog…' : 'Loading Netflix Catalog…')}
          </p>
        </div>
      ) : searchQuery.trim() !== '' ? (
*/

const oldRouterRegex = /\{\/\* Main Page Content Router \*\/\}\n\s*\{isLoadingPage \? \([\s\S]*?\) : searchQuery\.trim\(\) !== '' \? \(/;

const newRouterCode = `{/* Overlay Full-Page Loader */}
      {(isLoadingPage || (searchQuery.trim() === '' && activeTab !== 'mylist' && !isHeroReady)) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--bg-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="netflix-spinner" />
          <p style={{ color: '#AAA', marginTop: '16px', fontSize: '0.9rem', fontWeight: 600 }}>
            {isSwitching 
              ? (platform === 'hotstar' ? 'Switching to Disney+ Hotstar…' : platform === 'nprime' ? 'Switching to Prime Video…' : 'Switching to Netflix…') 
              : (platform === 'hotstar' ? 'Loading Disney+ Hotstar…' : platform === 'nprime' ? 'Loading Prime Video Catalog…' : 'Loading Netflix Catalog…')}
          </p>
        </div>
      )}

      {/* Main Page Content Router */}
      <div style={{ opacity: (isLoadingPage || (searchQuery.trim() === '' && activeTab !== 'mylist' && !isHeroReady)) ? 0 : 1, transition: 'opacity 0.3s' }}>
      {searchQuery.trim() !== '' ? (`;

pageContent = pageContent.replace(oldRouterRegex, newRouterCode);

// There's a `)` at the very bottom that matches `) : (` which we turned into `{searchQuery.trim() !== '' ? (`
// So the structure was: 
// {isLoadingPage ? (...) : searchQuery !== '' ? (...) : ( ... )}
// We replaced `{isLoadingPage ? (...) : searchQuery !== '' ? (` with 
// `{searchQuery !== '' ? (`
// The end of this ternary is `)}` which matches the `searchQuery !== '' ? (...) : (...)`
// But we wrapped it in a `<div style={{opacity:...}}>`!
// We need to close this `</div>` right before the first Modal component or at the end of the main content.
// The main content ends right before `{/* Video Player Modal */}`

pageContent = pageContent.replace(/\{\/\* Video Player Modal \*\/\}/, `</div>\n\n      {/* Video Player Modal */}`);

// We should also check the `HeroBanner.tsx` to make sure `onHeroReady` gets called reliably, even if `enrichedMovie` is null (e.g. if the API fails) to prevent indefinite loading.
fs.writeFileSync(pagePath, pageContent);

const heroPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/HeroBanner.tsx');
let heroContent = fs.readFileSync(heroPath, 'utf8');

// Inside HeroBanner.tsx, if fetching fails or movie is null, it should still call `onHeroReady`.
heroContent = heroContent.replace(/if \(!movie\) return;/g, "if (!movie) { if (onHeroReady) onHeroReady(); return; }");

// And what if the image preload fails? It has `img.onerror = resolve`, so it resolves.
// It calls `setEnrichedMovie(finalMovie); if (onHeroReady) onHeroReady();`
// If `HeroBanner` renders nothing because `!enrichedMovie`, `onHeroReady` was still called, so the loader will drop.
fs.writeFileSync(heroPath, heroContent);

console.log('done loader update');
