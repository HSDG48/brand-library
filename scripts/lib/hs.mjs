// HS Digital family: shared mark, wordmarks and lockups for the parent and its sub-brands.
// One master mark (brands/hs-digital/master/hs-mark.svg) + Bricolage Grotesque wordmarks, outlined.
import fs from 'node:fs';
import path from 'node:path';
import { loadLayers, pathsMarkup, bbox, place, svgDoc, r } from './svg.mjs';
import { loadFont, textPathData, textWidth } from './type.mjs';

export const ROOT = path.resolve(import.meta.dirname, '../..');
export const FAMILY = ['hs-digital', 'hs-marketing', 'hs-seo', 'hs-dev', 'hs-design'];
export const SUBS = FAMILY.slice(1);
export const brandDir = (slug) => path.join(ROOT, 'brands', slug);

export function loadHs(slug) {
  if (!FAMILY.includes(slug)) throw new Error(`not an HS brand: ${slug}`);
  const brand = JSON.parse(fs.readFileSync(path.join(brandDir(slug), 'brand.json'), 'utf8'));
  const hex = (name) => {
    const c = brand.colors.find((x) => x.name === name);
    if (!c) throw new Error(`${slug}: no colour ${name}`);
    return c.hex;
  };
  const accent = brand.colors.find((c) => c.role === 'accent');
  const accentDeep = brand.colors.find((c) => c.role === 'accent-text');
  const K = {
    navy: hex('Navy'), blue: hex('Blue'), blueDeep: hex('Blue 700'), sky: hex('Sky'), mist: hex('Mist'),
    ink: hex('Ink'), slate: hex('Slate'), line: hex('Line'), white: '#FFFFFF', black: '#000000',
    accent: accent?.hex, accentDeep: accentDeep?.hex,
  };
  return { slug, dir: brandDir(slug), brand, hex, K, isParent: slug === 'hs-digital' };
}

// ---- Mark ------------------------------------------------------------------------------------
const LAYERS = loadLayers(path.join(brandDir('hs-digital'), 'master/hs-mark.svg'));
export const MARK_BOX = bbox(pathsMarkup(LAYERS));
export const markMarkup = (top, bottom = top) => pathsMarkup(LAYERS, { top, bottom });
export const markPiece = (top, bottom = top) => ({ markup: `<g>${markMarkup(top, bottom)}</g>`, box: { ...MARK_BOX } });
export const MARK_LAYERS = LAYERS;

// Mark centred on a square tile (favicons, app icons, avatars).
export function appIcon(size, { bg, top, bottom = top, radius = 0.22, scale = 0.62, plate } = {}) {
  const s = (size * scale) / MARK_BOX.h;
  const tx = (size - MARK_BOX.w * s) / 2 - MARK_BOX.x * s;
  const ty = (size - MARK_BOX.h * s) / 2 - MARK_BOX.y * s;
  const rect = bg ? `<rect width="${size}" height="${size}" rx="${r(size * radius)}" fill="${bg}"/>` : '';
  const p = plate ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r(size * plate.r)}" fill="${plate.fill}"/>` : '';
  return svgDoc(`${rect}${p}<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(s, 6)})">${markMarkup(top, bottom)}</g>`, size, size);
}

// ---- Wordmark --------------------------------------------------------------------------------
// "HS" in Bricolage Grotesque ExtraBold + the name in Medium, -2 % tracking (as specified in the
// sites' brand guidelines). Units: cap height = 100.
const FONT_DIR = path.join(ROOT, 'assets/fonts');
const XB = loadFont(path.join(FONT_DIR, 'BricolageGrotesque-ExtraBold.ttf'));
const MD = loadFont(path.join(FONT_DIR, 'BricolageGrotesque-Medium.ttf'));
const SB = loadFont(path.join(FONT_DIR, 'Manrope-SemiBold.ttf'));
const CAP = XB.tables.os2.sCapHeight / XB.unitsPerEm; // cap height as a share of the font size
const SIZE = 100 / CAP;
const TRACK = -0.02 * SIZE;

export function wordmarkPaths(parts) {
  // parts = [{ text, weight: 'xb'|'md' }], separated by a word space.
  let x = 0;
  const out = [];
  parts.forEach((p, i) => {
    const font = p.weight === 'xb' ? XB : MD;
    if (i > 0) x += MD.getAdvanceWidth(' ', SIZE) * 0.92;
    out.push(textPathData(font, p.text, { x, y: 100, size: SIZE, letterSpacing: TRACK }));
    x += textWidth(font, p.text, { size: SIZE, letterSpacing: TRACK });
  });
  return out.join('');
}
export function wordPiece(parts, fill) {
  const d = wordmarkPaths(parts);
  return { markup: `<path d="${d}" fill="${fill}"/>`, box: bbox(`<path d="${d}"/>`) };
}

// Endorsement line ("Parte de HS Digital"), Manrope SemiBold, +4 % tracking, cap height = 100.
const SB_CAP = SB.tables.os2.sCapHeight / SB.unitsPerEm;
export function linePiece(text, fill) {
  const size = 100 / SB_CAP;
  const d = textPathData(SB, text, { x: 0, y: 100, size, letterSpacing: 0.04 * size });
  return { markup: `<path d="${d}" fill="${fill}"/>`, box: bbox(`<path d="${d}"/>`) };
}

// ---- Lockups ---------------------------------------------------------------------------------
// Proportions (mark height M): wordmark cap height 0.40 M, gap mark → wordmark 0.30 M.
// Endorsement cap height = 0.30 × wordmark cap height, 0.36 × cap height below the wordmark's baseline,
// with a short accent rule in front of it (sub-brands only).
export const LOCK = { cap: 0.40, gap: 0.30, endCap: 0.30, endGap: 0.42 };

export function horizontal({ parts, top, bottom, word, M = 371, endorse }) {
  const capH = M * LOCK.cap;
  const m = place(markPiece(top, bottom), 0, 0, M);
  const wp = wordPiece(parts, word);
  // Wordmark placed by cap height (the box height includes descenders, so scale on caps).
  const s = capH / 100;
  const blockH = endorse ? capH * (1 + LOCK.endGap + LOCK.endCap) : capH;
  const y0 = (M - blockH) / 2;
  const x0 = M + M * LOCK.gap;
  let markup = m.markup + `<g transform="translate(${r(x0 - wp.box.x * s)} ${r(y0)}) scale(${r(s, 6)})">${wp.markup}</g>`;
  let w = x0 + wp.box.w * s;
  if (endorse) {
    const lp = linePiece(endorse.text, endorse.fill);
    const ls = (capH * LOCK.endCap) / 100;
    const ly = y0 + capH * (1 + LOCK.endGap);
    let lx = x0;
    if (endorse.rule) {
      const rh = capH * LOCK.endCap;
      markup += `<rect x="${r(lx)}" y="${r(ly + rh * 0.35)}" width="${r(rh * 1.6)}" height="${r(rh * 0.3)}" rx="${r(rh * 0.15)}" fill="${endorse.rule}"/>`;
      lx += rh * 2.3;
    }
    markup += `<g transform="translate(${r(lx - lp.box.x * ls)} ${r(ly)}) scale(${r(ls, 6)})">${lp.markup}</g>`;
    w = Math.max(w, lx + lp.box.w * ls);
  }
  return { markup, box: { x: 0, y: 0, w, h: M } };
}

// Stacked: mark centred above the wordmark; gap 0.22 M; wordmark cap height 0.30 M.
export function stacked({ parts, top, bottom, word, M = 371, endorse }) {
  const capH = M * 0.30;
  const wp = wordPiece(parts, word);
  const s = capH / 100;
  const ww = wp.box.w * s;
  let lw = 0, lp, ls;
  const eCap = capH * 0.46; // stacked endorsement reads at small sizes
  if (endorse) { lp = linePiece(endorse.text, endorse.fill); ls = eCap / 100; lw = lp.box.w * ls; }
  const W = Math.max(ww, M, lw);
  const m = place(markPiece(top, bottom), (W - M) / 2, 0, M);
  const wy = M + M * 0.22;
  let markup = m.markup + `<g transform="translate(${r((W - ww) / 2 - wp.box.x * s)} ${r(wy)}) scale(${r(s, 6)})">${wp.markup}</g>`;
  // The box includes descenders (g in Design, Marketing, Digital) so nothing is clipped.
  let h = wy + capH, low = wy + (wp.box.y + wp.box.h) * s;
  if (endorse) {
    const ly = h + capH * 0.5;
    markup += `<g transform="translate(${r((W - lw) / 2 - lp.box.x * ls)} ${r(ly)}) scale(${r(ls, 6)})">${lp.markup}</g>`;
    h = ly + eCap;
    low = Math.max(low, ly + (lp.box.y + lp.box.h) * ls);
  }
  return { markup, box: { x: 0, y: 0, w: W, h: Math.max(h, low) } };
}

// Wordmark parts from brand.json ("wordmark": ["HS", "SEO"]).
export const partsOf = (brand) => brand.wordmark.map((t, i) => ({ text: t, weight: i === 0 ? 'xb' : 'md' }));
