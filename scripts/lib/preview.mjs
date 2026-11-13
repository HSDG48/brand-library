// Contact sheet of every logo file a build wrote: one tile per SVG on its intended background.
import { svgDoc, toPng, r } from './svg.mjs';

// written = [{ rel, svg }], bgFor(rel) = tile background colour. Returns a PNG buffer.
export function contactSheet(written, bgFor, { cols = 4, width = 2400 } = {}) {
  const TILE_W = 700, TILE_H = 300, PAD = 60, LABEL = 34;
  const tiles = written.map(({ rel, svg }, i) => {
    const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const [w, h] = [+vb[1], +vb[2]];
    const s = Math.min((TILE_W - PAD * 2) / w, (TILE_H - LABEL - PAD * 2) / h);
    const x = (i % cols) * (TILE_W + 20), y = Math.floor(i / cols) * (TILE_H + 20);
    const inner = svg.replace(/^<svg[^>]*>|<\/svg>\s*$/g, '').replace(/<title>.*?<\/title>/, '');
    return `<g transform="translate(${x} ${y})"><rect width="${TILE_W}" height="${TILE_H}" rx="16" fill="${bgFor(rel)}" stroke="#ddd"/>
<g transform="translate(${r((TILE_W - w * s) / 2)} ${r((TILE_H - LABEL - h * s) / 2)}) scale(${r(s, 6)})">${inner}</g>
<rect y="${TILE_H - LABEL}" width="${TILE_W}" height="${LABEL}" fill="#fff" fill-opacity="0.9"/>
<text x="14" y="${TILE_H - 11}" font-family="Arial" font-size="18" fill="#333">${rel}</text></g>`;
  });
  const rows = Math.ceil(tiles.length / cols);
  const sheet = svgDoc(tiles.join('\n'), cols * (TILE_W + 20) - 20, rows * (TILE_H + 20) - 20, { bg: '#f3f3f3' });
  return toPng(sheet, width);
}
