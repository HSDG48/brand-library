// QRflick brand guide: portrait A4 pages, one web page + one PDF per language.
// Words live in qrflick-guide-text.mjs. Run after qrflick-stationery.mjs and qrflick-social.mjs:
//   node scripts/docs/qrflick-guide.mjs   (from brand-library/)
import fs from 'node:fs';
import path from 'node:path';
import { loadBrand, fontFaces, writeFile, printPdf, esc } from './common.mjs';
import { markMarkup, MODULE_H } from '../lib/qrflick.mjs';
import { TEXT, localBrand } from './qrflick-guide-text.mjs';

const { dir, brand: BASE, hex } = loadBrand('qrflick');
const K = Object.fromEntries(BASE.colors.map((c) => [c.name.replace(' ', ''), c.hex])); // Teal, TealDeep, TealGlow, Ink, …
const L = (name) => `../logo/svg/${name}.svg`;
const img = (name, alt = '', style = '') => `<img src="${L(name)}" alt="${esc(alt)}"${style ? ` style="${style}"` : ''}>`;
const mark = (colour, style) => `<svg viewBox="0 0 100 100" style="${style}" aria-hidden="true">${markMarkup(colour)}</svg>`;
const svgText = (f) => fs.readFileSync(path.join(dir, 'logo/svg', f + '.svg'), 'utf8').replace(/<title>.*?<\/title>/, '');
const TOTAL = 15;
// Horizontal logo proportions (from the built SVG viewBox): width / height.
const H_RATIO = (() => { const m = svgText('qrflick-horizontal-colour-light').match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); return m[1] / m[2]; })();

function build(lang) {
  const T = TEXT[lang];
  const B = localBrand(BASE, lang);
  const WEB = B.website.replace('https://', '');
  let n = 0;
  const page = (kicker, inner, { dark = false, plain = false } = {}) => {
    n += 1;
    const num = String(n).padStart(2, '0');
    const head = plain ? '' : `<div class="kicker"><b>${num}</b>${esc(kicker)}<span class="brand">QRflick</span></div>`;
    const foot = plain ? '' : `<div class="foot"><span>${T.foot}</span><span>${num} / ${TOTAL}</span></div>`;
    return `<section class="page${dark ? ' dark' : ''}" aria-label="${esc(kicker)}">${head}${inner}${foot}</section>`;
  };
  const P = [];

  // 01 Cover
  P.push(page(T.cover.k, `
  <div style="display:flex;justify-content:space-between;align-items:center">${img('qrflick-horizontal-colour-dark', 'QRflick', 'height:9mm')}<span class="small" style="color:#9aa3a5;font-weight:700">${T.cover.version}</span></div>
  ${mark(K.TealGlow, 'width:78mm;height:78mm;margin:44mm auto 0')}
  <div style="margin-top:auto">
    <div class="label" style="color:${K.TealGlow}">${T.cover.label} · QRflick</div>
    <h1 style="font-size:44pt;margin:4mm 0 5mm;color:${K.Snow}">${esc(B.tagline).replace('. ', '.<br>')}</h1>
    <p class="lead" style="color:#aab2b4;max-width:120mm">${T.cover.sub}</p>
  </div>`, { dark: true, plain: true }));

  // 02 Contents
  P.push(page(T.toc.k, `
  <h1>${T.toc.h1}</h1>
  <div class="body" style="gap:0">${T.toc.items.map((t, i) => `<div class="scale-row" style="grid-template-columns:14mm 1fr"><span class="accent" style="font-weight:800">${String(i + 3).padStart(2, '0')}</span><span style="font-size:14pt;font-weight:700;letter-spacing:-.01em">${t}</span></div>`).join('')}</div>`));

  // 03 The idea
  P.push(page(T.idea.k, `
  <h1>${T.idea.h1}</h1>
  <p class="lead">${esc(B.description)}</p>
  <div class="body">
    <div class="grid g3">${B.pillars.map((p) => `<div class="card"><div class="label accent">${esc(p.name)}</div><h2 style="margin-top:2mm">${esc(p.title)}</h2><p class="small">${esc(p.text)}</p></div>`).join('')}</div>
    <div style="margin-top:auto"><div class="rule"></div><div class="label">${T.idea.taglines}</div>
      ${BASE.taglines.map((t, i) => `<div class="scale-row" style="grid-template-columns:1fr 1fr"><span style="font-size:15pt;font-weight:800;letter-spacing:-.02em;line-height:1.15">${esc(t)}</span><span style="color:${K.Slate}">${esc(BASE.i18n.en.taglines[i])}</span></div>`).join('')}</div>
  </div>`));

  // 04 Logo
  const G = T.logo;
  const tiles = [['white', img('qrflick-horizontal-colour-light', 'QRflick')], ['night', img('qrflick-horizontal-colour-dark', 'QRflick')], ['teal', img('qrflick-horizontal-white', 'QRflick')],
    ['soft', `<div style="display:flex;gap:7mm;align-items:center">${img('qrflick-mark-colour-light', '', 'height:20mm')}${img('qrflick-app-icon', '', 'height:20mm')}</div>`]];
  P.push(page(G.k, `
  <h1>${G.h1}</h1>
  <p class="lead">${G.lead}</p>
  <div class="body">
    <div class="grid g2">${tiles.map(([bg, m], i) => `<div><div class="tile ${bg}" style="min-height:44mm">${m}</div><div class="cap">${G.tiles[i][0]}<span>${G.tiles[i][1]}</span></div></div>`).join('')}</div>
    <div class="points grid g4">${G.parts.map(([h, p], i) => `<div class="point"><div class="n">${'ABCD'[i]}</div><h2>${h}</h2><p class="small" style="color:inherit">${p}</p></div>`).join('')}</div>
    <p class="note">${G.name}</p>
  </div>`));

  // 05 Versions
  const files = [['qrflick-horizontal-colour-light', 'white'], ['qrflick-stacked-colour-light', 'white'], ['qrflick-wordmark-colour-light', 'white'], ['qrflick-mark-colour-light', 'white'],
    ['qrflick-horizontal-colour-dark', 'night'], ['qrflick-horizontal-deep', 'white'], ['qrflick-horizontal-ink', 'white'], ['qrflick-horizontal-white', 'teal']];
  P.push(page(T.variations.k, `
  <h1>${T.variations.h1}</h1>
  <p class="lead">${T.variations.lead}</p>
  <div class="body"><div class="grid g2" style="row-gap:4mm">${files.map(([f, bg], i) => { const [t, s] = T.variations.items[i]; return `
    <div><div class="tile ${bg}" style="min-height:34mm;padding:7mm">${img(f, t, 'max-height:18mm')}</div><div class="cap">${t}<span>${s}</span></div></div>`; }).join('')}
  </div></div>`));

  // 06 Clear space. Logo W mm wide; mark height 96 units = logo height; X = 2 × module (21 units).
  const W = 120, H = W / H_RATIO, X = (2 * MODULE_H * H) / 96;
  const xBox = (s) => `<div style="position:absolute;${s};width:${X}mm;height:${X}mm;background:rgba(7,154,150,.12);border:.3mm dashed ${K.Teal};display:flex;align-items:center;justify-content:center;font-weight:800;color:${K.TealDeep}">X</div>`;
  P.push(page(T.space.k, `
  <h1>${T.space.h1}</h1>
  <p class="lead">${T.space.lead}</p>
  <div class="body">
    <div class="tile soft" style="padding:10mm">
      <div style="position:relative;width:${W + X * 2}mm;height:${H + X * 2}mm;border:.3mm dashed ${K.Slate}">
        ${xBox('left:0;top:0')}${xBox('right:0;top:0')}${xBox('left:0;bottom:0')}${xBox('right:0;bottom:0')}
        <div style="position:absolute;left:${X}mm;top:${X}mm;width:${W}mm;outline:.25mm solid rgba(0,0,0,.12)">${img('qrflick-horizontal-colour-light', 'QRflick', `width:${W}mm;max-height:none`)}</div>
      </div>
    </div>
    <h2 style="margin-top:4mm">${T.space.minH2}</h2>
    <div class="grid g3" style="align-items:end">
      <div><div style="height:16mm;display:flex;align-items:flex-end">${img('qrflick-horizontal-colour-light', '', 'width:24mm')}</div><div class="cap">${T.space.items[0][0]}<span>${T.space.items[0][1]}</span></div></div>
      <div><div style="height:16mm;display:flex;align-items:flex-end">${img('qrflick-mark-deep', '', 'width:6mm')}</div><div class="cap">${T.space.items[1][0]}<span>${T.space.items[1][1]}</span></div></div>
    </div>
    <p class="note">${T.space.note}</p>
  </div>`));

  // 07 Misuse
  const light = svgText('qrflick-horizontal-colour-light');
  const recolour = light.replaceAll(K.Teal, '#E5484D').replace(`fill="${K.Ink}"`, 'fill="#7C5CFF"');
  const outline = light.replace(/fill="#1F2629"/, 'fill="none" stroke="#1F2629" stroke-width="1.2"').replaceAll('stroke="#079A96"', 'stroke="#079A96" stroke-opacity="0" ').replace(/<g><path id="frame"/, '<g style="display:none"><path id="frame"');
  const retype = `<div style="display:flex;align-items:center;gap:3mm">${img('qrflick-mark-colour-light', '', 'height:13mm')}<span style="font-family:Georgia,serif;font-size:21pt;font-weight:400">QR Flick</span></div>`;
  const mis = [
    [img('qrflick-horizontal-colour-light', '', 'max-width:60%;transform:scaleX(1.45) scaleY(.7)'), 'white'],
    [recolour.replace('<svg ', '<svg style="max-height:15mm;width:100%" '), 'white'],
    [img('qrflick-horizontal-colour-light', '', 'max-height:15mm;transform:rotate(-14deg)'), 'white'],
    [img('qrflick-horizontal-colour-light', '', 'max-height:15mm;filter:drop-shadow(1.5mm 1.5mm 1mm rgba(7,154,150,.7))'), 'gradient'],
    [img('qrflick-horizontal-colour-light', '', 'max-height:15mm'), 'teal'],
    [outline.replace('<svg ', '<svg style="max-height:15mm;width:100%" '), 'white'],
    [retype, 'white'],
    [img('qrflick-horizontal-colour-light', '', 'max-height:15mm'), 'busy'],
  ];
  const misBg = { white: '', teal: `style="background:${K.Teal}"`, gradient: `style="background:linear-gradient(135deg,${K.TealMist},#fff)"`,
    busy: `style="background:repeating-linear-gradient(60deg,#8a6f55 0 5mm,#c9a77f 5mm 9mm,#3f4a3c 9mm 14mm,#e8d9c4 14mm 18mm)"` };
  P.push(page(T.misuse.k, `
  <h1>${T.misuse.h1}</h1>
  <p class="lead">${T.misuse.lead}</p>
  <div class="body"><div class="grid g2" style="row-gap:5mm">${mis.map(([m, bg], i) => `
    <div><div class="tile ${bg === 'white' ? 'white' : ''} no" ${misBg[bg]} style="min-height:33mm">${m}</div><div class="cap">${T.misuse.items[i]}</div></div>`).join('')}</div></div>`));

  // 08 Colour
  const C = (name) => BASE.colors.find((c) => c.name === name);
  const big = (name, flex, fg) => { const c = C(name); return `<div class="swatch-big" style="flex:${flex};background:${c.hex};color:${fg}"><b>${name}</b><span>${c.hex} · RGB ${c.rgb}</span><span>CMYK ${c.cmyk} · Pantone ${c.pantone}</span><span class="u">${esc(c.use)}</span></div>`; };
  const chip = (name) => { const c = C(name); return `<div><div style="height:15mm;border-radius:2.5mm;background:${c.hex};border:.25mm solid ${K.Line}"></div><div class="cap">${name}<span>${c.hex}<br>${esc(c.use)}</span></div></div>`; };
  P.push(page(T.colour.k, `
  <h1>${T.colour.h1}</h1>
  <p class="lead">${T.colour.lead}</p>
  <div class="body" style="gap:5mm">
    <div style="display:flex;gap:4mm">${big('Teal', 2, '#fff')}${big('Teal Deep', 1.1, '#fff')}${big('Teal Glow', 1.1, K.Ink)}</div>
    <div class="label">${T.colour.neutrals}</div>
    <div class="grid" style="grid-template-columns:repeat(6,1fr);gap:3mm">${['Ink', 'Slate', 'Line', 'Paper', 'Night', 'Snow'].map(chip).join('')}</div>
    <div class="label">${T.colour.extras}</div>
    <div class="grid g3" style="gap:3mm">${['Teal Mist', 'Amber', 'Red'].map(chip).join('')}</div>
    <div class="label">${T.colour.ratio}</div>
    <div class="ratio">${BASE.colors.filter((c) => c.ratio).sort((a, b) => b.ratio - a.ratio).map((c) => `<div style="flex:${c.ratio};background:${c.hex};color:${c.name === 'Paper' ? K.Ink : '#fff'}">${c.name} ${c.ratio}%</div>`).join('')}</div>
    <div class="grid g3" style="margin-top:auto">${T.colour.notes.map(([h, p]) => `<div><b style="font-size:9pt">${h}</b><p class="small" style="margin-top:1mm">${p}</p></div>`).join('')}</div>
  </div>`));

  // 09 Typography
  const F = B.fonts.primary;
  P.push(page(T.type.k, `
  <h1>${T.type.h1}</h1>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:.6mm solid ${K.Ink};padding-bottom:4mm">
    <div style="font-size:100pt;font-weight:800;letter-spacing:-.05em;line-height:.85">Aa</div>
    <div style="text-align:right"><div style="font-size:22pt;font-weight:800;letter-spacing:-.02em">${F.family}</div>
      <p class="small">${T.type.free} · ${F.weights.join(' ')}<br>${T.type.fallback}: ${F.fallback}</p></div>
  </div>
  <p style="margin-top:4mm;max-width:150mm">${esc(F.use)}</p>
  <div class="body" style="margin-top:4mm;gap:0">${B.fonts.scale.map((s, i) => `<div class="scale-row" style="grid-template-columns:34mm 1fr;align-items:center"><span class="small"><b style="color:${K.Ink}">${esc(s.role)}</b><br>${esc(s.spec.replace('Archivo ', ''))}</span>
    ${i === 4 ? `<span><span style="${s.css};display:inline-block;background:${K.TealDeep};color:#fff;border-radius:6mm;padding:2.6mm 7mm">${T.type.sample[i]}</span></span>` : `<span style="${s.css}${i === 2 ? `;color:${K.TealDeep}` : ''}">${T.type.sample[i]}</span>`}</div>`).join('')}
    <div class="grid g3" style="margin-top:auto">${T.type.rules.map(([h, p]) => `<div><b style="font-size:9pt">${h}</b><p class="small" style="margin-top:1mm">${p}</p></div>`).join('')}</div>
  </div>`));

  // 10 Voice
  const V = B.voice;
  P.push(page(T.voice.k, `
  <h1>${esc(V.headline)}</h1>
  <p class="lead">${esc(V.summary)}</p>
  <div class="body">
    <div class="grid g3">${V.words.map((w, i) => `<div class="card outline"><div style="font-size:22pt;font-weight:800;color:${K.Teal}">${i + 1}</div><h2>${esc(w)}</h2><p class="small">${esc(V.wordsText[i])}</p></div>`).join('')}</div>
    <div><div class="rule"></div>
      <div class="scale-row" style="grid-template-columns:1fr 1fr;padding-top:0"><span class="label accent">${T.voice.yes}</span><span class="label" style="color:${K.Red}">${T.voice.no}</span></div>
      ${V.do.map((d, i) => `<div class="scale-row" style="grid-template-columns:1fr 1fr"><b style="font-size:10pt">${esc(d)}</b><span style="color:${K.Slate};font-size:10pt">${esc(V.dont[i])}</span></div>`).join('')}</div>
    <div class="grid g2" style="margin-top:auto"><div><b style="font-size:9pt">${T.voice.use}</b><p class="small" style="margin-top:1mm">${esc(V.use)}</p></div><div><b style="font-size:9pt">${T.voice.avoid}</b><p class="small" style="margin-top:1mm">${esc(V.avoid)}</p></div></div>
  </div>`));

  // 11 Imagery and video
  const I = T.imagery;
  P.push(page(I.k, `
  <h1>${I.h1}</h1>
  <p class="lead">${I.lead}</p>
  <div class="body">
    <div class="grid g3">${I.photos.map((p) => `<div class="tile soft" style="min-height:44mm;align-items:flex-end;justify-content:flex-start;padding:4mm;font-size:8pt;font-weight:700;color:${K.Slate}">${p}</div>`).join('')}</div>
    <div><h2>${I.recipeH}</h2><div class="rule" style="margin-top:3mm"></div>
      ${I.recipe.map(([h, p], i) => `<div class="scale-row" style="grid-template-columns:10mm 1fr"><span style="font-size:13pt;font-weight:800;color:${K.Teal}">${i + 1}</span><span><b>${h}</b> ${p}</span></div>`).join('')}</div>
    <div class="grid g3" style="margin-top:auto">${I.notes.map(([h, p]) => `<div><b style="font-size:9pt">${h}</b><p class="small" style="margin-top:1mm">${p}</p></div>`).join('')}</div>
  </div>`));

  // 12 Content pillars + UTM
  const N = T.content;
  P.push(page(N.k, `
  <h1>${N.h1}</h1>
  <div class="body" style="margin-top:4mm;gap:3mm">
    ${N.pillars.map(([h, p], i) => `<div class="pillar${i === 0 ? ' first' : ''}"><span class="pn">${i + 1}</span><b>${h}</b><span>${p}</span></div>`).join('')}
    <h2 style="margin-top:5mm">${N.utmH}</h2>
    <div class="code">${WEB}/?utm_source=<i>instagram</i>&amp;utm_medium=<i>social</i>&amp;utm_campaign=<i>w04-menu</i></div>
    <div class="grid g3">${N.utm.map(([h, p]) => `<div><b style="font-size:9pt">${h}</b><p class="small" style="margin-top:1mm">${p}</p></div>`).join('')}</div>
  </div>`));

  // 13 Stationery. Card previews come from qrflick-stationery.mjs (run it before the guide).
  const A = T.apps, CT = B.contact;
  P.push(page(A.k, `
  <h1>${A.h1}</h1>
  <div class="body" style="margin-top:3mm;gap:3mm">
    <div class="label">${A.card}</div>
    <img src="../stationery/business-card-${lang}-preview.png" alt="${A.card}" style="width:100%;border-radius:2mm">
    <div class="label" style="margin-top:3mm">${A.sig}</div>
    <div class="tile white" style="justify-content:flex-start;padding:6mm 7mm;min-height:0;gap:5mm">
      ${img('qrflick-mark-colour-light', '', 'height:14mm;width:auto;max-height:none')}
      <div style="border-left:.6mm solid ${K.Teal};padding-left:5mm;font-size:9pt;line-height:1.55"><b style="font-size:11pt;font-weight:800">${A.name}</b><br><span style="color:${K.Slate}">${A.role}</span><br>
        <span style="color:${K.TealDeep}">${esc(CT.email)} · <b>${WEB}</b></span><br><span class="small">${esc(B.tagline)} · ${esc(BASE.endorsement[lang])}</span></div>
    </div>
    <div class="label" style="margin-top:3mm">${A.letter}</div>
    <table><tr><th>${A.th[0]}</th><th>${A.th[1]}</th></tr>
      <tr><td>${A.letterRow}</td><td>${A.letterText} ${esc(CT.email)} · ${WEB} · ${esc(BASE.endorsement[lang])}</td></tr></table>
    <p class="small">${A.files}</p>
  </div>`));

  // 14 Icons, social, downloads
  const IC = T.icons;
  const folders = ['<code>logo/svg</code> · <code>logo/png</code>', '<code>icons</code>', '<code>social</code>', '<code>profile</code>', '<code>stationery</code>'];
  P.push(page(IC.k, `
  <h1>${IC.h1}</h1>
  <div class="body" style="margin-top:3mm;gap:5mm">
    <div style="display:flex;gap:6mm;align-items:flex-end">
      ${[[64, 'favicon.svg'], [90, 'apple-touch-icon.png'], [110, 'icon-512.png']].map(([s, f], i) => `<div><img src="../icons/${f}" alt="${IC.items[i]}" style="width:${s * 0.25}mm;height:${s * 0.25}mm;border-radius:${f === 'favicon.svg' ? 0 : 3}mm"><div class="cap">${IC.items[i]}</div></div>`).join('')}
      ${['teal', 'dark'].map((a, i) => `<div><img src="../social/avatar-${a}-400.png" alt="${IC.avatars[i]}" style="width:28mm;border-radius:50%"><div class="cap">${IC.avatars[i]}</div></div>`).join('')}
    </div>
    <div><img src="../social/og-image-1200x630-${lang}.png" alt="${IC.og}" style="width:100%;border-radius:3mm"><div class="cap">${IC.og}</div></div>
    <div class="label">${IC.downloads}</div>
    <table><tr><th>${IC.th[0]}</th><th>${IC.th[1]}</th></tr>${folders.map((f, i) => `<tr><td>${f}</td><td>${IC.rows[i]}</td></tr>`).join('')}</table>
  </div>`));

  // 15 Back cover
  const socials = Object.values(B.socials).filter(Boolean).map((u) => u.replace(/^https:\/\/(www\.)?/, ''));
  P.push(page(T.back.k, `
  <div style="margin:auto;text-align:center;display:flex;flex-direction:column;align-items:center;gap:9mm">
    ${img('qrflick-stacked-colour-dark', 'QRflick', 'width:70mm')}
    <p style="font-size:16pt;font-weight:800;letter-spacing:-.02em;color:${K.Snow}">${esc(B.tagline)}</p>
    <p style="color:#9aa3a5">${WEB} · ${esc(CT.email)}<br>${socials.join(' · ')}</p>
    <p class="label" style="color:${K.TealGlow}">${esc(BASE.endorsement[lang])} · ${BASE.parent.website.replace('https://', '')}</p>
  </div>`, { dark: true, plain: true }));

  if (n !== TOTAL) throw new Error(`expected ${TOTAL} pages, built ${n}`);
  const other = lang === 'es' ? ['index.en.html', 'English'] : ['index.html', 'Español'];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${T.title}</title>
<link rel="icon" href="../icons/favicon.svg" type="image/svg+xml">
<link rel="alternate" hreflang="${lang === 'es' ? 'en' : 'es'}" href="${other[0]}">
<link rel="stylesheet" href="../../../assets/guide.css">
<style>${fontFaces('../../../assets', 'qrflick')}
:root{--ink:${K.Ink};--paper:#FFFFFF;--accent:${K.TealDeep};--muted:${K.Slate};--surface:${K.Night};--soft:${K.Paper}}
body,h1,h2,.swatch .info strong{font-family:Archivo,'Helvetica Neue',Arial,sans-serif}
h1{font-weight:800;letter-spacing:-.03em;font-size:31pt;line-height:1.04}h2{font-weight:800;letter-spacing:-.015em;font-size:12.5pt}
.page.dark{background:${K.Night}}.kicker,.label{font-weight:700;letter-spacing:.14em}.kicker .brand{margin-left:auto}
.lead{opacity:1;color:#3b4548}.dark .lead{color:#aab2b4}.point{border-top-color:${K.Teal}}.bar{background:${K.Teal}}
.tile.white{border-color:${K.Line}}.tile.night{background:${K.Night}}.tile.teal{background:${K.Teal}}.tile.soft{background:${K.Paper}}
.card{background:${K.Paper};border-radius:4mm;padding:5mm}.card.outline{background:#fff;border:.45mm solid ${K.Ink}}
.rule{border-top:.7mm solid ${K.Ink};margin-bottom:3mm}.note{font-size:9pt;border-left:1mm solid ${K.Teal};padding-left:3mm}
.scale-row{border-color:${K.Line}}
.swatch-big{border-radius:4mm;min-height:52mm;padding:5mm;display:flex;flex-direction:column;justify-content:flex-end;font-size:7.5pt;line-height:1.45}
.swatch-big b{font-size:15pt;font-weight:800;letter-spacing:-.02em}.swatch-big .u{margin-top:1.5mm;opacity:.9}
.ratio{border-color:${K.Line}}
.pillar{display:grid;grid-template-columns:10mm 40mm 1fr;align-items:center;gap:3mm;background:${K.Paper};border-radius:3.5mm;padding:4.5mm 5mm;font-size:9pt}
.pillar b{font-size:11pt}.pillar .pn{font-size:15pt;font-weight:800;color:${K.TealDeep}}.pillar.first{background:${K.Teal};color:#fff}.pillar.first .pn{color:#fff}
.code{background:${K.Night};color:${K.Snow};border-radius:3.5mm;padding:5mm;font-family:Consolas,monospace;font-size:8.5pt}.code i{font-style:normal;color:${K.TealGlow}}
code{font-family:Consolas,monospace;font-size:.9em}
.lang{position:fixed;top:4mm;right:4mm;z-index:9;background:${K.Night};color:#fff;font-size:9pt;padding:2mm 4mm;border-radius:5mm;text-decoration:none}
@media print{.lang{display:none}}</style></head><body>
<a class="lang" href="${other[0]}">${other[1]}</a>
${P.join('\n')}
</body></html>`;
}

for (const lang of BASE.languages) {
  const out = path.join(dir, `guide/${lang === 'es' ? 'index' : `index.${lang}`}.html`);
  writeFile(out, build(lang));
  printPdf(out, path.join(dir, `guide/qrflick-brand-guidelines-${lang}.pdf`));
  console.log(`Guide (${lang}) written: ${TOTAL} portrait pages (HTML + PDF)`);
}
