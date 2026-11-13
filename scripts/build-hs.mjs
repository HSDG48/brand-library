// Builds the logo system of the HS Digital family (parent + sub-brands) from the master mark
// and the Bricolage Grotesque wordmark. Run: node scripts/build-hs.mjs [slug ...]   (default: all)
import fs from 'node:fs';
import path from 'node:path';
import { tight, toPng, bbox, r } from './lib/svg.mjs';
import { contactSheet } from './lib/preview.mjs';
import { FAMILY, loadHs, partsOf, horizontal, stacked, wordPiece, markPiece, appIcon } from './lib/hs.mjs';

const PNG_WIDTHS = [512, 1024, 2048, 4096];
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : FAMILY;

function colourways(H) {
  const { K, isParent } = H;
  const cw = {
    colour: { top: K.navy, bottom: K.blue, word: K.navy, line: K.slate, rule: K.accent, bg: K.white }, // default
    navy: { top: K.navy, bottom: K.navy, word: K.navy, line: K.navy, rule: K.navy, bg: K.white }, // one colour
    black: { top: K.black, bottom: K.black, word: K.black, line: K.black, rule: K.black, bg: K.white }, // fax, stamps, press
    white: { top: K.white, bottom: K.white, word: K.white, line: K.white, rule: K.accent || K.white, bg: K.navy }, // reversed
  };
  // On the brand colour: white on Blue for the parent, Navy on the accent for sub-brands.
  if (isParent) cw.blue = { top: K.white, bottom: K.white, word: K.white, line: K.white, bg: K.blue };
  else cw.accent = { top: K.navy, bottom: K.navy, word: K.navy, line: K.navy, rule: K.navy, bg: K.accent };
  return cw;
}

function buildBrand(slug) {
  const H = loadHs(slug);
  const { brand: B, dir, K, isParent } = H;
  const OUT = path.join(dir, 'logo');
  fs.rmSync(path.join(OUT, 'svg'), { recursive: true, force: true });
  fs.rmSync(path.join(OUT, 'png'), { recursive: true, force: true });
  const CW = colourways(H);
  const parts = partsOf(B);
  const written = [];
  const write = (rel, svg, bg) => {
    const file = path.join(OUT, 'svg', rel + '.svg');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, svg);
    for (const w of PNG_WIDTHS) {
      const png = path.join(OUT, 'png', `${rel}-${w}w.png`);
      fs.mkdirSync(path.dirname(png), { recursive: true });
      fs.writeFileSync(png, toPng(svg, w));
    }
    written.push({ rel, svg, bg });
  };
  const pad = 0; // tight files; clear space is documented in the guide

  for (const [name, c] of Object.entries(CW)) {
    const base = { parts, top: c.top, bottom: c.bottom, word: c.word };
    write(`${slug}-horizontal-${name}`, tight(horizontal(base), { pad, title: `${B.name} horizontal ${name}` }), c.bg);
    write(`${slug}-stacked-${name}`, tight(stacked(base), { pad, title: `${B.name} stacked ${name}` }), c.bg);
    if (name !== 'navy') write(`${slug}-wordmark-${name}`, tight(wordPiece(parts, c.word), { title: `${B.name} wordmark ${name}` }), c.bg);
    write(`${slug}-mark-${name}`, tight(markPiece(c.top, c.bottom), { title: `HS mark ${name}` }), c.bg);
    if (!isParent) {
      // Endorsed lockups ("Parte de HS Digital"): the co-brand version, per language.
      for (const lang of B.languages) {
        const endorse = { text: B.endorsement[lang], fill: c.line, rule: c.rule };
        write(`${slug}-endorsed-${lang}-${name}`, tight(horizontal({ ...base, endorse }), { title: `${B.name} endorsed ${lang} ${name}` }), c.bg);
        write(`${slug}-endorsed-stacked-${lang}-${name}`, tight(stacked({ ...base, endorse: { ...endorse, rule: null } }), { title: `${B.name} endorsed stacked ${lang} ${name}` }), c.bg);
      }
    } else {
      // Full company name lockup for legal / contract use.
      const full = [...parts, { text: 'Solutions', weight: 'md' }];
      write(`${slug}-solutions-horizontal-${name}`, tight(horizontal({ ...base, parts: full }), { title: `HS Digital Solutions ${name}` }), c.bg);
    }
  }

  // App icons: sub-brands = Navy mark on the accent tile; parent = white mark on Navy, and colour mark on white.
  if (isParent) {
    write(`${slug}-app-icon`, appIcon(512, { bg: K.navy, top: K.white }), '#ffffff');
    write(`${slug}-app-icon-light`, appIcon(512, { bg: K.white, top: K.navy, bottom: K.blue }), K.mist);
  } else {
    write(`${slug}-app-icon`, appIcon(512, { bg: K.accent, top: K.navy }), '#ffffff');
    write(`${slug}-app-icon-navy`, appIcon(512, { bg: K.navy, top: K.white }), '#ffffff');
  }

  // Parent only: the family sheet (parent lockup over the four sub-brand lockups, each with its accent).
  if (isParent) {
    const M = 371;
    const p = horizontal({ parts, top: K.navy, bottom: K.blue, word: K.navy, M });
    const y = M + M * 0.7;
    let markup = `<g>${p.markup}</g>`;
    const subs = B.family.members.map((s) => loadHs(s));
    const subLocks = subs.map((S) => ({ S, l: horizontal({ parts: partsOf(S.brand), top: K.navy, bottom: K.blue, word: K.navy, M: M * 0.62 }) }));
    const colW = Math.max(...subLocks.map((x) => x.l.box.w)) + M * 0.7;
    subLocks.forEach(({ S, l }, i) => {
      const x = (i % 2) * colW, yy = y + Math.floor(i / 2) * M * 1.15;
      markup += `<g transform="translate(${r(x)} ${r(yy)})">${l.markup}<rect x="0" y="${r(M * 0.62 + M * 0.12)}" width="${r(M * 0.62)}" height="${r(M * 0.06)}" rx="${r(M * 0.03)}" fill="${S.K.accent}"/></g>`;
    });
    write(`${slug}-family-colour`, tight({ markup, box: bbox(markup) }, { pad: M * 0.1, title: 'HS Digital family' }), K.white);
  }

  fs.writeFileSync(path.join(dir, 'preview-logos.png'), contactSheet(written, (rel) => written.find((w) => w.rel === rel).bg));
  console.log(`${slug}: ${written.length} SVGs (+${written.length * PNG_WIDTHS.length} PNGs) and preview-logos.png`);
}

for (const s of slugs) buildBrand(s);
