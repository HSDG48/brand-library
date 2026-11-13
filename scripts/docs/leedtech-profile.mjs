// LeedTech business profile: one A4 portrait page (HTML + PDF) + plain text, per language.
// Email signatures live in leedtech-stationery.mjs. Run: node scripts/docs/leedtech-profile.mjs   (from brand-library/)
import path from 'node:path';
import { loadBrand, globe, fontFaces, writeFile, printPdf, esc } from './common.mjs';
import { localBrand } from './leedtech-guide-text.mjs';

const { dir, brand: BASE, hex } = loadBrand('leedtech');
const K = { ink: hex('Negro Tinta'), yellow: hex('Amarillo Señal'), grey: hex('Gris') };

const TEXT = {
  es: {
    title: 'LeedTech · Perfil de empresa', kicker: 'Perfil de empresa', about: 'Quiénes somos', services: 'Qué hacemos', sectors: 'Sectores',
    values: 'Cómo trabajamos', group: 'Parte del Grupo Lanak', contact: 'Contacto', endorsedBy: 'Una empresa del',
    boilerplate: 'LeedTech es la empresa de selección de personal del Grupo Lanak, con sede en Barcelona. Conecta a profesionales cualificados de España y del extranjero con empresas de construcción, logística e industria de todo el país.',
    serviceList: [['Búsqueda y reclutamiento', 'Encontramos candidatos en España y en el extranjero para cada puesto.'], ['Evaluación y entrevistas', 'Filtramos perfiles, verificamos experiencia y presentamos solo a quien encaja.'], ['Acompañamiento a la incorporación', 'Ayudamos con la documentación y seguimos al candidato hasta su primer día.']],
    groupText: 'El Grupo Lanak reúne empresas de recursos humanos y servicios: Lanak (trabajo temporal), Akilan (outsourcing), Qualis (calidad y servicios) y LeedTech (selección de personal).',
  },
  en: {
    title: 'LeedTech · Business profile', kicker: 'Business profile', about: 'Who we are', services: 'What we do', sectors: 'Sectors',
    values: 'How we work', group: 'Part of Grupo Lanak', contact: 'Contact', endorsedBy: 'A company of',
    boilerplate: 'LeedTech is the recruitment company of Grupo Lanak, based in Barcelona. It connects qualified professionals from Spain and abroad with construction, logistics and industrial employers across the country.',
    serviceList: [['Search and recruitment', 'We find candidates in Spain and abroad for every role.'], ['Screening and interviews', 'We screen profiles, check experience and only put forward people who fit.'], ['Onboarding support', 'We help with paperwork and stay with the candidate until their first day.']],
    groupText: 'Grupo Lanak brings together HR and services companies: Lanak (temporary staffing), Akilan (outsourcing), Qualis (quality and services) and LeedTech (recruitment).',
  },
};

const sfx = (lang) => (lang === 'es' ? '' : `.${lang}`);

function profileHtml(lang) {
  const T = TEXT[lang], B = localBrand(BASE, lang), C = B.contact;
  const L = (n) => `../logo/svg/${n}.svg`;
  const contactRows = [['Web', B.website.replace('https://', '')], ['Email', C.email], [lang === 'es' ? 'Teléfono' : 'Phone', C.phone], [lang === 'es' ? 'Dirección' : 'Address', C.address]]
    .concat(C.hours ? [[lang === 'es' ? 'Horario' : 'Hours', C.hours]] : [])
    .concat(Object.entries(B.socials).filter(([, v]) => v).map(([k, v]) => [k[0].toUpperCase() + k.slice(1), v]));
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${T.title}</title><link rel="icon" href="../icons/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../../../assets/guide.css">
<style>${fontFaces('../../../assets')}
:root{--ink:${K.ink};--paper:#fff;--accent:${K.yellow};--muted:${K.grey};--surface:#2B2B2B;--soft:#F3F3F1}
.hero{flex-shrink:0;background:var(--ink);color:#fff;margin:-20mm -18mm 0;padding:13mm 18mm 10mm;position:relative;overflow:hidden}
.cols{display:grid;grid-template-columns:1.35fr 1fr;gap:9mm;margin-top:8mm;flex:1}
.svc{display:grid;gap:4mm}.svc h2{font-size:11.5pt}
.chips{display:flex;gap:2mm;flex-wrap:wrap}.chips span{background:var(--soft);border-radius:4mm;padding:1.2mm 3.5mm;font-size:8.5pt;font-weight:500}
.side{background:var(--soft);border-radius:3mm;padding:7mm;display:flex;flex-direction:column;gap:5mm}
.side td{border:0;padding:1.3mm 2mm 1.3mm 0;font-size:8.5pt}.side td:first-child{color:var(--muted);width:20mm}
</style></head><body>
<section class="page">
  <div class="hero">
    <div class="deco" style="right:-40mm;top:-45mm;width:130mm;height:130mm">${globe({ orbit: K.yellow, cls: '' })}</div>
    <div class="kicker" style="position:relative"><b>LeedTech</b>${T.kicker}</div>
    <img src="${L('leedtech-primary-colour-dark')}" alt="LeedTech" style="width:95mm;margin-top:7mm;position:relative">
    <p class="lead" style="margin-top:5mm;position:relative;max-width:130mm;font-size:10.5pt">${esc(T.boilerplate)}</p>
  </div>
  <div class="cols">
    <div style="display:flex;flex-direction:column;gap:6mm">
      <div><div class="label">${T.about}</div><p style="margin-top:2mm">${esc(B.description)}</p></div>
      <div><div class="label">${T.services}</div><div class="svc" style="margin-top:3mm">${T.serviceList.map(([h, p], i) => `<div class="point"><div class="n">0${i + 1}</div><h2>${h}</h2><p>${p}</p></div>`).join('')}</div></div>
      <div><div class="label">${T.sectors}</div><div class="chips" style="margin-top:2.5mm">${B.sectors.map((s) => `<span>${esc(s)}</span>`).join('')}</div></div>
    </div>
    <div class="side">
      <div><div class="label">${T.values}</div>${B.values.map((v) => `<h2 style="font-size:11pt;margin-top:3mm">${esc(v.name)}</h2><p class="small" style="color:inherit;opacity:.8">${esc(v.text)}</p>`).join('')}</div>
      <div><div class="label">${T.contact}</div><table style="margin-top:2mm">${contactRows.map(([k, v]) => `<tr><td>${k}</td><td>${esc(v)}</td></tr>`).join('')}</table></div>
      <div style="margin-top:auto"><div class="label">${T.group}</div><p class="small" style="margin:2mm 0 4mm;color:inherit;opacity:.8">${T.groupText}</p>
        <img src="${L('group/grupo-lanak-blue')}" alt="Grupo Lanak" style="height:11mm"></div>
    </div>
  </div>
  <div class="foot"><span>${B.website.replace('https://', '')} · ${esc(C.email)} · ${esc(C.phone)}</span><span>${T.endorsedBy} Grupo Lanak</span></div>
</section></body></html>`;
}

function profileText(lang) {
  const T = TEXT[lang], B = localBrand(BASE, lang), C = B.contact;
  return `# LeedTech · ${T.kicker}

## Boilerplate
${T.boilerplate}

## ${T.about}
${B.description}

## ${T.services}
${T.serviceList.map(([h, p]) => `- **${h}.** ${p}`).join('\n')}

## ${T.sectors}
${B.sectors.join(' · ')}

## ${T.values}
${B.values.map((v) => `- **${v.name}.** ${v.text}`).join('\n')}

## ${T.group}
${T.groupText}

## ${T.contact}
- Web: ${B.website}
- Email: ${C.email}
- ${lang === 'es' ? 'Teléfono' : 'Phone'}: ${C.phone}
- ${lang === 'es' ? 'Dirección' : 'Address'}: ${C.address}
`;
}

for (const lang of BASE.languages) {
  const html = path.join(dir, `profile/index${sfx(lang)}.html`);
  writeFile(html, profileHtml(lang));
  printPdf(html, path.join(dir, `profile/leedtech-business-profile-${lang}.pdf`));
  writeFile(path.join(dir, `profile/leedtech-business-profile-${lang}.md`), profileText(lang));
  console.log(`Profile (${lang}) written`);
}
