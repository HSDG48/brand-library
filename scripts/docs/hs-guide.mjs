// HS family brand guides: 16 portrait A4 pages per brand and language (web page + PDF).
// UI words live in hs-guide-text.mjs; brand words come from brand.json.
// Run after build-hs, icons-hs, hs-social and hs-stationery: node scripts/docs/hs-guide.mjs [slug ...]
import fs from 'node:fs';
import path from 'node:path';
import { writeFile, printPdf, esc } from './common.mjs';
import { FAMILY } from '../lib/hs.mjs';
import { loadHs, copyOf, web, markSvg, leaf, headline, baseCss, acc, accText } from './hs-common.mjs';
import { GT } from './hs-guide-text.mjs';

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : FAMILY;
const PARENT = loadHs('hs-digital');
const TOTAL = 16;

// WCAG contrast ratio between two hex colours.
const lum = (h) => { let c = h.replace('#', ''); if (c.length === 3) c = c.split('').map((d) => d + d).join(''); c = c.match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

function build(H, lang) {
  const { brand: B, K, isParent, slug } = H, T = copyOf(B, lang), G = GT[lang], C = B.contact;
  const L = (n) => `../logo/svg/${slug}-${n}.svg`;
  const img = (n, style = '', alt = '') => `<img src="${L(n)}" alt="${esc(alt)}"${style ? ` style="${style}"` : ''}>`;
  const svgText = (n) => fs.readFileSync(path.join(H.dir, 'logo/svg', `${slug}-${n}.svg`), 'utf8').replace(/<title>.*?<\/title>/, '');
  const ACC = acc(K), ACC7 = accText(K), MOTIF = B.motif?.type || 'plain';
  const head = (txt, light = true) => headline(txt, T.promiseMark, MOTIF, light ? (MOTIF === 'plain' || MOTIF === 'code' ? ACC7 : ACC) : ACC, { dark: !light });
  const colourBy = (role) => B.colors.find((c) => c.role === role);
  let n = 0;
  const page = (kicker, inner, { dark = false, plain = false } = {}) => {
    n += 1;
    const num = String(n).padStart(2, '0');
    const top = plain ? '' : `<div class="kicker"><b>${num}</b>${esc(kicker)}<span class="brand">${esc(B.name)}</span></div>`;
    const foot = plain ? '' : `<div class="foot"><span>${G.foot(B.name)}</span><span>${num} / ${TOTAL}</span></div>`;
    return `<section class="page${dark ? ' dark' : ''}" aria-label="${esc(kicker)}">${top}${inner}${foot}</section>`;
  };
  const P = [];
  const sections = [G.idea.k, G.logo.k, isParent ? G.arch.k : G.family.k, G.versions.k, G.space.k, G.misuse.k, G.colour.k, G.type.k, G.motif.k, G.voice.k, G.words.k, G.apps.k, G.icons.k];
  const logoWhite = isParent ? 'horizontal-white' : `endorsed-${lang}-white`;
  const logoColour = isParent ? 'horizontal-colour' : `endorsed-${lang}-colour`;

  // 01 Cover
  const coverBox = 'right:-48mm;bottom:-40mm;width:190mm;height:190mm';
  P.push(page(G.cover, `${leaf('top', '#ffffff', coverBox, 0.06)}${leaf('bottom', K.blue, coverBox, 0.5)}
  <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative">${img(logoWhite, 'height:15mm', B.name)}<span class="small" style="color:#B9C9DD;font-weight:700">${G.version}</span></div>
  <div style="margin-top:auto;position:relative">
    <div class="label" style="color:${ACC}">${G.cover} · ${esc(B.name)}</div>
    <h1 style="font-size:40pt;margin:5mm 0 6mm;color:#fff;max-width:165mm">${head(T.promise, false)}</h1>
    <p class="lead" style="color:#C9D6E6;max-width:125mm">${esc(T.positioning)}</p>
  </div>`, { dark: true, plain: true }));

  // 02 Contents
  P.push(page(G.toc, `<h1>${G.tocH}</h1>
  <div class="body" style="gap:0">${sections.map((t, i) => `<div class="scale-row" style="grid-template-columns:14mm 1fr"><span style="font-weight:800;color:${ACC7}">${String(i + 3).padStart(2, '0')}</span><span class="d" style="font-size:14pt;font-weight:700;letter-spacing:-.01em">${esc(t)}</span></div>`).join('')}</div>`));

  // 03 The idea
  P.push(page(G.idea.k, `<h1>${head(T.promise)}</h1>
  <p class="lead">${esc(T.positioning)}</p>
  <div class="body">
    <div class="grid g3">${T.pillars.map((p) => `<div class="card"><div class="label" style="color:${ACC7}">${esc(p.name)}</div><h2 style="margin-top:2mm">${esc(p.title)}</h2><p class="small">${esc(p.text)}</p></div>`).join('')}</div>
    ${T.problem ? `<div class="card outline" style="display:grid;grid-template-columns:1fr 1fr;gap:6mm;align-items:center"><div><div class="label">${G.idea.problem}</div><h2 style="margin-top:2mm;font-size:14pt">${esc(T.problem.title)}</h2></div>
      <div>${T.problem.points.map((p) => `<p class="small" style="color:${K.ink}">✕&nbsp; ${esc(p)}</p>`).join('')}<p style="margin-top:1.5mm;font-weight:800;color:${ACC7}">→ ${esc(T.problem.answer)}</p></div></div>` : ''}
    <div class="grid g2"><div><div class="label">${G.idea.personality}</div><div class="chips">${T.personality.map((s) => `<span>${esc(s)}</span>`).join('')}</div></div>
      <div><div class="label">${G.idea.not}</div><div class="chips not">${T.not.map((s) => `<span>${esc(s)}</span>`).join('')}</div></div></div>
    <div style="margin-top:auto"><div class="rule"></div><div class="label">${G.idea.taglines}</div>
      ${T.taglines.map((t) => `<div class="scale-row" style="grid-template-columns:1fr"><span class="d" style="font-size:14pt;font-weight:800;letter-spacing:-.02em;line-height:1.2">${esc(t)}</span></div>`).join('')}</div>
  </div>`));

  // 04 Logo
  const onBrand = isParent ? ['blue', 'horizontal-white', K.blue] : ['accent', 'horizontal-accent', K.accent];
  const tiles = [['white', img('horizontal-colour')], ['navy', img('horizontal-white')], [onBrand[0], img(onBrand[1])],
    ['soft', `<div style="display:flex;gap:7mm;align-items:center">${img('mark-colour', 'height:20mm')}${img('app-icon', 'height:20mm')}</div>`]];
  const tileNames = isParent ? G.logo.tilesParent : G.logo.tiles;
  P.push(page(G.logo.k, `<h1>${G.logo.h}</h1><p class="lead">${G.logo.lead(B.name)}</p>
  <div class="body">
    <div class="grid g2">${tiles.map(([bg, m], i) => `<div><div class="tile ${bg}" style="min-height:44mm${bg === onBrand[0] ? `;background:${onBrand[2]}` : ''}">${m}</div><div class="cap">${tileNames[i][0]}<span>${tileNames[i][1]}</span></div></div>`).join('')}</div>
    <div class="points grid g4">${G.logo.parts.map(([h, p], i) => `<div class="point"><div class="n">${'ABCD'[i]}</div><h2>${h}</h2><p class="small" style="color:inherit">${p}</p></div>`).join('')}</div>
  </div>`));

  // 05 Family (sub-brands) or architecture (parent)
  if (isParent) {
    const subs = B.family.members.map((s) => loadHs(s));
    P.push(page(G.arch.k, `<h1>${G.arch.h}</h1><p class="lead">${G.arch.lead}</p>
    <div class="body">
      <div class="tile white" style="min-height:78mm;padding:10mm">${img('family-colour', 'max-height:62mm', 'HS Digital family')}</div>
      <table><tr>${G.arch.th.map((t) => `<th>${t}</th>`).join('')}</tr>
        ${subs.map((S) => { const a = S.brand.colors.find((c) => c.role === 'accent'); return `<tr><td><b>${esc(S.brand.name)}</b><br><span class="small">${esc(T.subBrands[S.slug])}</span></td><td>${web(S.brand)}</td>
          <td><span class="dot" style="background:${a.hex}"></span>${esc(S.brand.motif.accentName)}<br><span class="small">${a.hex}</span></td><td>${G.arch.motif[S.brand.motif.type]}</td></tr>`; }).join('')}</table>
      <div class="note" style="margin-top:auto">${esc(T.rules[1])}</div>
    </div>`));
  } else {
    const e = B.endorsement[lang];
    P.push(page(G.family.k, `<h1>${G.family.h}</h1><p class="lead">${G.family.lead(B.name, e)}</p>
    <div class="body">
      <div class="grid g2">
        <div><div class="tile white" style="min-height:46mm">${img(`endorsed-${lang}-colour`, 'max-height:20mm')}</div><div class="cap">${G.family.endorsed}<span>${G.family.endorsedUse}</span></div></div>
        <div><div class="tile white" style="min-height:46mm">${img('horizontal-colour', 'max-height:17mm')}</div><div class="cap">${G.family.alone}<span>${G.family.aloneUse}</span></div></div>
        <div><div class="tile navy" style="min-height:38mm">${img(`endorsed-${lang}-white`, 'max-height:18mm')}</div></div>
        <div><div class="tile soft" style="min-height:38mm">${img(`endorsed-stacked-${lang}-colour`, 'max-height:28mm')}</div></div>
      </div>
      <div><div class="rule"></div><div class="label">${G.family.rulesH}</div>
        ${G.family.rules(e).map((r, i) => `<div class="scale-row" style="grid-template-columns:10mm 1fr"><span style="font-weight:800;color:${ACC7}">${i + 1}</span><span>${esc(r)}</span></div>`).join('')}</div>
      <div style="margin-top:auto;display:flex;gap:4mm;align-items:center">${PARENT_LOGO()}<p class="small">${esc(e)} · ${esc(B.legalName)} · ${web(PARENT.brand)}</p></div>
    </div>`));
  }

  // 06 Versions
  const cws = ['colour', 'navy', 'black', 'white', isParent ? 'blue' : 'accent'];
  const cwBg = { colour: 'white', navy: 'white', black: 'white', white: 'navy', accent: 'accent', blue: 'blueBg' };
  const shapes = ['horizontal-colour', 'stacked-colour', isParent ? 'solutions-horizontal-colour' : `endorsed-stacked-${lang}-colour`, 'mark-colour'];
  const shapeNames = isParent ? [G.versions.shapes[0], G.versions.shapes[1], ['HS Digital Solutions', lang === 'es' ? 'Contratos y documentos legales' : 'Contracts and legal documents'], G.versions.shapes[3]] : G.versions.shapes;
  P.push(page(G.versions.k, `<h1>${G.versions.h}</h1><p class="lead">${G.versions.lead}</p>
  <div class="body" style="gap:5mm">
    <div class="grid g4" style="row-gap:4mm">${shapes.map((f, i) => `<div><div class="tile white" style="min-height:36mm;padding:6mm">${img(f, 'max-height:24mm')}</div><div class="cap">${shapeNames[i][0]}<span>${shapeNames[i][1]}</span></div></div>`).join('')}</div>
    <div class="grid" style="grid-template-columns:1fr 1fr;row-gap:4mm">${cws.map((cw) => `<div><div class="tile ${cwBg[cw]}" style="min-height:30mm;padding:6mm">${img(`horizontal-${cw}`, 'max-height:15mm')}</div><div class="cap">${G.versions.names[cw][0]}<span>${G.versions.names[cw][1]} · <code>${slug}-horizontal-${cw}</code></span></div></div>`).join('')}</div>
  </div>`));

  // 07 Clear space: logo height = mark height; X = cap height = 0.40 × logo height.
  const ratio = (() => { const m = svgText('horizontal-colour').match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); return m[1] / m[2]; })();
  const W = 110, Hh = W / ratio, X = Hh * 0.4;
  const xBox = (s) => `<div style="position:absolute;${s};width:${X}mm;height:${X}mm;background:${K.sky};border:.3mm dashed ${K.blue};display:flex;align-items:center;justify-content:center;font-weight:800;color:${K.navy}">X</div>`;
  P.push(page(G.space.k, `<h1>${G.space.h}</h1><p class="lead">${G.space.lead}</p>
  <div class="body">
    <div class="tile soft" style="padding:10mm"><div style="position:relative;width:${W + X * 2}mm;height:${Hh + X * 2}mm;border:.3mm dashed ${K.slate}">
      ${xBox('left:0;top:0')}${xBox('right:0;top:0')}${xBox('left:0;bottom:0')}${xBox('right:0;bottom:0')}
      <div style="position:absolute;left:${X}mm;top:${X}mm;width:${W}mm;outline:.25mm solid rgba(11,55,104,.15)">${img('horizontal-colour', `width:${W}mm;max-height:none`)}</div></div></div>
    <h2 style="margin-top:3mm">${G.space.minH}</h2>
    <div class="grid g3" style="align-items:end">
      <div><div style="height:16mm;display:flex;align-items:flex-end">${img('horizontal-colour', 'width:30mm')}</div><div class="cap">${G.space.min[0][0]}<span>${G.space.min[0][1]}</span></div></div>
      ${isParent ? '' : `<div><div style="height:16mm;display:flex;align-items:flex-end">${img(`endorsed-${lang}-colour`, 'width:40mm')}</div><div class="cap">${G.space.min[1][0]}<span>${G.space.min[1][1]}</span></div></div>`}
      <div><div style="height:16mm;display:flex;align-items:flex-end">${img('mark-colour', 'width:8mm')}</div><div class="cap">${G.space.min[2][0]}<span>${G.space.min[2][1]}</span></div></div>
    </div>
    ${isParent ? '' : `<p class="note">${G.space.note}</p>`}
  </div>`));

  // 08 Misuse
  const base = svgText('horizontal-colour');
  const inl = (svg) => svg.replace('<svg ', '<svg style="max-height:15mm;width:100%" ');
  const recolour = base.replaceAll(K.navy, '#E5484D').replaceAll(K.blue, '#7C5CFF');
  const accMark = base.replaceAll(K.blue, isParent ? '#FFC233' : K.accent);
  const retype = `<div style="display:flex;align-items:center;gap:3mm">${img('mark-colour', 'height:13mm')}<span style="font-family:Georgia,serif;font-size:21pt;color:${K.navy}">${esc(B.name)}</span></div>`;
  const mis = [[img('horizontal-colour', 'max-width:60%;transform:scaleX(1.45) scaleY(.7)'), ''], [inl(recolour), ''], [img('horizontal-colour', 'max-height:15mm;transform:rotate(-14deg)'), ''],
    [img('horizontal-colour', 'max-height:15mm;filter:drop-shadow(1.5mm 1.5mm 1mm rgba(30,136,210,.7))'), `background:linear-gradient(135deg,${K.sky},#fff)`], [inl(accMark), ''],
    [img('horizontal-colour', 'max-height:15mm'), `background:${K.blue}`], [retype, ''],
    [img('horizontal-colour', 'max-height:15mm'), 'background:repeating-linear-gradient(60deg,#8a6f55 0 5mm,#c9a77f 5mm 9mm,#3f4a3c 9mm 14mm,#e8d9c4 14mm 18mm)']];
  P.push(page(G.misuse.k, `<h1>${G.misuse.h}</h1><p class="lead">${G.misuse.lead}</p>
  <div class="body"><div class="grid g2" style="row-gap:5mm">${mis.map(([m, bg], i) => `<div><div class="tile ${bg ? '' : 'white'} no" style="min-height:33mm;${bg}">${m}</div><div class="cap">${G.misuse.items[i]}</div></div>`).join('')}</div></div>`));

  // 09 Colour
  const bigRoles = isParent ? ['primary', 'secondary', 'secondary-text'] : ['primary', 'secondary', 'accent'];
  const big = (c, flex) => `<div class="swatch-big" style="flex:${flex};background:${c.hex};color:${contrast(c.hex, '#ffffff') >= 3 ? '#fff' : K.navy}"><b>${esc(c.name)}</b><span>${c.hex} · RGB ${c.rgb}</span><span>CMYK ${c.cmyk}${c.pantone ? ` · Pantone ${c.pantone}` : ''}</span><span class="u">${esc(c.use[lang] || c.use.es)}</span></div>`;
  const chip = (c) => `<div><div style="height:11mm;border-radius:2.5mm;background:${c.hex};border:.25mm solid ${K.line}"></div><div class="cap">${esc(c.name)}<span>${c.hex}</span></div></div>`;
  const rest = B.colors.filter((c) => !bigRoles.includes(c.role));
  const pairs = [[K.white, K.navy, `White / Navy`], [K.navy, K.mist, 'Navy / Mist'], [K.white, K.blue, 'White / Blue'], [K.blueDeep, K.white, 'Blue 700 / White'], [K.slate, K.white, 'Slate / White']]
    .concat(isParent ? [] : [[K.navy, K.accent, `Navy / ${colourBy('accent').name}`], [K.accentDeep, K.white, `${colourBy('accent-text').name} / White`], [K.accent, K.white, `${colourBy('accent').name} / White`]]);
  P.push(page(G.colour.k, `<h1>${isParent ? G.colour.hParent : G.colour.h}</h1><p class="lead">${isParent ? G.colour.leadParent : G.colour.lead(B.name)}</p>
  <div class="body" style="gap:3.5mm;margin-top:6mm">
    <div style="display:flex;gap:4mm">${bigRoles.map((r, i) => big(colourBy(r), i === 0 ? 1.6 : 1)).join('')}</div>
    <div class="label">${G.colour.neutrals}</div>
    <div class="grid" style="grid-template-columns:repeat(${rest.length},1fr);gap:3mm">${rest.map(chip).join('')}</div>
    <div class="label">${G.colour.ratio}</div>
    <div class="ratio">${B.colors.filter((c) => c.ratio).sort((a, b) => b.ratio - a.ratio).map((c) => `<div style="flex:${c.ratio};background:${c.hex};color:${contrast(c.hex, '#fff') >= 3 ? '#fff' : K.navy}">${esc(c.name)} ${c.ratio}%</div>`).join('')}</div>
    <div class="label">${G.colour.contrast}</div>
    <table class="tight"><tr>${G.colour.th.map((t) => `<th>${t}</th>`).join('')}</tr>${pairs.map(([fg, bg, name]) => { const r = contrast(fg, bg); return `<tr><td><span class="pair" style="color:${fg};background:${bg}">Aa</span>${name}</td><td>${r.toFixed(1)}:1</td><td>${r >= 4.5 ? G.colour.ok : r >= 3 ? G.colour.large : G.colour.deco}</td></tr>`; }).join('')}</table>
    <p class="small" style="margin-top:auto">${G.colour.cmyk}</p>
  </div>`));

  // 10 Typography
  const S = G.type;
  const css = ["font-family:'Bricolage Grotesque';font-weight:800;font-size:30pt;letter-spacing:-.03em;line-height:1.05", "font-family:'Bricolage Grotesque';font-weight:800;font-size:21pt;letter-spacing:-.02em", "font-family:'Bricolage Grotesque';font-weight:700;font-size:14pt",
    'font-size:11pt;line-height:1.6', `font-size:8.5pt;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${ACC7}`, 'font-size:10.5pt;font-weight:700'];
  P.push(page(S.k, `<h1>${S.h}</h1>
  <div class="grid g2" style="margin-top:2mm">
    <div class="spec"><div class="label">${S.display}</div><div class="aa d" style="font-weight:800;letter-spacing:-.04em">Aa</div><h2>${B.fonts.display.family}</h2><p class="small">${B.fonts.display.weights.join(' · ')} · ${S.fallback}: ${esc(B.fonts.display.fallback)}</p></div>
    <div class="spec"><div class="label">${S.body}</div><div class="aa" style="font-weight:600">Aa</div><h2>${B.fonts.body.family}</h2><p class="small">${B.fonts.body.weights.join(' · ')} · ${S.fallback}: ${esc(B.fonts.body.fallback)}</p></div>
  </div>
  <p class="small" style="margin-top:3mm">${S.free}</p>
  <div class="body" style="margin-top:3mm;gap:0">${S.scale.map(([r, spec], i) => `<div class="scale-row" style="grid-template-columns:36mm 1fr;align-items:center"><span class="small"><b style="color:${K.ink}">${r}</b><br>${spec}</span>
    ${i === 5 ? `<span><span style="${css[i]};display:inline-block;background:${K.navy};color:#fff;border-radius:6mm;padding:2.6mm 7mm">${S.sample[i]}</span></span>` : `<span style="${css[i]}">${S.sample[i]}</span>`}</div>`).join('')}
    <div class="grid g3" style="margin-top:auto">${S.rules.map(([h, p]) => `<div><b style="font-size:9pt">${h}</b><p class="small" style="margin-top:1mm">${p}</p></div>`).join('')}</div>
  </div>`));

  // 11 Graphic device
  const M = G.motif;
  const demo = (dark) => `<div class="tile" style="min-height:74mm;padding:9mm;justify-content:flex-start;align-items:flex-end;overflow:hidden;background:${dark ? K.navy : '#fff'};${dark ? '' : `border:.25mm solid ${K.line};`}">
    ${dark ? `${leaf('top', '#ffffff', 'right:-20mm;top:-16mm;width:72mm;height:72mm;max-height:none', 0.07)}${leaf('bottom', K.blue, 'right:-20mm;top:-16mm;width:72mm;height:72mm;max-height:none', 0.5)}` : markSvg(K.sky, K.sky, 'position:absolute;right:-20mm;top:-16mm;width:72mm;height:72mm;max-height:none')}
    <div class="d" style="position:relative;font-size:21pt;font-weight:800;letter-spacing:-.025em;line-height:1.12;color:${dark ? '#fff' : K.navy}">${head(T.promise, !dark)}</div></div>`;
  const fourAccents = isParent ? `<div><div class="label">${M.four}</div><div class="grid g4" style="margin-top:3mm">${B.family.members.map((s) => { const X2 = loadHs(s); return `<div><div style="height:16mm;border-radius:3mm;background:${X2.K.accent};display:flex;align-items:center;justify-content:center">${markSvg(K.navy, K.navy, 'width:8mm;height:8mm')}</div><div class="cap">${esc(X2.brand.name)}<span>${esc(X2.brand.motif.accentName)} · ${X2.K.accent}</span></div></div>`; }).join('')}</div><p class="small" style="margin-top:2mm">${M.fourText}</p></div>` : '';
  P.push(page(M.k, `<h1>${isParent ? M.hParent : M.h}</h1><p class="lead">${esc(T.motifText)}</p>
  <div class="body">
    <div class="grid g2">${[false, true].map((d) => `<div>${demo(d)}<div class="cap">${d ? M.dark : M.light}</div></div>`).join('')}</div>
    ${isParent ? `<div class="note">${M.leafText}</div>${fourAccents}` : `<div class="grid g2"><div><div class="label">${M.use}</div><p style="margin-top:2mm">${esc(T.accentUse)}</p></div><div><div class="label">${M.leaf}</div><p style="margin-top:2mm">${M.leafText}</p></div></div>`}
    <div class="grid g3" style="margin-top:auto">${M.rules.map((r, i) => `<div class="point"><div class="n">0${i + 1}</div><p class="small" style="color:inherit">${r}</p></div>`).join('')}</div>
  </div>`));

  // 12 Voice
  P.push(page(G.voice.k, `<h1>${G.voice.h}</h1>
  <div class="body" style="margin-top:6mm">
    <div class="grid g${Math.min(T.tone.length, 3)}">${T.tone.slice(0, 3).map((t, i) => `<div class="card outline"><div class="d" style="font-size:22pt;font-weight:800;color:${ACC7}">${i + 1}</div><h2>${esc(t.principle)}</h2><p class="small">${esc(t.why)}</p></div>`).join('')}</div>
    <div><div class="rule"></div>
      <div class="scale-row" style="grid-template-columns:1fr 1fr;padding-top:0"><span class="label" style="color:#1F8A55">${G.voice.yes}</span><span class="label" style="color:#C2353A">${G.voice.no}</span></div>
      ${T.doDont.map((d) => `<div class="scale-row" style="grid-template-columns:1fr 1fr"><b style="font-size:10pt">${esc(d.do)}</b><span style="color:${K.slate};font-size:10pt">${esc(d.dont)}</span></div>`).join('')}</div>
  </div>`));

  // 13 Words and rules
  P.push(page(G.words.k, `<h1>${G.words.h}</h1>
  <div class="body" style="margin-top:6mm">
    <div class="grid g2"><div><div class="label">${G.words.use}</div><div class="chips">${T.wordsUse.map((s) => `<span>${esc(s)}</span>`).join('')}</div></div>
      <div><div class="label">${G.words.avoid}</div><div class="chips not">${T.wordsAvoid.map((s) => `<span>${esc(s)}</span>`).join('')}</div></div></div>
    <div><div class="rule"></div><div class="label">${G.words.rules}</div>
      ${T.rules.map((r, i) => `<div class="scale-row" style="grid-template-columns:10mm 1fr"><span class="d" style="font-size:13pt;font-weight:800;color:${ACC7}">${i + 1}</span><span style="font-size:10pt">${esc(r)}</span></div>`).join('')}</div>
    <div class="quote" style="margin-top:auto;background:${K.mist};border-left:1.5mm solid ${ACC}"><span class="label">Boilerplate</span><p style="margin-top:2mm;font-size:9.5pt">${esc(T.boilerplate)}</p></div>
  </div>`));

  // 14 Stationery (card previews come from hs-stationery.mjs)
  const A = G.apps;
  const cards = isParent ? [[A.card, `business-card-${lang}-preview.png`]] : [[A.cardE, `business-card-endorsed-${lang}-preview.png`], [A.cardS, `business-card-standalone-${lang}-preview.png`]];
  P.push(page(A.k, `<h1>${A.h}</h1>
  <div class="body" style="margin-top:3mm;gap:3mm">
    ${cards.map(([t, f]) => `<div class="label">${t}</div><img src="../stationery/${f}" alt="${t}" style="width:${isParent ? 100 : 88}%;border-radius:2mm">`).join('')}
    <div class="label" style="margin-top:2mm">${A.sig}</div>
    <div class="tile white" style="justify-content:flex-start;padding:5mm 7mm;min-height:0;gap:5mm">
      ${img('mark-colour', 'height:13mm;width:auto;max-height:none')}
      <div style="border-left:.8mm solid ${ACC};padding-left:5mm;font-size:9pt;line-height:1.55"><b style="font-size:11pt;font-weight:800;color:${K.navy}">${A.name}</b><br><span style="color:${K.slate}">${A.role(B.name)}</span><br>
        <span style="color:${K.blueDeep}">${esc(C.email)} · ${esc(C.phone)} · <b>${web(B)}</b></span>${isParent ? '' : `<br><span class="small">${esc(B.endorsement[lang])} · ${web(PARENT.brand)}</span>`}</div>
    </div>
    <div class="label" style="margin-top:2mm">${A.letter}</div><p class="small" style="color:${K.ink}">${A.letterText}</p>
    <p class="small">${A.files}</p>
  </div>`));

  // 15 Icons, social, downloads
  const I = G.icons;
  const avatars = isParent ? ['navy', 'light', 'blue'] : ['accent', 'navy', 'light'];
  const folders = ['logo/svg · logo/png', 'icons', 'social', 'profile', 'stationery'];
  P.push(page(I.k, `<h1>${I.h}</h1>
  <div class="body" style="margin-top:3mm;gap:5mm">
    <div style="display:flex;gap:6mm;align-items:flex-end">
      ${[[16, 'favicon.svg'], [22, 'apple-touch-icon.png'], [27, 'icon-512.png']].map(([s, f], i) => `<div><img src="../icons/${f}" alt="${I.items[i]}" style="width:${s}mm;height:${s}mm;border-radius:${f === 'favicon.svg' ? 0 : 3}mm"><div class="cap">${I.items[i]}</div></div>`).join('')}
      ${avatars.map((a) => `<div><img src="../social/avatar-${a}-400.png" alt="${I.avatar}" style="width:25mm;border-radius:50%;border:.25mm solid ${K.line}"><div class="cap">${I.avatar}<span>${a}</span></div></div>`).join('')}
    </div>
    <div><img src="../social/og-image-1200x630-${lang}.png" alt="${I.og}" style="width:100%;border-radius:3mm"><div class="cap">${I.og}</div></div>
    <div class="label">${I.downloads}</div>
    <table><tr><th>${I.th[0]}</th><th>${I.th[1]}</th></tr>${folders.map((f, i) => `<tr><td><code>${f}</code></td><td>${esc(I.rows[i])}</td></tr>`).join('')}</table>
  </div>`));

  // 16 Back cover
  const socials = Object.values(B.socials).filter(Boolean).map((u) => u.replace(/^https:\/\/(www\.)?/, ''));
  const backBox = 'left:-50mm;top:-40mm;width:170mm;height:170mm';
  P.push(page(G.back, `${leaf('top', '#ffffff', backBox, 0.05)}${leaf('bottom', K.blue, backBox, 0.35)}
  <div style="margin:auto;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8mm;position:relative">
    ${img(isParent ? 'stacked-white' : `endorsed-stacked-${lang}-white`, 'width:62mm', B.name)}
    <p class="d" style="font-size:17pt;font-weight:800;letter-spacing:-.02em;color:#fff">${head(T.promise.replaceAll('|', ' '), false)}</p>
    <p style="color:#C9D6E6;line-height:1.8">${web(B)} · ${esc(C.email)} · ${esc(C.phone)}<br>${C.offices.map((o) => esc(o.address)).join(' · ')}<br>${socials.join(' · ')}</p>
    <p class="label" style="color:${ACC}">${isParent ? esc(B.legalName) : `${esc(B.endorsement[lang])} · ${esc(B.legalName)}`}</p>
  </div>`, { dark: true, plain: true }));

  if (n !== TOTAL) throw new Error(`expected ${TOTAL} pages, built ${n}`);
  const other = lang === 'es' ? ['index.en.html', 'English'] : ['index.html', 'Español'];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${G.title(B.name)}</title><link rel="icon" href="../icons/favicon.svg" type="image/svg+xml">
<link rel="alternate" hreflang="${lang === 'es' ? 'en' : 'es'}" href="${other[0]}">
<link rel="stylesheet" href="../../../assets/guide.css">
<style>${baseCss(H, '../../../assets')}
:root{--ink:${K.ink};--paper:#fff;--accent:${ACC7};--muted:${K.slate};--surface:${K.navy};--soft:${K.mist}}
h1,h2,.swatch-big b,.spec .aa{font-family:'Bricolage Grotesque',Manrope,sans-serif;font-variation-settings:'opsz' 96}
h1{font-weight:800;letter-spacing:-.03em;font-size:30pt;line-height:1.06;color:${K.navy}}h2{font-weight:750;letter-spacing:-.015em;font-size:12pt;color:${K.navy}}
.page.dark{background:${K.navy}}.page.dark h1{color:#fff}.kicker,.label{font-weight:700;letter-spacing:.15em}.kicker .brand{margin-left:auto}
.lead{opacity:1;color:#33445C}.point{border-top-color:${ACC}}.point .n{color:${ACC7}}
.tile.white{border-color:${K.line}}.tile.navy{background:${K.navy}}.tile.accent{background:${ACC}}.tile.blueBg{background:${K.blue}}.tile.soft{background:${K.mist}}
.card{background:${K.mist};border-radius:4mm;padding:5mm}.card.outline{background:#fff;border:.45mm solid ${K.navy}}
.rule{border-top:.7mm solid ${K.navy};margin-bottom:3mm}.note{font-size:9pt;border-left:1mm solid ${ACC};padding-left:3mm}
.scale-row,.ratio{border-color:${K.line}}
.chips{display:flex;gap:2mm;flex-wrap:wrap;margin-top:2.5mm}.chips span{background:${K.sky};color:${K.navy};border-radius:4mm;padding:1.2mm 3.5mm;font-size:8.5pt;font-weight:700}
.chips.not span{background:#fff;border:.25mm solid ${K.line};color:${K.slate};text-decoration:line-through;text-decoration-color:#C2353A}
.swatch-big{border-radius:4mm;min-height:44mm;padding:5mm;display:flex;flex-direction:column;justify-content:flex-end;font-size:7.3pt;line-height:1.45}
.swatch-big b{font-size:15pt;font-weight:800;letter-spacing:-.02em}.swatch-big .u{margin-top:1.5mm;opacity:.9}
.pair{display:inline-block;font-weight:800;border-radius:1.5mm;padding:.4mm 2mm;margin-right:2.5mm;border:.25mm solid ${K.line}}
.dot{display:inline-block;width:2.6mm;height:2.6mm;border-radius:50%;margin-right:1.6mm;vertical-align:middle}
.tight td{padding:1.3mm 3mm 1.3mm 0}.tight th{padding:1mm 0}.spec{background:${K.mist}}code{font-family:Consolas,monospace;font-size:.88em}
.lang{position:fixed;top:4mm;right:4mm;z-index:9;background:${K.navy};color:#fff;font-size:9pt;padding:2mm 4mm;border-radius:5mm;text-decoration:none}
@media print{.lang{display:none}}</style></head><body>
<a class="lang" href="${other[0]}">${other[1]}</a>
${P.join('\n')}
</body></html>`;
}

// Small parent lockup for sub-brand pages (relative to brands/<slug>/guide/).
function PARENT_LOGO() {
  return `<img src="../../hs-digital/logo/svg/hs-digital-horizontal-colour.svg" alt="HS Digital" style="height:9mm;flex-shrink:0">`;
}

for (const slug of slugs) {
  const H = loadHs(slug);
  for (const lang of H.brand.languages) {
    const out = path.join(H.dir, `guide/${lang === 'es' ? 'index' : `index.${lang}`}.html`);
    writeFile(out, build(H, lang));
    printPdf(out, path.join(H.dir, `guide/${slug}-brand-guidelines-${lang}.pdf`));
  }
  console.log(`${slug}: guide (${TOTAL} pages × ${H.brand.languages.length})`);
}
