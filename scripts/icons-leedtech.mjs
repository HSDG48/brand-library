// Favicons, app icons, webmanifest and social avatars for LeedTech.
// Run: node scripts/icons-leedtech.mjs   (from brand-library/)
import fs from 'node:fs';
import path from 'node:path';
import { loadLayers, pathsMarkup, piece, place, svgDoc, toPng } from './lib/svg.mjs';
import { ico } from './lib/ico.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const BRAND = path.join(ROOT, 'brands/leedtech');
const brand = JSON.parse(fs.readFileSync(path.join(BRAND, 'brand.json'), 'utf8'));
const hex = (n) => brand.colors.find((c) => c.name === n).hex;
const INK = hex('Negro Tinta'), YELLOW = hex('Amarillo Señal'), WHITE = hex('Blanco');

const spark = piece(pathsMarkup(loadLayers(path.join(BRAND, 'source/figma/leedtech-symbol.svg')), { '*': YELLOW }));

// Spark centred on a square tile. `fill` = share of the tile height the spark takes; radius as share of size.
function tile(size, { fill = 0.62, radius = 0, bg = INK, colour = YELLOW } = {}) {
  const p = colour === YELLOW ? spark : piece(spark.markup.replaceAll(YELLOW, colour));
  const h = size * fill;
  const w = (p.box.w / p.box.h) * h;
  const s = place(p, (size - w) / 2, (size - h) / 2, h);
  const rect = `<rect width="${size}" height="${size}" rx="${size * radius}" fill="${bg}"/>`;
  return svgDoc(rect + s.markup, size, size);
}

const out = (dir, name, data) => {
  fs.mkdirSync(path.join(BRAND, dir), { recursive: true });
  fs.writeFileSync(path.join(BRAND, dir, name), data);
};

// Favicons: rounded tile so the yellow spark reads on light and dark browser tabs.
const fav = tile(64, { fill: 0.72, radius: 0.22 });
out('icons', 'favicon.svg', fav);
out('icons', 'favicon.ico', ico([16, 32, 48].map((size) => ({ size, data: toPng(fav, size) }))));
out('icons', 'favicon-32.png', toPng(fav, 32));
out('icons', 'favicon-16.png', toPng(fav, 16));
// iOS adds its own rounded corners, so square tile.
out('icons', 'apple-touch-icon.png', toPng(tile(180, { fill: 0.6 }), 180));
out('icons', 'icon-192.png', toPng(tile(192, { fill: 0.6 }), 192));
out('icons', 'icon-512.png', toPng(tile(512, { fill: 0.6 }), 512));
// Maskable: Android may crop to a circle, keep the spark inside the central 60%.
out('icons', 'icon-maskable-512.png', toPng(tile(512, { fill: 0.48 }), 512));

out(
  'icons',
  'site.webmanifest',
  JSON.stringify(
    {
      name: brand.name,
      short_name: brand.name,
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
      theme_color: INK,
      background_color: INK,
      display: 'standalone',
    },
    null,
    2,
  ) + '\n',
);

out(
  'icons',
  'head-snippet.html',
  `<!-- Paste into <head>, with the icon files at the site root -->
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${INK}">
`,
);

// Social avatars: spark kept inside the central circle so round crops never cut it.
for (const [name, opts] of Object.entries({
  'avatar-dark': {},
  'avatar-yellow': { bg: YELLOW, colour: INK },
  'avatar-light': { bg: WHITE },
})) {
  const svg = tile(1024, { fill: 0.56, ...opts });
  out('social', `${name}.svg`, svg);
  out('social', `${name}-1024.png`, toPng(svg, 1024));
  out('social', `${name}-400.png`, toPng(svg, 400));
}

console.log('Icons and avatars written to brands/leedtech/icons and /social');
