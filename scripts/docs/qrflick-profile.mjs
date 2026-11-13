// QRflick business profile: one A4 portrait page (HTML + PDF) + plain text, per language.
// No phone on public pieces (brand.json contactRule). Run: node scripts/docs/qrflick-profile.mjs   (from brand-library/)
import path from 'node:path';
import { loadBrand, fontFaces, writeFile, printPdf, esc } from './common.mjs';
import { markMarkup } from '../lib/qrflick.mjs';
import { localBrand } from './qrflick-guide-text.mjs';

const { dir, brand: BASE, hex } = loadBrand('qrflick');
const K = { ink: hex('Ink'), teal: hex('Teal'), deep: hex('Teal Deep'), glow: hex('Teal Glow'), slate: hex('Slate'), night: hex('Night'), paper: hex('Paper'), snow: hex('Snow') };

const TEXT = {
  es: {
    title: 'QRflick · Perfil de empresa', kicker: 'Perfil de empresa', about: 'Qué es QRflick', features: 'Qué puedes hacer', audience: 'Para quién',
    promise: 'Nuestra promesa', contact: 'Contacto', endorsedBy: 'Un producto de',
    featureList: [['Cambia el destino después de imprimir', 'Menú, web, oferta o formulario: lo cambias desde el móvil y el código impreso sigue funcionando.'],
      ['Sirve en cualquier soporte', 'Cartas, mesas, furgonetas, tarjetas, flyers y escaparates.'],
      ['Mira quién escanea', 'Escaneos por día y por código, para saber qué pieza funciona.'],
      ['Tus códigos son tuyos', 'Plan gratis para siempre. Si dejas de pagar, tus QR siguen vivos.']],
    parentText: 'QRflick lo hace HS Digital, un estudio digital en España.',
  },
  en: {
    title: 'QRflick · Business profile', kicker: 'Business profile', about: 'What QRflick is', features: 'What you can do', audience: 'Who it is for',
    promise: 'Our promise', contact: 'Contact', endorsedBy: 'A product of',
    featureList: [['Change the destination after printing', 'Menu, website, offer or form: change it from your phone and the printed code keeps working.'],
      ['Works on anything printed', 'Menus, tables, vans, business cards, flyers and shop windows.'],
      ['See who scans', 'Scans per day and per code, so you know which piece works.'],
      ['Your codes stay yours', 'Free plan forever. If you stop paying, your QR codes stay alive.']],
    parentText: 'QRflick is made by HS Digital, a digital studio in Spain.',
  },
};

const sfx = (lang) => (lang === 'es' ? '' : `.${lang}`);
const strip = (u) => u.replace(/^https:\/\/(www\.)?/, '');

function profileHtml(lang) {
  const T = TEXT[lang], B = localBrand(BASE, lang), C = B.contact;
  const L = (n) => `../logo/svg/${n}.svg`;
  const contactRows = [['Web', strip(B.website)], ['Email', C.email]]
    .concat(Object.entries(B.socials).filter(([, v]) => v).map(([k, v]) => [k[0].toUpperCase() + k.slice(1), strip(v)]));
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${T.title}</title><link rel="icon" href="../icons/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../../../assets/guide.css">
<style>${fontFaces('../../../assets', 'qrflick')}
:root{--ink:${K.ink};--paper:#fff;--accent:${K.deep};--muted:${K.slate};--surface:${K.night};--soft:${K.paper}}
body,h1,h2{font-family:Archivo,'Helvetica Neue',Arial,sans-serif}h2{font-weight:800;letter-spacing:-.015em}
.kicker,.label{font-weight:700;letter-spacing:.14em}.point{border-top-color:${K.teal}}
.hero{flex-shrink:0;background:${K.night};color:${K.snow};margin:-20mm -18mm 0;padding:13mm 18mm 11mm;position:relative;overflow:hidden}
.hero .deco{position:absolute;right:-30mm;top:-28mm;width:115mm;height:115mm;opacity:.16}
.hero h1{font-weight:800;letter-spacing:-.03em;font-size:30pt;line-height:1.04;margin-top:8mm;position:relative}.hero h1 span{color:${K.glow}}
.hero .lead{color:#aab2b4;opacity:1;margin-top:4mm;position:relative;max-width:135mm;font-size:10.5pt}
.cols{display:grid;grid-template-columns:1.35fr 1fr;gap:9mm;margin-top:8mm;flex:1}
.svc{display:grid;grid-template-columns:1fr 1fr;gap:5mm}.svc h2{font-size:10.5pt}.svc p{font-size:8.5pt}
.chips{display:flex;gap:2mm;flex-wrap:wrap}.chips span{background:${K.paper};border-radius:4mm;padding:1.2mm 3.5mm;font-size:8.5pt;font-weight:600}
.side{background:${K.paper};border-radius:4mm;padding:7mm;display:flex;flex-direction:column;gap:5mm}
.side td{border:0;padding:1.3mm 2mm 1.3mm 0;font-size:8.5pt}.side td:first-child{color:var(--muted);width:20mm}
</style></head><body>
<section class="page">
  <div class="hero">
    <svg class="deco" viewBox="0 0 100 100" aria-hidden="true">${markMarkup(K.glow)}</svg>
    <div class="kicker" style="position:relative;color:${K.glow}"><b>QRflick</b>${T.kicker}</div>
    <img src="${L('qrflick-horizontal-colour-dark')}" alt="QRflick" style="width:70mm;margin-top:7mm;position:relative">
    <h1>${esc(B.tagline).replace(/\. (.+)$/, '.<br><span>$1</span>')}</h1>
    <p class="lead">${esc(B.boilerplate)}</p>
  </div>
  <div class="cols">
    <div style="display:flex;flex-direction:column;gap:6mm">
      <div><div class="label">${T.about}</div><p style="margin-top:2mm">${esc(B.description)}</p></div>
      <div><div class="label">${T.features}</div><div class="svc" style="margin-top:3mm">${T.featureList.map(([h, p], i) => `<div class="point"><div class="n">0${i + 1}</div><h2>${h}</h2><p>${p}</p></div>`).join('')}</div></div>
      <div><div class="label">${T.audience}</div><div class="chips" style="margin-top:2.5mm">${B.audience.map((s) => `<span>${esc(s)}</span>`).join('')}</div></div>
    </div>
    <div class="side">
      <div><div class="label">${T.promise}</div>${B.pillars.slice(1).map((v) => `<h2 style="font-size:11pt;margin-top:3mm">${esc(v.title)}</h2><p class="small" style="color:inherit;opacity:.8">${esc(v.text)}</p>`).join('')}</div>
      <div><div class="label">${T.contact}</div><table style="margin-top:2mm">${contactRows.map(([k, v]) => `<tr><td>${k}</td><td>${esc(v)}</td></tr>`).join('')}</table></div>
      <div style="margin-top:auto"><div class="label">${esc(BASE.endorsement[lang])}</div><p class="small" style="margin-top:2mm;color:inherit;opacity:.8">${T.parentText} ${strip(BASE.parent.website)}</p></div>
    </div>
  </div>
  <div class="foot"><span>${strip(B.website)} · ${esc(C.email)}</span><span>${T.endorsedBy} ${esc(BASE.parent.name)}</span></div>
</section></body></html>`;
}

function profileText(lang) {
  const T = TEXT[lang], B = localBrand(BASE, lang), C = B.contact;
  return `# QRflick · ${T.kicker}

**${B.tagline}**

## Boilerplate
${B.boilerplate}

## ${T.about}
${B.description}

## ${T.features}
${T.featureList.map(([h, p]) => `- **${h}.** ${p}`).join('\n')}

## ${T.audience}
${B.audience.join(' · ')}

## ${T.promise}
${B.pillars.slice(1).map((v) => `- **${v.title}** ${v.text}`).join('\n')}

## ${T.contact}
- Web: ${B.website}
- Email: ${C.email}
${Object.entries(B.socials).filter(([, v]) => v).map(([k, v]) => `- ${k[0].toUpperCase() + k.slice(1)}: ${v}`).join('\n')}

${BASE.endorsement[lang]} (${BASE.parent.website}).
`;
}

for (const lang of BASE.languages) {
  const html = path.join(dir, `profile/index${sfx(lang)}.html`);
  writeFile(html, profileHtml(lang));
  printPdf(html, path.join(dir, `profile/qrflick-business-profile-${lang}.pdf`));
  writeFile(path.join(dir, `profile/qrflick-business-profile-${lang}.md`), profileText(lang));
  console.log(`Profile (${lang}) written`);
}
