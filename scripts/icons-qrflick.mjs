// Favicons, app icons, webmanifest and social avatars for QRflick.
// Run: node scripts/icons-qrflick.mjs   (from brand-library/)
import fs from 'node:fs';
import path from 'node:path';
import { toPng } from './lib/svg.mjs';
import { ico } from './lib/ico.mjs';
import { BRAND_DIR as BRAND, appIcon } from './lib/qrflick.mjs';

const brand = JSON.parse(fs.readFileSync(path.join(BRAND, 'brand.json'), 'utf8'));
const hex = (n) => brand.colors.find((c) => c.name === n).hex;
const TEAL = hex('Teal'), GLOW = hex('Teal Glow'), NIGHT = hex('Night'), PAPER = hex('Paper'), WHITE = '#FFFFFF';

const out = (dir, name, data) => {
  fs.mkdirSync(path.join(BRAND, dir), { recursive: true });
  fs.writeFileSync(path.join(BRAND, dir, name), data);
};

// Favicons: the supplied app icon (white mark on a rounded Teal tile) reads on light and dark tabs.
// At 16 px the mark gets a little bigger so the module and strokes don't blur together.
const fav = appIcon(64, { bg: TEAL, colour: WHITE, scale: 0.7 });
out('icons', 'favicon.svg', fav);
out('icons', 'favicon.ico', ico([16, 32, 48].map((size) => ({ size, data: toPng(size === 16 ? appIcon(64, { bg: TEAL, colour: WHITE, scale: 0.78, radius: 0.18 }) : fav, size) }))));
out('icons', 'favicon-32.png', toPng(fav, 32));
out('icons', 'favicon-16.png', toPng(appIcon(64, { bg: TEAL, colour: WHITE, scale: 0.78, radius: 0.18 }), 16));
// iOS and Android round the corners themselves, so square tiles.
out('icons', 'apple-touch-icon.png', toPng(appIcon(180, { bg: TEAL, colour: WHITE, radius: 0, scale: 0.6 }), 180));
out('icons', 'icon-192.png', toPng(appIcon(192, { bg: TEAL, colour: WHITE, radius: 0, scale: 0.6 }), 192));
out('icons', 'icon-512.png', toPng(appIcon(512, { bg: TEAL, colour: WHITE, radius: 0, scale: 0.6 }), 512));
// Maskable: Android may crop to a circle, keep the mark inside the central 60%.
out('icons', 'icon-maskable-512.png', toPng(appIcon(512, { bg: TEAL, colour: WHITE, radius: 0, scale: 0.46 }), 512));

out('icons', 'site.webmanifest', JSON.stringify({
  name: brand.name,
  short_name: brand.name,
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
  theme_color: TEAL,
  background_color: WHITE,
  display: 'standalone',
}, null, 2) + '\n');

out('icons', 'head-snippet.html', `<!-- Paste into <head>, with the icon files at the site root -->
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${TEAL}">
`);

// Social avatars: square, mark kept inside the central circle so round crops never cut it.
for (const [name, opts] of Object.entries({
  'avatar-teal': { bg: TEAL, colour: WHITE },
  'avatar-dark': { bg: NIGHT, colour: GLOW },
  'avatar-light': { bg: PAPER, colour: TEAL },
})) {
  const svg = appIcon(1024, { ...opts, radius: 0, scale: 0.54 });
  out('social', `${name}.svg`, svg);
  out('social', `${name}-1024.png`, toPng(svg, 1024));
  out('social', `${name}-400.png`, toPng(svg, 400));
}

console.log('Icons and avatars written to brands/qrflick/icons and /social');
