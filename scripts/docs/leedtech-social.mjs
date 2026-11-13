// Social covers + link preview (OG) image for LeedTech, rendered from HTML with Edge.
// Run: node scripts/docs/leedtech-social.mjs   (from brand-library/)
import path from 'node:path';
import fs from 'node:fs';
import { loadBrand, inlineSvg, globe, fontFaces, writeFile, screenshot, esc } from './common.mjs';

const { dir, brand, hex } = loadBrand('leedtech');
const INK = hex('Negro Tinta'), YELLOW = hex('Amarillo Señal'), GREY = hex('Gris');
// Two versions: standard (LeedTech logo) and cobrand (LeedTech | Grupo Lanak lockup, preferred).
const LOGOS = {
  standard: inlineSvg(path.join(dir, 'logo/svg/leedtech-primary-colour-dark.svg'), { cls: 'logo', label: brand.name }),
  cobrand: inlineSvg(path.join(dir, 'logo/svg/lockups/leedtech-grupo-lanak-cobrand-colour-dark.svg'), { cls: 'logo', label: 'LeedTech | Grupo Lanak' }),
};
const SRC_DIR = path.join(dir, 'social/src');

// Profile pictures cover the lower-left corner on LinkedIn and X, so content goes right there.
// YouTube shows only the centre 1546×423 on every device; Facebook crops the sides on mobile.
const COVERS = {
  'og-image-1200x630': { w: 1200, h: 630, align: 'left', logo: 560, pad: 84, globe: { size: 760, x: 760, y: -40 }, line: true },
  'linkedin-cover-1584x396': { w: 1584, h: 396, align: 'right', logo: 520, pad: 110, globe: { size: 620, x: -120, y: -110 } },
  'x-header-1500x500': { w: 1500, h: 500, align: 'right', logo: 520, pad: 110, globe: { size: 700, x: -120, y: -100 } },
  'facebook-cover-1640x624': { w: 1640, h: 624, align: 'center', logo: 600, pad: 0, globe: { size: 760, x: 1120, y: -70 } },
  'youtube-banner-2560x1440': { w: 2560, h: 1440, align: 'center', logo: 760, pad: 0, globe: { size: 1100, x: 1700, y: 160 } },
};

const TEXT = {
  es: { sub: 'Selección de personal · Construcción, logística e industria', end: 'UNA EMPRESA DEL GRUPO LANAK' },
  en: { sub: 'Recruitment · Construction, logistics and industry', end: 'A GRUPO LANAK COMPANY' },
};

function page(c, lang, v) {
  const co = v === 'cobrand';
  const logoW = co ? c.logo * 1.4 : c.logo; // the lockup is wider; keeps a similar visual height
  const gx = c.globe.x + (co ? { left: 140, center: 170, right: 0 }[c.align] : 0); // make room for the wider lockup
  const { sub, end } = TEXT[lang];
  const items = c.align === 'center' ? 'center' : c.align === 'right' ? 'flex-end' : 'flex-start';
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
${fontFaces('../../../../assets')}
*{margin:0;box-sizing:border-box}
html,body{width:${c.w}px;height:${c.h}px;overflow:hidden;background:${INK}}
.wrap{position:relative;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;
  align-items:${items};text-align:${c.align};padding:0 ${c.pad}px;font-family:Poppins,sans-serif;color:#fff}
.globe{position:absolute;left:${gx}px;top:${c.globe.y}px;width:${c.globe.size}px;height:${c.globe.size}px}
.logo{position:relative;width:${logoW}px;height:auto}
.bar{position:relative;width:${c.logo * 0.11}px;height:${Math.max(4, c.logo * 0.009)}px;background:${YELLOW};border-radius:3px;margin:${c.logo * 0.07}px 0 ${c.logo * 0.045}px}
.sub{position:relative;font-weight:500;font-size:${c.logo * 0.036}px;letter-spacing:.02em;color:#fff}
.url{position:relative;font-weight:400;font-size:${c.logo * 0.032}px;color:${GREY};margin-top:${c.logo * 0.02}px}
.end{position:absolute;bottom:${c.h * 0.08}px;left:${c.pad}px;font-weight:500;font-size:13px;letter-spacing:.3em;color:${GREY}}
</style></head><body><div class="wrap">
${globe({ orbit: YELLOW })}
${LOGOS[v]}
<div class="bar"></div>
<div class="sub">${esc(sub)}</div>
<div class="url">leedtech.es · ${esc(brand.contact.phone)}</div>
${c.line && !co ? `<div class="end">${end}</div>` : ''}
</div></body></html>`;
}

// Per language in brand.json: <name>-<lang>.png (standard) and <name>-cobrand-<lang>.png.
for (const lang of brand.languages) {
  for (const v of ['standard', 'cobrand']) {
    for (const [name, c] of Object.entries(COVERS)) {
      const id = v === 'cobrand' ? `${name}-cobrand-${lang}` : `${name}-${lang}`;
      const html = path.join(SRC_DIR, `${id}.html`);
      writeFile(html, page(c, lang, v));
      screenshot(html, path.join(dir, 'social', `${id}.png`), c.w, c.h);
      console.log('rendered', id);
    }
  }
}
if (!process.env.KEEP_SRC) fs.rmSync(SRC_DIR, { recursive: true, force: true }); // KEEP_SRC=1 keeps the HTML (Figma import)
