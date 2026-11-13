// Small helpers to read Figma-exported SVGs, measure them and compose new ones.
import fs from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

// Read an SVG exported from Figma and return its <path> layers (background rects are dropped).
export function loadLayers(file) {
  const src = fs.readFileSync(file, 'utf8');
  const layers = [];
  for (const m of src.matchAll(/<path ([^>]*?)\/>/g)) {
    const attrs = m[1];
    const id = (attrs.match(/\bid="([^"]*)"/) || [])[1] || 'path';
    const d = (attrs.match(/\bd="([^"]*)"/) || [])[1];
    const fill = (attrs.match(/\bfill="([^"]*)"/) || [])[1];
    const rule = (attrs.match(/\bfill-rule="([^"]*)"/) || [])[1];
    if (d) layers.push({ id, d, fill, rule });
  }
  return layers;
}

// Paths as SVG markup, with fills from a colour map keyed by layer id ('*' = fallback).
export function pathsMarkup(layers, colours = {}) {
  return layers
    .map((l) => {
      const fill = colours[l.id] ?? colours['*'] ?? l.fill;
      const rule = l.rule ? ` fill-rule="${l.rule}" clip-rule="${l.rule}"` : '';
      return `<path d="${l.d}"${rule} fill="${fill}"/>`;
    })
    .join('\n');
}

// Exact bounding box of some markup, measured by rendering it.
export function bbox(markup) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20000" height="20000" viewBox="-5000 -5000 20000 20000">${markup}</svg>`;
  const b = new Resvg(svg).getBBox();
  if (!b) throw new Error('empty bbox');
  return { x: b.x, y: b.y, w: b.width, h: b.height };
}

// A placeable piece: markup + its bbox. place() moves it so its bbox top-left lands at (x, y) at a given height.
export function piece(markup) {
  return { markup, box: bbox(markup) };
}

export function place(p, x, y, height) {
  const s = height / p.box.h;
  const tx = x - p.box.x * s;
  const ty = y - p.box.y * s;
  return { markup: `<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(s, 6)})">${p.markup}</g>`, w: p.box.w * s, h: height };
}

export function r(n, d = 3) {
  return Number(n.toFixed(d));
}

// Wrap markup into a standalone SVG of the given size, optional background colour.
export function svgDoc(markup, w, h, { bg, title } = {}) {
  const t = title ? `<title>${title}</title>` : '';
  const rect = bg ? `<rect width="${r(w)}" height="${r(h)}" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${r(w)}" height="${r(h)}" viewBox="0 0 ${r(w)} ${r(h)}">${t}${rect}\n${markup}\n</svg>\n`;
}

// Tight SVG around a piece, with optional padding (in the piece's own units).
export function tight(p, { pad = 0, bg, title } = {}) {
  const placed = place(p, pad, pad, p.box.h);
  return svgDoc(placed.markup, p.box.w + pad * 2, p.box.h + pad * 2, { bg, title });
}

export function toPng(svg, width) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}
