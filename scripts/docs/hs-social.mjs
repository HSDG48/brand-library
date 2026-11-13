// Social covers + link preview (OG) image for every HS brand and language, rendered with Edge.
// Run: node scripts/docs/hs-social.mjs [slug ...]   (after build-hs.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { inlineSvg, writeFile, screenshot, esc } from './common.mjs';
import { FAMILY } from '../lib/hs.mjs';
import { loadHs, copyOf, web, leaf, headline, baseCss, acc } from './hs-common.mjs';

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : FAMILY;

// Profile pictures cover the lower left on LinkedIn and X, so content goes right there.
// YouTube shows only the centre 1546×423 on every device; Facebook crops the sides on mobile.
const COVERS = {
  'og-image-1200x630': { w: 1200, h: 630, align: 'left', logo: 330, pad: 84, size: 1 },
  'linkedin-cover-1584x396': { w: 1584, h: 396, align: 'right', logo: 290, pad: 100, size: 0.78 },
  'x-header-1500x500': { w: 1500, h: 500, align: 'right', logo: 300, pad: 100, size: 0.86 },
  'facebook-cover-1640x624': { w: 1640, h: 624, align: 'center', logo: 340, pad: 0, size: 1 },
  'youtube-banner-2560x1440': { w: 2560, h: 1440, align: 'center', logo: 400, pad: 0, size: 1.15 },
};

function page(H, c, lang) {
  const { brand: B, dir, K, isParent } = H;
  const T = copyOf(B, lang);
  const logoFile = isParent ? `${H.slug}-horizontal-white` : `${H.slug}-endorsed-${lang}-white`;
  const LOGO = inlineSvg(path.join(dir, 'logo/svg', logoFile + '.svg'), { cls: 'logo', label: B.name });
  const items = c.align === 'center' ? 'center' : c.align === 'right' ? 'flex-end' : 'flex-start';
  const L = c.logo, S = c.size, short = c.h / c.w < 0.3;
  const fs1 = (short ? 48 : 62) * S;
  // The two leaf halves, large and whole, on the side opposite the text (centre for centred covers).
  // Centred covers: the mark sits mostly off the right edge so it never runs behind the text.
  const centre = c.align === 'center';
  const lh = c.h * (short ? 1.55 : centre ? 0.95 : 1.12);
  const lx = c.align === 'right' ? c.w * 0.04 : c.align === 'left' ? c.w - lh * 0.82 : c.w - lh * 0.48;
  const ly = (c.h - lh) / 2 + (short ? c.h * 0.18 : c.h * 0.1);
  const box = `left:${lx}px;top:${ly}px;width:${lh}px;height:${lh}px`;
  const deco = `${leaf('top', '#ffffff', box, 0.07)}${leaf('bottom', K.blue, box, 0.5)}`;
  const chips = isParent
    ? `<div class="chips">${B.family.members.map((s) => { const S2 = loadHs(s); return `<span><i style="background:${S2.K.accent}"></i>${esc(S2.brand.name)}</span>`; }).join('')}</div>`
    : '';
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
${baseCss(H, '../../../../assets')}
*{margin:0;box-sizing:border-box}
html,body{width:${c.w}px;height:${c.h}px;overflow:hidden;background:linear-gradient(135deg,${K.navy} 0%,${K.navy} 58%,#124d8f 100%)}
.wrap{position:relative;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:${items};text-align:${c.align};padding:0 ${c.pad}px;color:#fff}
.logo{position:relative;width:${L}px;height:auto}
.tag{position:relative;font-family:'Bricolage Grotesque';font-weight:750;letter-spacing:-.022em;line-height:1.05;font-size:${fs1}px;margin-top:${short ? 22 * S : 34 * S}px;max-width:${c.w * (short ? 0.62 : c.align === 'center' ? 0.8 : 0.86)}px;font-variation-settings:'opsz' 96}
.sub{position:relative;font-weight:600;font-size:${20 * S}px;color:#B9C9DD;margin-top:${short ? 14 * S : 22 * S}px;letter-spacing:.01em}
.sub b{color:#fff;font-weight:700}
.chips{position:relative;display:flex;gap:${14 * S}px;margin-top:${22 * S}px;flex-wrap:wrap;justify-content:${items}}
.chips span{display:flex;align-items:center;gap:${9 * S}px;font-weight:700;font-size:${18 * S}px;padding:${8 * S}px ${16 * S}px;border-radius:99px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16)}
.chips i{width:${12 * S}px;height:${12 * S}px;border-radius:50%}
</style></head><body><div class="wrap">
${deco}
${LOGO}
<div class="tag">${headline(T.promise, T.promiseMark, B.motif?.type || 'plain', acc(K), { dark: true })}</div>
${chips}
<div class="sub">${esc(T.socialLine)} · <b>${web(B)}</b></div>
</div></body></html>`;
}

for (const slug of slugs) {
  const H = loadHs(slug);
  const SRC = path.join(H.dir, 'social/src');
  for (const lang of H.brand.languages) {
    for (const [name, c] of Object.entries(COVERS)) {
      const id = `${name}-${lang}`;
      const html = path.join(SRC, `${id}.html`);
      writeFile(html, page(H, c, lang));
      screenshot(html, path.join(H.dir, 'social', `${id}.png`), c.w, c.h);
    }
  }
  if (!process.env.KEEP_SRC) fs.rmSync(SRC, { recursive: true, force: true }); // KEEP_SRC=1 keeps the HTML (Figma import)
  console.log(`${slug}: social covers`);
}
