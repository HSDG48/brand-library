// Builds the LeedTech logo system from the Figma source vectors.
// Run: node scripts/build-leedtech.mjs   (from brand-library/)
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';
import { loadLayers, pathsMarkup, piece, place, svgDoc, tight, toPng, r } from './lib/svg.mjs';
import { contactSheet } from './lib/preview.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const BRAND = path.join(ROOT, 'brands/leedtech');
const SRC = path.join(BRAND, 'source/figma');
const OUT = path.join(BRAND, 'logo');
const PNG_WIDTHS = [512, 1024, 2048, 4096];

const C = JSON.parse(fs.readFileSync(path.join(BRAND, 'brand.json'), 'utf8'));
const hex = (name) => [...C.colors, ...C.groupColors].find((c) => c.name === name).hex;
const K = {
  ink: hex('Negro Tinta'),
  yellow: hex('Amarillo Señal'),
  white: hex('Blanco'),
  grey: hex('Gris'),
  blue: hex('Azul Grupo'),
  lime: hex('Lima Grupo'),
};

// Colourways: fills per layer + the background each one is designed for (bg is only used in previews).
const COLOURWAYS = {
  'colour-dark': { wordmark: K.white, tagline: K.grey, spark: K.yellow, partner: K.white, bg: K.ink },
  'colour-light': { wordmark: K.ink, tagline: K.grey, spark: K.yellow, partner: K.ink, bg: K.white },
  black: { wordmark: K.ink, tagline: K.ink, spark: K.ink, partner: K.ink, bg: K.white },
  white: { wordmark: K.white, tagline: K.white, spark: K.white, partner: K.white, bg: K.ink },
  group: { wordmark: K.blue, tagline: K.blue, spark: K.lime, partner: K.blue, bg: K.white },
  'group-negative': { wordmark: K.white, tagline: K.white, spark: K.lime, partner: K.white, bg: K.blue },
};

const LAYOUTS = {
  primary: 'leedtech-primary.svg',
  horizontal: 'leedtech-horizontal-no-tagline.svg',
  vertical: 'leedtech-vertical.svg',
  symbol: 'leedtech-symbol.svg',
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

// ---------- 1. LeedTech logo in every layout x colourway ----------
const layers = Object.fromEntries(Object.entries(LAYOUTS).map(([k, f]) => [k, loadLayers(path.join(SRC, f))]));
const logo = (layout, cw) => piece(pathsMarkup(layers[layout], COLOURWAYS[cw]));

for (const layout of Object.keys(LAYOUTS)) {
  for (const cw of Object.keys(COLOURWAYS)) {
    write(`leedtech-${layout}-${cw}`, tight(logo(layout, cw), { title: `LeedTech ${layout} ${cw}` }));
  }
}

// ---------- 2. Grupo Lanak lockups ----------
const grupo = loadLayers(path.join(SRC, 'grupo-lanak.svg'));
const grupoPiece = (fill) => piece(pathsMarkup(grupo, { '*': fill }));

const font = opentype.loadSync(path.join(ROOT, 'assets/fonts/Poppins-Medium.ttf'));
// Text as outlined paths (no font needed to open the file), tracked to an exact width.
function textToWidth(text, capHeight, width, fill) {
  const size = capHeight / (font.tables.os2.sCapHeight / font.unitsPerEm);
  const glyphs = font.stringToGlyphs(text);
  const scale = size / font.unitsPerEm;
  const natural = glyphs.reduce((s, g) => s + g.advanceWidth * scale, 0);
  const lastAdv = glyphs.at(-1).advanceWidth * scale;
  const tracking = (width - natural + lastAdv - glyphs.at(-1).getBoundingBox().x2 * scale) / (glyphs.length - 1);
  let x = 0;
  const d = glyphs
    .map((g) => {
      const p = g.getPath(x, 0, size).toPathData(2);
      x += g.advanceWidth * scale + tracking;
      return p;
    })
    .join('');
  return piece(`<path d="${d}" fill="${fill}"/>`);
}

const divider = (x, y, h, w, fill) =>
  `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="${fill}" fill-opacity="0.35"/>`;

// Proportions measured from slide 11 of the Figma guide, in units of the LeedTech logo height H.
function endorsement(cw) {
  const c = COLOURWAYS[cw];
  const lt = logo('primary', cw);
  const H = lt.box.h;
  const a = place(lt, 0, 0, H);
  const gap = 0.19 * H;
  const dx = a.w + gap;
  const g = place(grupoPiece(c.partner), dx + gap + 12, 0.42 * H, 0.56 * H);
  const t = place(textToWidth('UNA EMPRESA DEL', 0.065 * H, g.w, c.partner), dx + gap + 12, 0.17 * H, 0.065 * H);
  const w = dx + gap + 12 + g.w;
  const markup = [a.markup, divider(dx, 0.05 * H, 0.9 * H, 12, c.partner), t.markup, g.markup].join('\n');
  return { svg: svgDoc(markup, w, H, { title: `LeedTech, una empresa del Grupo Lanak (${cw})` }), w, H, ratio: g.w / a.w };
}

function cobrand(cw) {
  const c = COLOURWAYS[cw];
  const lt = logo('horizontal', cw);
  const H = lt.box.h;
  const a = place(lt, 0, 0, H);
  const gap = 0.3 * H;
  const dx = a.w + gap;
  const g = place(grupoPiece(c.partner), dx + gap + 12, 0, 0.95 * H);
  const w = dx + gap + 12 + g.w;
  const markup = [a.markup, divider(dx, 0, H, 12, c.partner), g.markup].join('\n');
  return { svg: svgDoc(markup, w, H, { title: `LeedTech | Grupo Lanak (${cw})` }), w, H };
}

for (const cw of Object.keys(COLOURWAYS)) {
  const e = endorsement(cw);
  if (e.ratio > 0.45) throw new Error(`endorsement wider than 45% of logo (${e.ratio})`);
  write(`lockups/leedtech-grupo-lanak-endorsement-${cw}`, e.svg);
  write(`lockups/leedtech-grupo-lanak-cobrand-${cw}`, cobrand(cw).svg);
}

// ---------- 3. Grupo Lanak family logos (as supplied, plus mono versions) ----------
const FAMILY = { 'grupo-lanak': 'grupo-lanak.svg', lanak: 'lanak.svg', akilan: 'akilan.svg', qualis: 'qualis.svg' };
for (const [name, file] of Object.entries(FAMILY)) {
  const L = loadLayers(path.join(SRC, file));
  const versions =
    name === 'grupo-lanak'
      ? { blue: { '*': K.blue }, black: { '*': K.ink }, white: { '*': K.white } }
      : { colour: { white: K.white }, black: { '*': K.ink }, white: { '*': K.white } };
  for (const [v, fills] of Object.entries(versions)) {
    const mono = name === 'akilan' && v !== 'colour';
    const markup = mono ? knockout(L, fills['*']) : pathsMarkup(L, fills);
    write(`group/${name}-${v}`, tight(piece(markup), { title: `${name} ${v}` }));
  }
}

// One-colour Akilan: the "A" (blue layer) is cut out of the circle (lime layer) and solid outside it.
function knockout(L, fill) {
  const circle = L.find((l) => l.id === 'lime');
  const mark = L.find((l) => l.id === 'blue');
  const big = '<rect x="-99999" y="-99999" width="199998" height="199998" fill="white"/>';
  return `<defs>
<mask id="ak-hole" maskUnits="userSpaceOnUse" x="-99999" y="-99999" width="199998" height="199998">${big}<path d="${mark.d}" fill="black" stroke="black" stroke-width="18"/></mask>
<mask id="ak-out" maskUnits="userSpaceOnUse" x="-99999" y="-99999" width="199998" height="199998">${big}<path d="${circle.d}" fill="black"/></mask>
</defs>
<path d="${circle.d}" fill="${fill}" mask="url(#ak-hole)"/>
<path d="${mark.d}" fill="${fill}" mask="url(#ak-out)"/>`;
}

// ---------- 4. Preview contact sheet ----------
function bgFor(rel) {
  const cw = Object.keys(COLOURWAYS).find((k) => rel.endsWith('-' + k));
  if (cw) return COLOURWAYS[cw].bg;
  return rel.endsWith('-white') ? K.ink : K.white;
}
fs.writeFileSync(path.join(BRAND, 'preview-logos.png'), contactSheet(written, bgFor));

console.log(`Wrote ${written.length} SVGs (+${written.length * PNG_WIDTHS.length} PNGs) and preview-logos.png`);
