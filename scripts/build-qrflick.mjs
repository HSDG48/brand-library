// Builds the QRflick logo system from the master mark + the Archivo ExtraBold wordmark.
// Run: node scripts/build-qrflick.mjs   (from brand-library/)
import fs from 'node:fs';
import path from 'node:path';
import { bbox, place, svgDoc, tight, toPng } from './lib/svg.mjs';
import { loadFont, textPathData } from './lib/type.mjs';
import { contactSheet } from './lib/preview.mjs';
import { BRAND_DIR as BRAND, markPiece, markMarkup, appIcon } from './lib/qrflick.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(BRAND, 'logo');
const PNG_WIDTHS = [512, 1024, 2048, 4096];
const B = JSON.parse(fs.readFileSync(path.join(BRAND, 'brand.json'), 'utf8'));
const hex = (n) => B.colors.find((c) => c.name === n).hex;
const K = { teal: hex('Teal'), deep: hex('Teal Deep'), glow: hex('Teal Glow'), ink: hex('Ink'), night: hex('Night'), snow: hex('Snow'), white: '#FFFFFF' };

// Colourways from the supplied guide: mark colour, wordmark colour, background it is made for.
const COLOURWAYS = {
  'colour-light': { mark: K.teal, word: K.ink, bg: K.white }, // default
  'colour-dark': { mark: K.glow, word: K.snow, bg: K.night },
  deep: { mark: K.deep, word: K.ink, bg: K.white }, // small sizes and print: Teal Deep reads better
  ink: { mark: K.ink, word: K.ink, bg: K.white }, // one colour
  white: { mark: K.white, word: K.white, bg: K.teal }, // reversed: on Teal, photos, stickers
};
// The wordmark has no mark, so only colourways that differ in wordmark colour.
const WORDMARK_CW = ['colour-light', 'colour-dark', 'white'];

// Wordmark: "QRflick" in Archivo 800, 64 units, -1 tracking: exactly as in the supplied logo files.
const font = loadFont(path.join(ROOT, 'assets/fonts/Archivo-ExtraBold.ttf'));
const WORD = { size: 64, letterSpacing: -1, x: 122, y: 72 };
const wordD = textPathData(font, B.wordmarkText, WORD);
const wordBox = bbox(`<path d="${wordD}"/>`);
const wordPiece = (fill) => ({ markup: `<path d="${wordD}" fill="${fill}"/>`, box: wordBox });

const union = (a, b) => {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
};

// Horizontal lockup: mark and wordmark in their original positions (as in source/logo).
function horizontal(cw) {
  const c = COLOURWAYS[cw];
  const m = markPiece(c.mark), w = wordPiece(c.word);
  return { markup: m.markup + w.markup, box: union(m.box, w.box) };
}

// Stacked lockup: mark centred above the wordmark, gap = 1.25 × data module.
function stacked(cw) {
  const c = COLOURWAYS[cw];
  const w = place(wordPiece(c.word), 0, 0, wordBox.h);
  const markH = wordBox.h * 2.05;
  const gap = markH * (26 / 96);
  const m = place(markPiece(c.mark), (w.w - markH) / 2, 0, markH);
  const w2 = place(wordPiece(c.word), 0, markH + gap, wordBox.h);
  return { markup: m.markup + w2.markup, box: { x: 0, y: 0, w: w.w, h: markH + gap + wordBox.h } };
}

const LAYOUTS = {
  horizontal: { make: horizontal, cws: Object.keys(COLOURWAYS) },
  stacked: { make: stacked, cws: Object.keys(COLOURWAYS) },
  wordmark: { make: (cw) => wordPiece(COLOURWAYS[cw].word), cws: WORDMARK_CW },
  mark: { make: (cw) => markPiece(COLOURWAYS[cw].mark), cws: Object.keys(COLOURWAYS) },
};

const written = [];
function write(rel, svg) {
  const svgPath = path.join(OUT, 'svg', rel + '.svg');
  fs.mkdirSync(path.dirname(svgPath), { recursive: true });
  fs.writeFileSync(svgPath, svg);
  for (const w of PNG_WIDTHS) {
    const pngPath = path.join(OUT, 'png', `${rel}-${w}w.png`);
    fs.mkdirSync(path.dirname(pngPath), { recursive: true });
    fs.writeFileSync(pngPath, toPng(svg, w));
  }
  written.push({ rel, svg });
}

for (const [layout, { make, cws }] of Object.entries(LAYOUTS)) {
  for (const cw of cws) write(`qrflick-${layout}-${cw}`, tight(make(cw), { title: `QRflick ${layout} ${cw}` }));
}

// App icons: white mark on Teal (as supplied) and Teal Glow on Night.
write('qrflick-app-icon', appIcon(100, { bg: K.teal, colour: K.white }));
write('qrflick-app-icon-dark', appIcon(100, { bg: K.night, colour: K.glow }));

// Sanity check: the horizontal lockup keeps the supplied proportions (mark 96 high, wordmark ending near x = 353).
const h = horizontal('colour-light').box;
if (h.h !== 96 || h.w < 340 || h.w > 365) throw new Error(`unexpected lockup box ${JSON.stringify(h)}`);
if (!markMarkup(K.ink).includes(K.ink)) throw new Error('mark recolour failed');

function bgFor(rel) {
  if (rel.includes('app-icon')) return '#ffffff';
  const cw = Object.keys(COLOURWAYS).find((k) => rel.endsWith('-' + k));
  return COLOURWAYS[cw].bg;
}
fs.writeFileSync(path.join(BRAND, 'preview-logos.png'), contactSheet(written, bgFor));
console.log(`Wrote ${written.length} SVGs (+${written.length * PNG_WIDTHS.length} PNGs) and preview-logos.png`);
