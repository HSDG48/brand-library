// Favicons, app icons, webmanifest and social avatars for the HS Digital family.
// Sub-brands: Navy mark on their accent tile (tells the four sites apart in a row of tabs).
// Parent: full-colour mark on a white tile. Run: node scripts/icons-hs.mjs [slug ...]
import fs from 'node:fs';
import path from 'node:path';
import { toPng } from './lib/svg.mjs';
import { ico } from './lib/ico.mjs';
import { FAMILY, loadHs, appIcon } from './lib/hs.mjs';

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : FAMILY;

for (const slug of slugs) {
  const { brand: B, dir, K, isParent } = loadHs(slug);
  const out = (sub, name, data) => {
    fs.mkdirSync(path.join(dir, sub), { recursive: true });
    fs.writeFileSync(path.join(dir, sub, name), data);
  };
  // Icon colours: tile + mark halves.
  const tile = isParent ? { bg: K.white, top: K.navy, bottom: K.blue } : { bg: K.accent, top: K.navy };
  const theme = isParent ? K.navy : K.accent;

  // Browser tab: rounded tile; at 16 px the mark grows so the H cut stays open.
  const fav = appIcon(64, { ...tile, scale: 0.72, radius: 0.22 });
  const fav16 = appIcon(64, { ...tile, scale: 0.84, radius: 0.16 });
  out('icons', 'favicon.svg', fav);
  out('icons', 'favicon.ico', ico([16, 32, 48].map((size) => ({ size, data: toPng(size === 16 ? fav16 : fav, size) }))));
  out('icons', 'favicon-16.png', toPng(fav16, 16));
  out('icons', 'favicon-32.png', toPng(fav, 32));
  // The plain mark (transparent), as used on the live sites today.
  out('icons', 'favicon-mark.svg', appIcon(64, { top: K.navy, bottom: K.blue, scale: 0.94 }));
  // iOS / Android round the corners themselves: square tiles.
  out('icons', 'apple-touch-icon.png', toPng(appIcon(180, { ...tile, radius: 0, scale: 0.6 }), 180));
  out('icons', 'icon-192.png', toPng(appIcon(192, { ...tile, radius: 0, scale: 0.6 }), 192));
  out('icons', 'icon-512.png', toPng(appIcon(512, { ...tile, radius: 0, scale: 0.6 }), 512));
  out('icons', 'icon-maskable-512.png', toPng(appIcon(512, { ...tile, radius: 0, scale: 0.46 }), 512));

  out('icons', 'site.webmanifest', JSON.stringify({
    name: B.name, short_name: B.name,
    icons: [
      { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    theme_color: theme, background_color: K.white, display: 'standalone',
  }, null, 2) + '\n');

  out('icons', 'head-snippet.html', `<!-- ${B.domains.join(' · ')}: paste into <head>, with the icon files at the site root -->
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${theme}">
`);

  // Avatars: square, mark inside the central circle so round crops never cut it.
  const avatars = isParent
    ? { 'avatar-navy': { bg: K.navy, top: K.white }, 'avatar-light': { bg: K.white, top: K.navy, bottom: K.blue }, 'avatar-blue': { bg: K.blue, top: K.white } }
    : { 'avatar-accent': { bg: K.accent, top: K.navy }, 'avatar-navy': { bg: K.navy, top: K.white }, 'avatar-light': { bg: K.white, top: K.navy, bottom: K.blue } };
  for (const [name, o] of Object.entries(avatars)) {
    const svg = appIcon(1024, { ...o, radius: 0, scale: 0.52 });
    out('social', `${name}.svg`, svg);
    out('social', `${name}-1024.png`, toPng(svg, 1024));
    out('social', `${name}-400.png`, toPng(svg, 400));
  }
  console.log(`${slug}: icons + avatars`);
}
