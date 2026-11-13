// LeedTech brand guide: portrait A4 pages, one web page + one PDF per language.
// Words live in leedtech-guide-text.mjs. Run: node scripts/docs/leedtech-guide.mjs   (from brand-library/)
import fs from 'node:fs';
import path from 'node:path';
import { loadBrand, globe, fontFaces, writeFile, printPdf, esc } from './common.mjs';
import { loadLayers } from '../lib/svg.mjs';
import { TEXT, localBrand } from './leedtech-guide-text.mjs';

const { dir, brand: BASE, hex } = loadBrand('leedtech');
const K = { ink: hex('Negro Tinta'), yellow: hex('Amarillo Señal'), grey: hex('Gris'), graphite: hex('Grafito'), blue: hex('Azul Grupo'), lime: hex('Lima Grupo') };
const L = (name) => `../logo/svg/${name}.svg`;
const img = (name, alt = '', style = '') => `<img src="${L(name)}" alt="${esc(alt)}"${style ? ` style="${style}"` : ''}>`;
const TOTAL = 16;

// Inline SVG of the primary logo with custom layer styling (for the misuse examples).
const primaryLayers = loadLayers(path.join(dir, 'source/figma/leedtech-primary.svg'));
function primaryInline({ fills = {}, outline = false, sparkShift = 0 }) {
  const paths = primaryLayers.map((l) => {
    const f = fills[l.id] ?? fills['*'];
    const style = outline ? `fill="none" stroke="#fff" stroke-width="10"` : `fill="${f}"`;
    const t = l.id === 'spark' && sparkShift ? ` transform="translate(${sparkShift} 0)"` : '';
    return `<path d="${l.d}" ${style}${t}/>`;
  });
  return `<svg viewBox="-10 -10 ${4120 + sparkShift} 955" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${paths.join('')}</svg>`;
}
const DARK_FILLS = { wordmark: '#fff', tagline: K.grey, spark: K.yellow };

function build(lang) {
  const T = TEXT[lang];
  const B = localBrand(BASE, lang);
  let n = 0;
  const page = (kicker, inner, { dark = false, plain = false } = {}) => {
    n += 1;
    const num = String(n).padStart(2, '0');
    const head = plain ? '' : `<div class="kicker"><b>${num}</b>${esc(kicker)}</div>`;
    const foot = plain ? '' : `<div class="foot"><span>${T.foot}</span><span>${num} / ${TOTAL}</span></div>`;
    return `<section class="page${dark ? ' dark' : ''}" aria-label="${esc(kicker)}">${head}${inner}${foot}</section>`;
  };
  const endorsed = (h) => `<div style="display:flex;align-items:center;gap:5mm"><span class="label" style="color:#bbb">${T.endorsedBy}</span>${img('group/grupo-lanak-white', 'Grupo Lanak', `height:${h}mm`)}</div>`;
  const P = [];

  // 01 Cover
  P.push(page(T.cover.k, `
  <div class="deco" style="right:-60mm;top:-30mm;width:190mm;height:190mm">${globe({ orbit: K.yellow, cls: '' })}</div>
  <div style="margin-top:auto;position:relative">
    ${img('leedtech-primary-colour-dark', 'LeedTech', 'width:150mm')}
    <div class="bar" style="margin:14mm 0 7mm"></div>
    <h1 style="margin:0;font-size:26pt">${T.cover.h1}</h1>
    <p class="lead" style="margin-top:2mm">${T.cover.sub}</p>
  </div>
  <div style="margin-top:28mm">${endorsed(12)}</div>`, { dark: true, plain: true }));

  // 02 Contents
  P.push(page(T.toc.k, `
  <h1>${T.toc.h1}</h1>
  <div class="body" style="gap:0">${T.toc.items.map((t, i) => `<div class="scale-row" style="grid-template-columns:14mm 1fr"><span class="accent" style="font-weight:600">${String(i + 3).padStart(2, '0')}</span><span style="font-family:Outfit;font-size:14pt;font-weight:500">${t}</span></div>`).join('')}</div>`));

  // 03 The brand
  P.push(page(T.brand.k, `
  <h1 style="font-size:40pt">Talent <span class="accent">Beyond</span> Borders.</h1>
  <p class="lead">${esc(B.description)}</p>
  <div class="body"><div class="points">${B.values.map((v, i) => `
    <div class="point"><div class="n">0${i + 1}</div><h2>${esc(v.name)}</h2><p>${esc(v.text)}</p></div>`).join('')}</div>
  <div class="tile ink" style="margin-top:auto;min-height:42mm">${img('leedtech-primary-colour-dark', 'LeedTech', 'max-height:20mm')}</div></div>`));

  // 04 Primary logo
  const pr = T.primary;
  P.push(page(pr.k, `
  <h1>${pr.h1}</h1>
  <p class="lead">${pr.lead}</p>
  <div class="body">
    <div><div class="tile ink big">${img('leedtech-primary-colour-dark', pr.dark)}</div><div class="cap">${pr.dark} <span>${pr.darkSub}</span></div></div>
    <div><div class="tile white big">${img('leedtech-primary-colour-light', pr.light)}</div><div class="cap">${pr.light}</div></div>
    <div class="points g3 grid">${pr.parts.map(([h, p], i) => `<div class="point"><div class="n">${'ABC'[i]}</div><h2>${h}</h2><p>${p}</p></div>`).join('')}</div>
  </div>`));

  // 05 Variations
  const files = [['leedtech-primary-colour-dark', 'ink'], ['leedtech-horizontal-colour-dark', 'ink'], ['leedtech-vertical-colour-dark', 'ink'], ['leedtech-symbol-colour-dark', 'ink'],
    ['leedtech-primary-black', 'white'], ['leedtech-primary-white', 'surface'], ['leedtech-primary-group', 'white'], ['leedtech-primary-group-negative', 'blue']];
  P.push(page(T.variations.k, `
  <h1>${T.variations.h1}</h1>
  <p class="lead">${T.variations.lead}</p>
  <div class="body"><div class="grid g2" style="row-gap:4mm">${files.map(([f, bg], i) => { const [t, s] = T.variations.items[i]; return `
    <div><div class="tile ${bg}" style="min-height:32mm;padding:6mm">${img(f, t)}</div><div class="cap">${t}<span>${s}</span></div></div>`; }).join('')}
  </div></div>`));

  // 06 Clear space + minimum size. Logo 130 mm wide → height 29.64 mm; X (height of L) = 17.6 mm.
  const W = 130, H = (W * 933.9) / 4096, X = (H * 555.1) / 933.9;
  const xBox = (s) => `<div style="position:absolute;${s};width:${X}mm;height:${X}mm;background:rgba(255,194,14,.18);border:.3mm dashed ${K.yellow};display:flex;align-items:center;justify-content:center;font-weight:600;color:${K.yellow}">X</div>`;
  const minis = [img('leedtech-primary-colour-light', '', 'width:35mm'), img('leedtech-horizontal-colour-light', '', 'width:25mm'), img('leedtech-symbol-black', '', 'height:6mm;width:auto')];
  P.push(page(T.space.k, `
  <h1>${T.space.h1}</h1>
  <p class="lead">${T.space.lead}</p>
  <div class="body">
    <div class="tile ink" style="padding:10mm">
      <div style="position:relative;width:${W + X * 2}mm;height:${H + X * 2}mm;border:.3mm dashed rgba(255,255,255,.35)">
        ${xBox('left:0;top:0')}${xBox('right:0;top:0')}${xBox('left:0;bottom:0')}${xBox('right:0;bottom:0')}
        <div style="position:absolute;left:${X}mm;top:${X}mm;width:${W}mm;outline:.25mm solid rgba(255,255,255,.2)">${img('leedtech-primary-colour-dark', 'LeedTech', `width:${W}mm;max-height:none`)}</div>
      </div>
    </div>
    <h2 style="margin-top:4mm">${T.space.minH2}</h2>
    <div class="grid g3" style="align-items:end">${minis.map((m, i) => `<div><div style="height:22mm;display:flex;align-items:flex-end">${m}</div><div class="cap">${T.space.items[i][0]}<span>${T.space.items[i][1]}</span></div></div>`).join('')}</div>
    <p class="small">${T.space.note}</p>
  </div>`));

  // 07 Colours
  const sw = (c) => `<div class="swatch"><div class="chip" style="background:${c.hex}"></div><div class="info"><strong>${esc(B.colorName(c.name))}</strong>HEX ${c.hex}<br>RGB ${c.rgb.replaceAll(' ', ' · ')}<br>CMYK ${c.cmyk.replaceAll(' ', ' · ')}<br>Pantone ${esc(c.pantone || '—')}</div></div>`;
  P.push(page(T.colours.k, `
  <h1>${T.colours.h1}</h1>
  <p class="lead">${T.colours.lead}</p>
  <div class="body" style="gap:4mm">
    <div class="grid g2" style="gap:4mm">${B.colors.map(sw).join('')}</div>
    <div class="label" style="margin-top:3mm">${T.colours.ratio}</div>
    <div class="ratio">${B.colors.filter((c) => c.ratio).map((c) => `<div style="flex:${c.ratio};background:${c.hex};color:${c.hex === '#FFFFFF' || c.hex === K.yellow ? K.ink : '#fff'}">${esc(B.colorName(c.name).split(' ')[lang === 'en' && B.colorName(c.name).includes(' ') ? 1 : 0])} ${c.ratio}%</div>`).join('')}</div>
    <div class="label" style="margin-top:3mm">${T.colours.group}</div>
    <div class="grid g2" style="gap:4mm">${B.groupColors.map(sw).join('')}</div>
  </div>`));

  // 08 Typography
  const spec = (f, w, label) => `<div class="spec"><div class="label">${label}</div>
  <div style="font-family:${f.family};font-size:22pt;font-weight:${w};margin-top:1mm">${f.family}</div>
  <div class="aa" style="font-family:${f.family};font-weight:${w}">Aa</div>
  <p style="font-family:${f.family}">${esc(f.use)}</p><p class="small" style="margin-top:2mm">${f.weights.join(' · ')} · ${f.source}</p>
  <p style="font-family:${f.family};margin-top:3mm;font-size:9pt;word-break:break-all">ABCDEFGHIJKLMNÑOPQRSTUVWXYZ<br>abcdefghijklmnñopqrstuvwxyz<br>0123456789 € $ £</p></div>`;
  const scaleStyle = ['font-family:Outfit;font-weight:700;font-size:26pt;line-height:1.1', 'font-family:Outfit;font-weight:600;font-size:15pt', 'font-family:Poppins;font-size:10pt', 'font-family:Poppins;font-weight:500;font-size:8pt;letter-spacing:.3em;text-transform:uppercase'];
  P.push(page(T.type.k, `
  <h1>${T.type.h1}</h1>
  <div class="body" style="margin-top:2mm">
    <div class="grid g2">${spec(B.fonts.primary, 600, T.type.primary)}${spec(B.fonts.secondary, 400, T.type.secondary)}</div>
    <div>${B.fonts.scale.map((s, i) => `<div class="scale-row"><span style="${scaleStyle[i]}">${T.type.sample[i]}</span><span class="small">${esc(s.role)} · ${esc(s.spec)}</span></div>`).join('')}</div>
  </div>`));

  // 09 Misuse
  const mis = [
    [img('leedtech-primary-colour-dark', '', 'max-width:62%;transform:scaleX(1.4) scaleY(.75)'), 'ink'],
    [primaryInline({ fills: { wordmark: '#E5484D', tagline: '#7CC4FF', spark: '#2E9E5B' } }), 'ink'],
    [img('leedtech-primary-colour-dark', '', 'transform:rotate(-14deg)'), 'ink'],
    [img('leedtech-primary-colour-dark', '', 'filter:drop-shadow(1.5mm 1.5mm 1mm rgba(255,194,14,.8))'), 'ink'],
    [img('leedtech-primary-white'), 'soft-light'],
    [primaryInline({ fills: DARK_FILLS, sparkShift: 700 }), 'ink'],
    [img('leedtech-primary-colour-dark'), 'busy'],
    [primaryInline({ outline: true }), 'ink'],
  ];
  const misBg = { ink: '', 'soft-light': 'style="background:#ececec"', busy: `style="background:repeating-linear-gradient(45deg,${K.yellow} 0 4mm,#9a9a9a 4mm 8mm,#e9e9e9 8mm 12mm)"` };
  P.push(page(T.misuse.k, `
  <h1>${T.misuse.h1}</h1>
  <p class="lead">${T.misuse.lead}</p>
  <div class="body"><div class="grid g2" style="row-gap:5mm">${mis.map(([m, bg], i) => `
    <div><div class="tile ${bg === 'ink' ? 'ink' : ''} no" ${misBg[bg]} style="min-height:34mm">${m}</div><div class="cap">${T.misuse.items[i]}</div></div>`).join('')}</div></div>`));

  // 10 Group architecture
  const family = [['group/lanak-colour', 'Lanak'], ['group/akilan-colour', 'Akilan'], ['group/qualis-colour', 'Qualis'], ['leedtech-primary-group', 'LeedTech']];
  P.push(page(T.group.k, `
  <h1>${T.group.h1}</h1>
  <p class="lead">${T.group.lead}</p>
  <div class="body">
    <div class="tile white big">${img('group/grupo-lanak-blue', 'Grupo Lanak', 'max-height:30mm')}</div>
    <div class="grid g2">${family.map(([f, t], i) => `<div><div class="tile white">${img(f, t)}</div><div class="cap">${t}<span>${T.group.roles[i]}</span></div></div>`).join('')}</div>
  </div>`));

  // 11 LeedTech in the group: own vs group version + lockups
  const G = T.inGroup;
  const lock = (bg, f) => `<div class="tile ${bg}" style="min-height:28mm">${img(`lockups/${f}`, 'LeedTech · Grupo Lanak')}</div>`;
  P.push(page(G.k, `
  <h1>${G.h1}</h1>
  <div class="body" style="margin-top:3mm;gap:5mm">
    <div class="grid g2">
      <div><div class="tile ink">${img('leedtech-primary-colour-dark', 'LeedTech')}</div><div class="cap">${G.own}<span>${G.ownSub}</span></div></div>
      <div><div class="tile white">${img('leedtech-primary-group', 'LeedTech')}</div><div class="cap">${G.grp}<span>${G.grpSub}</span></div></div>
    </div>
    <div class="label">${G.cobrand}</div>
    <div class="grid g2">${lock('ink', 'leedtech-grupo-lanak-cobrand-colour-dark')}${lock('white', 'leedtech-grupo-lanak-cobrand-group')}</div>
    <p style="font-size:8.5pt;font-weight:500;border-left:1mm solid ${K.yellow};padding-left:3mm">${G.pref}</p>
    <div class="label">${G.endorse}</div>
    <div class="grid g2">${lock('ink', 'leedtech-grupo-lanak-endorsement-colour-dark')}${lock('white', 'leedtech-grupo-lanak-endorsement-colour-light')}</div>
    <p class="small">${G.note}<br><span style="color:${K.ink}">${G.rule}</span></p>
  </div>`));

  // 12 Tone of voice
  P.push(page(T.voice.k, `
  <h1>${esc(B.voice.headline)}</h1>
  <p class="lead">${esc(B.voice.summary)}</p>
  <div class="body">
    <div class="points grid g2">${B.voice.words.map((w, i) => `<div class="point"><div class="n">0${i + 1}</div><h2>${w}</h2><p>${T.voice.words[i]}</p></div>`).join('')}</div>
    <div class="label" style="margin-top:4mm">${T.voice.yes}</div><div class="quote yes">“${esc(B.voice.do[0])}”</div>
    <div class="label">${T.voice.no}</div><div class="quote not">“${esc(B.voice.dont[0])}”</div>
  </div>`));

  // 13 Graphic elements
  const g = T.graphics;
  const pattern = Array.from({ length: 24 }, (_, i) => img(i % 3 === 1 ? 'leedtech-symbol-colour-dark' : 'leedtech-symbol-white', '', `height:11mm;width:auto;opacity:${i % 3 === 1 ? 1 : 0.18};transform:rotate(${(i % 4) * 90}deg)`)).join('');
  P.push(page(g.k, `
  <h1>${g.h1}</h1>
  <div class="body" style="margin-top:3mm;gap:5mm">
    <div class="grid g2">
      <div><div class="tile ink" style="overflow:hidden;min-height:48mm;padding:0">${globe({ orbit: K.yellow, cls: '' }).replace('<svg ', '<svg style="width:72mm;height:72mm;max-height:none;max-width:none;margin:-8mm -14mm -16mm auto" ')}</div>
        <div class="cap">${g.globe}<span>${g.globeSub}</span></div></div>
      <div><div class="tile ink" style="min-height:48mm;display:grid;grid-template-columns:repeat(6,1fr);gap:3mm;justify-items:center">${pattern}</div>
        <div class="cap">${g.pattern}<span>${g.patternSub}</span></div></div>
    </div>
    <div><div class="tile ink" style="min-height:30mm;justify-content:flex-start;padding:8mm 10mm"><div><div class="bar" style="margin-bottom:4mm"></div><div style="font-family:Outfit;font-weight:700;font-size:20pt;color:#fff">${g.accentHtml}</div></div></div>
      <div class="cap">${g.accent}<span>${g.accentSub}</span></div></div>
    <div><h2>${g.photo}</h2><p>${g.photoText}</p>
      <div class="grid g4" style="margin-top:3mm">${g.tiles.map((t) => `<div class="tile surface" style="min-height:22mm;padding:3mm;align-items:flex-end;justify-content:flex-start;color:#fff;font-weight:500">${t}</div>`).join('')}</div></div>
  </div>`));

  // 14 Applications: business card, email signature, letter + envelope
  const A = T.apps, C = B.contact;
  // Card previews come from scripts/docs/leedtech-stationery.mjs (run it before the guide).
  const prev = (v, cap) => `<div><img src="../stationery/business-card-${v}-${lang}-preview.png" alt="${cap}" style="width:76%;border-radius:2mm"><div class="cap">${cap}</div></div>`;
  P.push(page(A.k, `
  <h1>${A.h1}</h1>
  <div class="body" style="margin-top:3mm;gap:3mm">
    ${prev('cobrand', A.cardCo)}
    ${prev('standard', A.cardStd)}
    <div class="label" style="margin-top:2mm">${A.sigCo}</div>
    <div class="tile white" style="justify-content:flex-start;padding:6mm 7mm;min-height:0">
      <div style="font-size:8pt;line-height:1.6">${img('lockups/leedtech-grupo-lanak-cobrand-colour-light', '', 'width:62mm;max-height:none')}
        <div style="width:10mm;border-top:.8mm solid ${K.yellow};margin:3mm 0 2mm"></div>
        <b style="font-family:Outfit;font-size:11pt">${A.name}</b><br>${A.role} · LeedTech<br><span class="small">${esc(C.phone)} · ${esc(C.email)} · leedtech.es</span></div>
    </div>
    <div class="label" style="margin-top:3mm">${A.letter}</div>
    <table><tr><th>${A.th[0]}</th><th>${A.th[1]}</th></tr>
      <tr><td>${A.letterRow}</td><td>${A.letterText} ${esc(C.phone)} · ${esc(C.email)} · ${A.endorse}</td></tr>
      <tr><td>${A.envRow}</td><td>${A.envText} ${esc(C.address)}</td></tr></table>
    <p class="small">${A.files}</p>
  </div>`));

  // 15 Icons, social, downloads
  const I = T.icons;
  const folders = ['<code>logo/svg</code> · <code>logo/png</code>', '<code>logo/svg/lockups</code>', '<code>logo/svg/group</code>', '<code>icons</code>', '<code>social</code>', '<code>profile</code>', '<code>stationery</code>'];
  P.push(page(I.k, `
  <h1>${I.h1}</h1>
  <div class="body" style="margin-top:3mm;gap:5mm">
    <div style="display:flex;gap:6mm;align-items:flex-end">
      ${[[64, 'favicon.svg'], [90, 'apple-touch-icon.png'], [110, 'icon-512.png']].map(([s, f], i) => `<div><img src="../icons/${f}" alt="${I.items[i]}" style="width:${s * 0.25}mm;height:${s * 0.25}mm;border-radius:${f === 'favicon.svg' ? 0 : 3}mm"><div class="cap">${I.items[i]}</div></div>`).join('')}
      <div><img src="../social/avatar-dark-400.png" alt="${I.avatar}" style="width:28mm;border-radius:50%"><div class="cap">${I.avatar}</div></div>
      <div><img src="../social/avatar-yellow-400.png" alt="${I.avatarAlt}" style="width:28mm;border-radius:50%"><div class="cap">${I.avatarAlt}</div></div>
    </div>
    <div><img src="../social/og-image-1200x630-cobrand-${lang}.png" alt="${I.og}" style="width:100%;border-radius:3mm"><div class="cap">${I.og}</div></div>
    <div class="label">${I.downloads}</div>
    <table><tr><th>${I.th[0]}</th><th>${I.th[1]}</th></tr>${folders.map((f, i) => `<tr><td>${f}</td><td>${I.rows[i]}</td></tr>`).join('')}</table>
  </div>`));

  // 16 Back cover
  P.push(page(T.back.k, `
  <div class="deco" style="left:-70mm;bottom:-60mm;width:200mm;height:200mm">${globe({ orbit: K.yellow, cls: '' })}</div>
  <div style="margin:auto;text-align:center;position:relative;display:flex;flex-direction:column;align-items:center;gap:10mm">
    ${img('leedtech-vertical-colour-dark', 'LeedTech', 'width:90mm')}
    <p style="color:#bbb">${esc(C.phone)} · ${esc(C.email)} · leedtech.es</p>
    ${endorsed(11)}
  </div>`, { dark: true, plain: true }));

  if (n !== TOTAL) throw new Error(`expected ${TOTAL} pages, built ${n}`);
  const other = lang === 'es' ? ['index.en.html', 'English'] : ['index.html', 'Español'];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${T.title}</title>
<link rel="icon" href="../icons/favicon.svg" type="image/svg+xml">
<link rel="alternate" hreflang="${lang === 'es' ? 'en' : 'es'}" href="${other[0]}">
<link rel="stylesheet" href="../../../assets/guide.css">
<style>${fontFaces('../../../assets')}
:root{--ink:${K.ink};--paper:#FFFFFF;--accent:${K.yellow};--muted:${K.grey};--surface:${K.graphite};--soft:#F3F3F1}
.tile.blue{background:${K.blue}}
.lang{position:fixed;top:4mm;right:4mm;z-index:9;background:#111;color:#fff;font-size:9pt;padding:2mm 4mm;border-radius:5mm;text-decoration:none}
@media print{.lang{display:none}}</style></head><body>
<a class="lang" href="${other[0]}">${other[1]}</a>
${P.join('\n')}
</body></html>`;
}

fs.rmSync(path.join(dir, 'guide/leedtech-brand-guidelines.pdf'), { force: true });
for (const lang of BASE.languages) {
  const out = path.join(dir, `guide/${lang === 'es' ? 'index' : `index.${lang}`}.html`);
  writeFile(out, build(lang));
  printPdf(out, path.join(dir, `guide/leedtech-brand-guidelines-${lang}.pdf`));
  console.log(`Guide (${lang}) written: ${TOTAL} portrait pages (HTML + PDF)`);
}
