// QRflick mark helpers shared by the logo, icon and document scripts.
import fs from 'node:fs';
import path from 'node:path';
import { svgDoc, r } from './svg.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
export const BRAND_DIR = path.join(ROOT, 'brands/qrflick');
const MASTER = fs.readFileSync(path.join(BRAND_DIR, 'master/qrflick-mark.svg'), 'utf8');
const PLACEHOLDER = '#079A96';

// The mark's layers (frame, module, flick) in one colour, in master units (0..100).
export function markMarkup(colour) {
  return MASTER.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    .replace(/<title>.*?<\/title>/, '').replace(/<!--[\s\S]*?-->/g, '').trim()
    .replaceAll(PLACEHOLDER, colour);
}

// Visible bounds of the mark (stroke caps included). Strokes are not measured by bbox(), so it is fixed.
export const MARK_BOX = { x: 2, y: 2, w: 96, h: 96 };
export const markPiece = (colour) => ({ markup: markupG(markMarkup(colour)), box: { ...MARK_BOX } });
const markupG = (m) => `<g>${m}</g>`;

// Height of the data module (21 units) in mark units: the clear-space unit is 2 × this.
export const MODULE_H = 21;

// App icon: mark centred on a square tile. As supplied: radius 22%, mark scaled to 64% of the tile.
export function appIcon(size, { bg, colour, radius = 0.22, scale = 0.64 } = {}) {
  const s = (size / 100) * scale;
  const t = (size - 100 * s) / 2;
  const rect = `<rect width="${size}" height="${size}" rx="${r(size * radius)}" fill="${bg}"/>`;
  return svgDoc(`${rect}<g transform="translate(${r(t)} ${r(t)}) scale(${r(s, 6)})">${markMarkup(colour)}</g>`, size, size);
}
