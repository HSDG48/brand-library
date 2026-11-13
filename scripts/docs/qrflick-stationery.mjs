// QRflick stationery, every language: business card (print PDF with 3 mm bleed + preview PNG),
// A4 letterhead (PDF), email signature (HTML). Public files are blank templates with a sample name.
// The team's filled-in card (with phone) goes to brands/qrflick/private/ (team repo only).
// Run: node scripts/docs/qrflick-stationery.mjs   (from brand-library/)
import fs from 'node:fs';
import path from 'node:path';
import { loadBrand, fontFaces, writeFile, printPdf, screenshot, esc } from './common.mjs';
import { markMarkup } from '../lib/qrflick.mjs';

const { dir, brand: B, hex } = loadBrand('qrflick');
const K = { teal: hex('Teal'), deep: hex('Teal Deep'), ink: hex('Ink'), slate: hex('Slate'), line: hex('Line'), mist: hex('Teal Mist') };
const C = B.contact, WEB = B.website.replace('https://', '');
const OUT = path.join(dir, 'stationery');
const SRC = path.join(OUT, 'src');

const TEXT = {
  es: { name: 'Nombre Apellido', role: 'Equipo QRflick', tagline: 'Imprime una vez. Cámbialo siempre.' },
  en: { name: 'First Last', role: 'QRflick team', tagline: 'Print once. Change forever.' },
};
// The team's own cards (real name, role, phone) come from private/people.json, which stays in the team repo.
const PEOPLE_FILE = path.join(dir, 'private/people.json');
const PEOPLE = fs.existsSync(PEOPLE_FILE) ? JSON.parse(fs.readFileSync(PEOPLE_FILE, 'utf8')) : [];

const svg = (name) => `../../logo/svg/${name}.svg`; // relative to stationery/src/
const mark = (colour, css) => `<svg viewBox="0 0 100 100" style="${css}" aria-hidden="true">${markMarkup(colour)}</svg>`;
// One scan-frame corner (top right), used as a quiet accent.
const corner = (colour, css) => `<svg viewBox="0 0 40 40" style="${css}" aria-hidden="true"><path d="M6 6H24Q34 6 34 16V34" fill="none" stroke="${colour}" stroke-width="6" stroke-linecap="round"/></svg>`;
const head = (title, css) => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
${fontFaces('../../../../assets', 'qrflick')}
*{margin:0;padding:0;box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:Archivo,'Helvetica Neue',Arial,sans-serif;color:${K.ink}}img,svg{display:block}${css}</style></head><body>`;

// Business card: 85 × 55 mm trim + 3 mm bleed on every side = 91 × 61 mm pages (front, back).
function card(lang, person) {
  const T = TEXT[lang];
  const name = person ? person.name : T.name, role = person ? person.role[lang] : T.role;
  const phone = person ? `${esc(person.phone)}<br>` : '';
  return head(`Business card ${lang}`, `
@page{size:91mm 61mm;margin:0}
.side{width:91mm;height:61mm;position:relative;overflow:hidden;page-break-after:always}
.front{background:#fff}.back{background:${K.teal};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3.5mm}
.logo{position:absolute;left:9mm;top:9mm}
.who{position:absolute;left:9mm;bottom:8.5mm;font-size:6.6pt;line-height:1.55;color:${K.slate}}
.who b{font-size:10.5pt;font-weight:800;letter-spacing:-.02em;color:${K.ink};display:block;line-height:1.2}
.who .r{color:${K.deep};font-weight:700;font-size:5.6pt;letter-spacing:.14em;text-transform:uppercase;margin:.6mm 0 2.4mm;display:block}
.tag{font-size:8pt;font-weight:800;letter-spacing:-.01em}.web{font-size:6pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.85}
.end{position:absolute;bottom:7mm;font-size:5pt;opacity:.75}`) + `
<div class="side front"><div class="logo"><img src="${svg('qrflick-horizontal-colour-light')}" style="width:34mm"></div>
${corner(K.teal, 'position:absolute;right:8mm;top:8mm;width:6mm;height:6mm')}
<div class="who"><b>${esc(name)}</b><span class="r">${esc(role)}</span>${phone}${esc(C.email)}<br>${WEB}</div></div>
<div class="side back">${mark('#FFFFFF', 'width:15mm;height:15mm')}<span class="tag">${T.tagline}</span><span class="web">${WEB}</span>
<span class="end">${esc(B.endorsement[lang])}</span></div></body></html>`;
}

// A4 letterhead: logo top left, one scan-frame corner top right, contact footer. Body left empty.
function letterhead(lang) {
  return head(`Letterhead ${lang}`, `
@page{size:A4 portrait;margin:0}
.page{width:210mm;height:297mm;position:relative;overflow:hidden}
.foot{position:absolute;left:20mm;right:20mm;bottom:14mm;border-top:.25mm solid ${K.line};padding-top:3mm;display:flex;justify-content:space-between;font-size:7.5pt;color:${K.slate}}
.foot b{color:${K.deep};font-weight:700}.foot .hs{display:flex;align-items:center;gap:2mm}.foot .hs img{height:5mm}`) + `
<div class="page"><img src="${svg('qrflick-horizontal-colour-light')}" style="position:absolute;left:20mm;top:18mm;width:48mm">
${corner(K.teal, 'position:absolute;right:18mm;top:16mm;width:12mm;height:12mm')}
<div class="foot"><span>${esc(C.email)} · <b>${WEB}</b></span><span class="hs"><img src="../../${B.parent.logo}" alt="HS Digital">${esc(B.endorsement[lang])} · ${esc(B.parent.legalName)}</span></div></div></body></html>`;
}

// Email signature: table layout + inline styles only, so it survives Gmail and Outlook.
function signature(lang) {
  const T = TEXT[lang];
  const font = "font-family:Archivo,'Helvetica Neue',Arial,Helvetica,sans-serif";
  const link = `color:${K.deep};text-decoration:none`;
  return `<!-- QRflick email signature (${lang}). Replace the sample name and role.
     Before using it, change the logo src to the public URL of the PNG (email clients can't load
     relative paths). Then paste the table into the Gmail / Outlook signature settings. -->
<table cellpadding="0" cellspacing="0" border="0" style="${font};color:${K.ink};font-size:13px;line-height:1.5">
  <tr>
    <td style="padding-right:16px;border-right:2px solid ${K.teal};vertical-align:middle">
      <a href="${B.website}"><img src="../logo/png/qrflick-mark-colour-light-512w.png" width="56" alt="QRflick" style="display:block;border:0;width:56px;height:auto"></a>
    </td>
    <td style="padding-left:16px;vertical-align:middle">
      <div style="font-size:15px;font-weight:800">${T.name}</div>
      <div style="color:${K.slate}">${T.role}</div>
      <div style="font-size:12px;white-space:nowrap"><a href="mailto:${C.email}" style="${link}">${C.email}</a> · <a href="${B.website}" style="${link};font-weight:700">${WEB}</a></div>
      <div style="color:${K.slate};font-size:11px;margin-top:2px">${T.tagline} · ${esc(B.endorsement[lang])}</div>
    </td>
  </tr>
</table>
`;
}

// Preview: front and back side by side, trimmed (no bleed), on a light background.
const previewCss = `.side{width:85mm;height:55mm;border-radius:2mm;margin:6mm;display:inline-flex;box-shadow:0 1mm 3mm rgba(0,0,0,.25);vertical-align:top}
  .side.front{display:inline-block}.logo{left:6mm;top:6mm}.who{left:6mm;bottom:5.5mm}body{background:#ececec;white-space:nowrap}</style>`;

function renderCard(lang, person, outDir, base) {
  fs.mkdirSync(outDir, { recursive: true });
  const html = path.join(SRC, `${base}.html`);
  writeFile(html, card(lang, person));
  printPdf(html, path.join(outDir, `${base}.pdf`));
  const prev = path.join(SRC, `${base}-preview.html`);
  writeFile(prev, card(lang, person).replace('</style>', previewCss));
  screenshot(prev, path.join(outDir, `${base}-preview.png`), 760, 270);
}

for (const lang of B.languages) {
  renderCard(lang, null, OUT, `business-card-${lang}`);
  const lh = path.join(SRC, `letterhead-${lang}.html`);
  writeFile(lh, letterhead(lang));
  printPdf(lh, path.join(OUT, `letterhead-${lang}.pdf`));
  writeFile(path.join(OUT, `email-signature-${lang}.html`), signature(lang));
  for (const p of PEOPLE) renderCard(lang, p, path.join(dir, 'private'), `business-card-${p.id}-${lang}`);
  console.log(`stationery ${lang} written`);
}
if (!process.env.KEEP_SRC) fs.rmSync(SRC, { recursive: true, force: true }); // KEEP_SRC=1 keeps the HTML for checking
