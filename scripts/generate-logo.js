const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const icoPath = path.join(process.cwd(), 'src/app/favicon.ico');
const pngPath = path.join(process.cwd(), 'public/logo.png');

console.log('[Logo Build] Checking for logo source:', icoPath);

if (!fs.existsSync(icoPath)) {
  console.error('[Logo Build] Error: src/app/favicon.ico not found!');
  process.exit(1);
}

// Ensure public directory exists
const publicDir = path.dirname(pngPath);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

sharp(icoPath)
  .resize(128, 128)
  .png()
  .toFile(pngPath)
  .then(() => {
    console.log('[Logo Build] Successfully generated public/logo.png from favicon.ico!');
  })
  .catch(err => {
    console.error('[Logo Build] Error converting logo:', err);
    process.exit(1);
  });
