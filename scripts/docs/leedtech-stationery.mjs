// LeedTech stationery, each in two versions × every language:
//   standard = LeedTech logo + "Una empresa del Grupo Lanak" line
//   cobrand  = LeedTech | Grupo Lanak lockup (preferred: use it wherever possible)
// Outputs to brands/leedtech/stationery/: business cards (print PDF with 3 mm bleed + preview PNG),
// A4 letterhead (PDF), email signature (HTML). Blank templates with a sample name, so they are public.
// Run: node scripts/docs/leedtech-stationery.mjs   (from brand-library/)
import fs from 'node:fs';
import path from 'node:path';
import { loadBrand, globe, fontFaces, writeFile, printPdf, screenshot, esc } from './common.mjs';

const { dir, brand: B, hex } = loadBrand('leedtech');
const K = { ink: hex('Negro Tinta'), yellow: hex('Amarillo Señal'), grey: hex('Gris') };
const C = B.contact, WEB = B.website.replace('https://', '');
const OUT = path.join(dir, 'stationery');
const SRC = path.join(OUT, 'src');

const TEXT = {
  es: { name: 'Nombre Apellido', role: 'Consultor/a de selección', endorse: 'Una empresa del Grupo Lanak', phone: 'Teléfono' },
  en: { name: 'First Last', role: 'Recruitment consultant', endorse: 'A Grupo Lanak company', phone: 'Phone' },
};
const VERSIONS = ['standard', 'cobrand'];
const svg = (name) => `../../logo/svg/${name}.svg`; // relative to stationery/src/
const head = (title, css) => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
${fontFaces('../../../../assets')}
*{margin:0;padding:0;box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:Poppins,sans-serif;color:${K.ink}}img{display:block}${css}</style></head><body>`;

// Business card: 85 × 55 mm trim + 3 mm bleed on every side = 91 × 61 mm pages (front, back).
function card(v, lang) {
  const T = TEXT[lang];
  const logo = v === 'cobrand'
    ? `<img src="${svg('lockups/leedtech-grupo-lanak-cobrand-colour-dark')}" style="width:62mm">`
    : `<img src="${svg('leedtech-primary-colour-dark')}" style="width:44mm">`;
  const back = v === 'cobrand'
    ? `<img src="${svg('lockups/leedtech-grupo-lanak-cobrand-black')}" style="width:62mm"><span class="web">${WEB}</span>`
    : `<img src="${svg('leedtech-symbol-black')}" style="height:16mm"><span class="end">${T.endorse.toUpperCase()}</span>`;
  return head(`Business card ${v} ${lang}`, `
@page{size:91mm 61mm;margin:0}
.side{width:91mm;height:61mm;position:relative;overflow:hidden;page-break-after:always}
.front{background:${K.ink};color:#fff}.back{background:${K.yellow};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4mm}
.logo{position:absolute;left:9mm;top:9mm}
.who{position:absolute;left:9mm;bottom:8.5mm;font-size:6.8pt;line-height:1.55}
.who b{font-family:Outfit;font-size:10pt;font-weight:600;display:block}
.who .c{color:${K.grey}}.bar{width:8mm;height:.8mm;background:${K.yellow};border-radius:.4mm;margin:2mm 0}
.end{font-size:5.5pt;font-weight:500;letter-spacing:.25em}.web{font-size:6.5pt;font-weight:500;letter-spacing:.1em}`) + `
<div class="side front"><div class="logo">${logo}</div>
<div class="who"><b>${T.name}</b>${T.role}<div class="bar"></div><span class="c">${esc(C.phone)} · ${esc(C.email)}<br>${esc(C.address)} · ${WEB}</span></div></div>
<div class="side back">${back}</div></body></html>`;
}

// A4 letterhead: logo top left, contact footer, faint globe corner. Body left empty.
function letterhead(v, lang) {
  const T = TEXT[lang];
  const logo = v === 'cobrand'
    ? `<img src="${svg('lockups/leedtech-grupo-lanak-cobrand-colour-light')}" style="width:82mm">`
    : `<img src="${svg('leedtech-primary-colour-light')}" style="width:58mm">`;
  return head(`Letterhead ${v} ${lang}`, `
@page{size:A4 portrait;margin:0}
.page{width:210mm;height:297mm;position:relative;overflow:hidden}
.logo{position:absolute;left:20mm;top:18mm}.bar{position:absolute;right:20mm;top:22mm;width:14mm;height:1.2mm;background:${K.yellow};border-radius:.6mm}
.globe{position:absolute;right:-62mm;top:-66mm;width:130mm;height:130mm;opacity:.5}
.foot{position:absolute;left:20mm;right:20mm;bottom:14mm;border-top:.25mm solid #ddd;padding-top:3mm;display:flex;justify-content:space-between;font-size:7.5pt;color:${K.grey}}
.foot b{color:${K.ink};font-weight:500}`) + `
<div class="page"><div class="logo">${logo}</div>
<div class="globe">${globe({ line: '#111111', orbit: K.yellow, cls: '' })}</div>
<div class="foot"><span>${esc(C.address)}</span><span>${esc(C.phone)} · ${esc(C.email)} · <b>${WEB}</b>${v === 'standard' ? ` · ${T.endorse}` : ''}</span></div></div></body></html>`;
}

// Email signature: table layout + inline styles only, so it survives Gmail and Outlook.
function signature(v, lang) {
  const T = TEXT[lang];
  const font = 'font-family:Poppins,Arial,Helvetica,sans-serif';
  const grey = `color:${K.grey};text-decoration:none`;
  const lines = `<div style="font-size:15px;font-weight:600">${T.name}</div>
      <div>${T.role} · LeedTech</div>
      <div style="color:${K.grey};font-size:12px;white-space:nowrap"><a href="tel:${C.phone.replaceAll(' ', '')}" style="${grey}">${C.phone}</a> · <a href="mailto:${C.email}" style="${grey}">${C.email}</a> · <a href="${B.website}" style="${grey}">${WEB}</a></div>`;
  const note = `<!-- LeedTech email signature (${v}, ${lang}). Replace the sample name and role.
     Before using it, change the logo src to the public URL of the PNG (email clients can't load
     relative paths). Then paste the table into the Gmail / Outlook signature settings. -->`;
  if (v === 'cobrand') {
    return `${note}
<table cellpadding="0" cellspacing="0" border="0" style="${font};color:${K.ink};font-size:13px;line-height:1.5">
  <tr><td style="padding-bottom:10px"><a href="${B.website}"><img src="../logo/png/lockups/leedtech-grupo-lanak-cobrand-colour-light-512w.png" width="240" alt="LeedTech | Grupo Lanak" style="display:block;border:0;width:240px;height:auto"></a></td></tr>
  <tr><td style="border-top:3px solid ${K.yellow};padding-top:8px;width:40px"></td></tr>
  <tr><td>
      ${lines}
  </td></tr>
</table>
`;
  }
  return `${note}
<table cellpadding="0" cellspacing="0" border="0" style="${font};color:${K.ink};font-size:13px;line-height:1.5">
  <tr>
    <td style="padding-right:16px;border-right:1px solid #dddddd;vertical-align:middle">
      <a href="${B.website}"><img src="../logo/png/leedtech-horizontal-colour-light-512w.png" width="150" alt="LeedTech" style="display:block;border:0;width:150px;height:auto"></a>
    </td>
    <td style="padding-left:16px;vertical-align:middle">
      ${lines}
      <div style="color:${K.grey};font-size:11px;margin-top:2px">${T.endorse}</div>
    </td>
  </tr>
</table>
`;
}

for (const lang of B.languages) {
  for (const v of VERSIONS) {
    const id = `${v}-${lang}`;
    const cardHtml = path.join(SRC, `business-card-${id}.html`);
    writeFile(cardHtml, card(v, lang));
    printPdf(cardHtml, path.join(OUT, `business-card-${id}.pdf`));
    // Preview: front and back side by side, trimmed (no bleed), on a light background.
    const prev = path.join(SRC, `business-card-${id}-preview.html`);
    writeFile(prev, card(v, lang).replace('</style>', `.side{width:85mm;height:55mm;border-radius:2mm;margin:6mm;display:inline-flex;box-shadow:0 1mm 3mm rgba(0,0,0,.25);vertical-align:top}
      .side.front{display:inline-block}.logo{left:6mm;top:6mm}.who{left:6mm;bottom:5.5mm}body{background:#ececec;white-space:nowrap}</style>`));
    screenshot(prev, path.join(OUT, `business-card-${id}-preview.png`), 760, 270);
    const lh = path.join(SRC, `letterhead-${id}.html`);
    writeFile(lh, letterhead(v, lang));
    printPdf(lh, path.join(OUT, `letterhead-${id}.pdf`));
    writeFile(path.join(OUT, `email-signature-${id}.html`), signature(v, lang));
    console.log(`stationery ${id} written`);
  }
}
if (!process.env.KEEP_SRC) fs.rmSync(SRC, { recursive: true, force: true }); // KEEP_SRC=1 keeps the HTML for checking
