// HS family business profile: one A4 portrait page (HTML + PDF) + Markdown, per brand and language.
// Run: node scripts/docs/hs-profile.mjs [slug ...]   (after build-hs.mjs)
import path from 'node:path';
import { writeFile, printPdf, esc } from './common.mjs';
import { FAMILY } from '../lib/hs.mjs';
import { loadHs, copyOf, web, markSvg, leaf, headline, baseCss, acc, accText } from './hs-common.mjs';

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : FAMILY;
const PARENT = loadHs('hs-digital');
const DECO = 'right:-22mm;top:-6mm;width:96mm;height:96mm';

const UI = {
  es: { kicker: 'Perfil de empresa', about: 'Quién somos', services: 'Qué hacemos', family: 'Las cuatro especialidades', audience: 'Para quién',
    benefits: 'Por qué un grupo', commit: 'Compromisos', idea: 'La idea', contact: 'Contacto', web: 'Web', email: 'Email', phone: 'Teléfono', offices: 'Oficinas', social: 'Redes',
    madeBy: 'Una marca de' },
  en: { kicker: 'Business profile', about: 'Who we are', services: 'What we do', family: 'The four specialities', audience: 'Who it is for',
    benefits: 'Why a group', commit: 'Commitments', idea: 'The idea', contact: 'Contact', web: 'Web', email: 'Email', phone: 'Phone', offices: 'Offices', social: 'Social',
    madeBy: 'A brand of' },
};
const sfx = (lang) => (lang === 'es' ? '' : `.${lang}`);
const strip = (u) => u.replace(/^https:\/\/(www\.)?/, '');
const socialRows = (B) => Object.entries(B.socials).filter(([, v]) => v).map(([k, v]) => [k === 'x' ? 'X' : k[0].toUpperCase() + k.slice(1), strip(v)]);
// "24 h to reply" -> ["24 h", "to reply"]: the leading figure is set large.
const splitFigure = (s) => { const m = s.match(/^([\d.,]+\s?(?:h|px|%)?)\s+(.*)$/); return m ? [m[1], m[2]] : ['', s]; };

function profileHtml(H, lang) {
  const { brand: B, K, isParent, slug } = H, T = copyOf(B, lang), U = UI[lang], C = B.contact;
  const logo = isParent ? `${slug}-horizontal-white` : `${slug}-endorsed-${lang}-white`;
  const members = isParent ? B.family.members.map((s) => loadHs(s)) : [];
  const left = isParent
    ? `<div><div class="label">${U.family}</div><div class="svc">${members.map((S) => `<div class="pt" style="border-top-color:${S.K.accent}">
        <h2>${esc(S.brand.name)}</h2><p>${esc(T.subBrands[S.slug])}</p><p class="dom" style="color:${accText(S.K)}">${web(S.brand)}</p></div>`).join('')}</div></div>
      <div><div class="label">${U.benefits}</div><div class="chips">${T.groupBenefits.map((s) => `<span>${esc(s)}</span>`).join('')}</div></div>`
    : `<div><div class="label">${U.services}</div><div class="svc">${T.services.slice(0, 6).map((s, i) => `<div class="pt"><div class="n">0${i + 1}</div><h2>${esc(s.name)}</h2><p>${esc(s.text)}</p></div>`).join('')}</div></div>
      <div><div class="label">${U.audience}</div><div class="chips">${T.audience.map((s) => `<span>${esc(s)}</span>`).join('')}</div></div>`;
  const sideTop = isParent
    ? `<div><div class="label">${U.idea}</div>${T.pillars.map((p) => `<h3>${esc(p.title)}</h3><p class="sm">${esc(p.text)}</p>`).join('')}</div>`
    : `<div><div class="label">${U.commit}</div><div class="figs">${T.commitments.map((s) => { const [f, t] = splitFigure(s); return `<div><b class="d">${esc(f)}</b><span>${esc(t)}</span></div>`; }).join('')}</div></div>`;
  const rows = [[U.web, web(B)], [U.email, C.email], [U.phone, C.phone], [U.offices, C.offices.map((o) => esc(o.address)).join('<br>')]]
    .concat(socialRows(B));
  const endorse = isParent ? '' : `<div class="end">${markSvg(K.navy, K.blue, 'width:11mm;height:11mm;flex-shrink:0')}
      <div><div class="label" style="color:${K.navy}">${esc(B.endorsement[lang])}</div><p class="sm">${esc(B.legalName)} · ${web(PARENT.brand)}</p></div></div>`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(B.name)} · ${U.kicker}</title><link rel="icon" href="../icons/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../../../assets/guide.css">
<style>${baseCss(H, '../../../assets')}
:root{--ink:${K.ink};--paper:#fff;--accent:${accText(K)};--muted:${K.slate};--surface:${K.navy};--soft:${K.mist}}
h1,h2,h3{font-family:'Bricolage Grotesque',Manrope,sans-serif;letter-spacing:-.02em;font-variation-settings:'opsz' 96}
.kicker,.label{font-weight:700;letter-spacing:.16em}
.hero{flex-shrink:0;background:${K.navy};color:#fff;margin:-20mm -18mm 0;padding:11mm 18mm 9mm;position:relative;overflow:hidden}
.hero .kicker{position:relative;color:#B9C9DD}.hero .kicker b{color:${acc(K)}}
.hero h1{font-weight:780;font-size:26pt;line-height:1.08;margin-top:8mm;position:relative;max-width:168mm}
.hero .lead{color:#C9D6E6;opacity:1;margin-top:4mm;position:relative;max-width:140mm;font-size:9.8pt}
.cols{display:grid;grid-template-columns:1.4fr 1fr;gap:8mm;margin-top:7mm;flex:1;min-height:0}
.colL{display:flex;flex-direction:column;gap:5mm}
.svc{display:grid;grid-template-columns:1fr 1fr;gap:4mm 6mm;margin-top:3mm}
.pt{border-top:.8mm solid ${acc(K)};padding-top:2.4mm}.pt .n{font-size:7pt;font-weight:800;color:${accText(K)};letter-spacing:.12em}
.pt h2{font-size:10.5pt;font-weight:750;margin:.6mm 0 .8mm}.pt p{font-size:7.7pt;line-height:1.45;color:${K.slate}}.pt .dom{font-weight:800;font-size:7.5pt;margin-top:1mm}
.chips{display:flex;gap:1.6mm;flex-wrap:wrap;margin-top:2.5mm}.chips span{background:${K.sky};color:${K.navy};border-radius:4mm;padding:1mm 3mm;font-size:7.6pt;font-weight:700}
.side{background:${K.mist};border-radius:4mm;padding:7mm;display:flex;flex-direction:column;gap:5.5mm}
.side h3{font-size:10.5pt;font-weight:750;color:${K.navy};margin-top:3mm}.sm{font-size:8pt;line-height:1.5;color:${K.slate}}
.figs{display:flex;flex-direction:column;gap:2.6mm;margin-top:3mm}.figs div{display:flex;align-items:baseline;gap:3mm}
.figs b{font-size:19pt;font-weight:800;color:${K.navy};letter-spacing:-.03em;min-width:24mm}.figs span{font-size:8.3pt;font-weight:600;color:${K.ink}}
.side td{border:0;padding:1.1mm 2mm 1.1mm 0;font-size:8pt;line-height:1.45}.side td:first-child{color:${K.slate};width:19mm}
.end{margin-top:auto;display:flex;gap:4mm;align-items:center;border-top:.25mm solid ${K.line};padding-top:5mm}
</style></head><body>
<section class="page">
  <div class="hero">
    ${leaf('top', '#ffffff', DECO, 0.07)}${leaf('bottom', K.blue, DECO, 0.55)}
    <div class="kicker"><b>${esc(B.name)}</b>${U.kicker}</div>
    <img src="../logo/svg/${logo}.svg" alt="${esc(B.name)}" style="height:${isParent ? 13 : 15}mm;width:auto;margin-top:7mm;position:relative">
    <h1>${headline(T.promise, T.promiseMark, B.motif?.type || 'plain', acc(K), { dark: true })}</h1>
    <p class="lead">${esc(T.description)}</p>
  </div>
  <div class="cols">
    <div class="colL">${left}</div>
    <div class="side">${sideTop}
      <div><div class="label">${U.contact}</div><table style="margin-top:2mm">${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table></div>
      ${endorse}
    </div>
  </div>
  <div class="foot"><span>${web(B)} · ${esc(C.email)} · ${esc(C.phone)}</span><span>${isParent ? esc(B.legalName) : `${U.madeBy} ${esc(PARENT.brand.name)}`}</span></div>
</section></body></html>`;
}

function profileText(H, lang) {
  const { brand: B, isParent } = H, T = copyOf(B, lang), U = UI[lang], C = B.contact;
  const list = isParent
    ? `## ${U.family}\n${B.family.members.map((s) => { const S = loadHs(s); return `- **${S.brand.name}** (${S.brand.website}): ${T.subBrands[s]}`; }).join('\n')}\n\n## ${U.benefits}\n${T.groupBenefits.map((s) => `- ${s}`).join('\n')}`
    : `## ${U.services}\n${T.services.map((s) => `- **${s.name}.** ${s.text}`).join('\n')}\n\n## ${U.audience}\n${T.audience.map((s) => `- ${s}`).join('\n')}\n\n## ${U.commit}\n${T.commitments.map((s) => `- ${s}`).join('\n')}`;
  return `# ${B.name} · ${U.kicker}

**${T.promise.replaceAll('|', ' ')}**

## Boilerplate
${T.boilerplate}

## ${U.about}
${T.description}

${list}

## ${U.contact}
- ${U.web}: ${B.website}
- ${U.email}: ${C.email}
- ${U.phone}: ${C.phone}
${C.offices.map((o) => `- ${o.city}: ${o.address}`).join('\n')}
${Object.entries(B.socials).filter(([, v]) => v).map(([k, v]) => `- ${k === 'x' ? 'X' : k[0].toUpperCase() + k.slice(1)}: ${v}`).join('\n')}

${isParent ? B.legalName : `${B.endorsement[lang]} (${B.legalName}, ${PARENT.brand.website}).`}
`;
}

for (const slug of slugs) {
  const H = loadHs(slug);
  for (const lang of H.brand.languages) {
    const html = path.join(H.dir, `profile/index${sfx(lang)}.html`);
    writeFile(html, profileHtml(H, lang));
    printPdf(html, path.join(H.dir, `profile/${slug}-business-profile-${lang}.pdf`));
    writeFile(path.join(H.dir, `profile/${slug}-business-profile-${lang}.md`), profileText(H, lang));
  }
  console.log(`${slug}: profile`);
}
