// Social covers + link preview (OG) image for QRflick, rendered from HTML with Edge.
// Run: node scripts/docs/qrflick-social.mjs   (from brand-library/)
import path from 'node:path';
import fs from 'node:fs';
import { loadBrand, inlineSvg, fontFaces, writeFile, screenshot, esc } from './common.mjs';
import { markMarkup } from '../lib/qrflick.mjs';

const { dir, brand: B, hex } = loadBrand('qrflick');
const K = { night: hex('Night'), glow: hex('Teal Glow'), teal: hex('Teal'), snow: hex('Snow') };
const LOGO = inlineSvg(path.join(dir, 'logo/svg/qrflick-horizontal-colour-dark.svg'), { cls: 'logo', label: B.name });
const SRC_DIR = path.join(dir, 'social/src');
const WEB = B.website.replace('https://', '');

// Big mark, cropped off the edge: the scan frame "catching" the cover.
const deco = (size, x, y) =>
  `<svg class="deco" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px" viewBox="0 0 100 100" aria-hidden="true">${markMarkup(K.glow)}</svg>`;

// Profile pictures cover the lower-left corner on LinkedIn and X, so content goes right there.
// YouTube shows only the centre 1546×423 on every device; Facebook crops the sides on mobile.
const COVERS = {
  'og-image-1200x630': { w: 1200, h: 630, align: 'left', logo: 360, pad: 84, deco: [700, 690, -40] },
  'linkedin-cover-1584x396': { w: 1584, h: 396, align: 'right', logo: 330, pad: 110, deco: [560, -150, -80] },
  'x-header-1500x500': { w: 1500, h: 500, align: 'right', logo: 340, pad: 110, deco: [640, -170, -70] },
  'facebook-cover-1640x624': { w: 1640, h: 624, align: 'center', logo: 380, pad: 0, deco: [760, 1230, -60] },
  'youtube-banner-2560x1440': { w: 2560, h: 1440, align: 'center', logo: 420, pad: 0, deco: [1100, 1900, 170] },
};

function page(c, lang) {
  const loc = lang === 'es' ? B : { ...B, ...B.i18n[lang] };
  const sub = lang === 'es' ? `QR que se cambia después de imprimir · Gratis en ${WEB}` : `QR codes you can change after printing · Free at ${WEB}`;
  const items = c.align === 'center' ? 'center' : c.align === 'right' ? 'flex-end' : 'flex-start';
  const L = c.logo;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
${fontFaces('../../../../assets', 'qrflick')}
*{margin:0;box-sizing:border-box}
html,body{width:${c.w}px;height:${c.h}px;overflow:hidden;background:${K.night}}
.wrap{position:relative;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;
  align-items:${items};text-align:${c.align};padding:0 ${c.pad}px;font-family:Archivo,'Helvetica Neue',Arial,sans-serif;color:${K.snow}}
.deco{position:absolute;opacity:.16}
.logo{position:relative;width:${L}px;height:auto}
.tag{position:relative;font-weight:800;letter-spacing:-.03em;line-height:1.02;font-size:${L * 0.17}px;margin-top:${L * 0.12}px;max-width:${L * 2.6}px}
.tag span{color:${K.glow}}
.sub{position:relative;font-weight:500;font-size:${L * 0.055}px;color:#A9B1B3;margin-top:${L * 0.07}px}
</style></head><body><div class="wrap">
${deco(...c.deco)}
${LOGO}
<div class="tag">${esc(loc.tagline).replace(/\. (.+)$/, '.<br><span>$1</span>')}</div>
<div class="sub">${esc(sub)}</div>
</div></body></html>`;
}

// One set per language in brand.json: <name>-<lang>.png
for (const lang of B.languages) {
  for (const [name, c] of Object.entries(COVERS)) {
    const id = `${name}-${lang}`;
    const html = path.join(SRC_DIR, `${id}.html`);
    writeFile(html, page(c, lang));
    screenshot(html, path.join(dir, 'social', `${id}.png`), c.w, c.h);
    console.log('rendered', id);
  }
}
if (!process.env.KEEP_SRC) fs.rmSync(SRC_DIR, { recursive: true, force: true }); // KEEP_SRC=1 keeps the HTML (Figma import)
