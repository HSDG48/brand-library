// HS family stationery, every language: business card (print PDF, 3 mm bleed + preview PNG),
// A4 letterhead (PDF), email signature (HTML). Sub-brands get two versions, like LeedTech's
// co-brand/standard: "endorsed" (Parte de HS Digital) and "standalone". The parent has one.
// Public files are blank templates (sample name). Team cards come from hs-digital/private/people.json
// and are written to each brand's private/ folder (team repo only).
// Run: node scripts/docs/hs-stationery.mjs [slug ...]   (after build-hs.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { writeFile, printPdf, screenshot, esc } from './common.mjs';
import { FAMILY, brandDir } from '../lib/hs.mjs';
import { loadHs, copyOf, web, markSvg, baseCss, acc, accText } from './hs-common.mjs';

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : FAMILY;
const PEOPLE_FILE = path.join(brandDir('hs-digital'), 'private/people.json');
const PEOPLE = fs.existsSync(PEOPLE_FILE) ? JSON.parse(fs.readFileSync(PEOPLE_FILE, 'utf8')) : [];
const SAMPLE = { es: { name: 'Nombre Apellido', team: (n) => `Equipo ${n}` }, en: { name: 'First Last', team: (n) => `${n} team` } };
const PARENT = loadHs('hs-digital');

const svg = (H, name) => `../../logo/svg/${name}.svg`; // relative to stationery/src/
const head = (H, title, css) => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
${baseCss(H, '../../../../assets')}
*{margin:0;padding:0;box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
img,svg{display:block}${css}</style></head><body>`;

// Logo file for a version: endorsed lockup / plain horizontal.
const logoName = (H, v, lang) => (v === 'endorsed' ? `${H.slug}-endorsed-${lang}-colour` : `${H.slug}-horizontal-colour`);

// The four sub-brand domains as accent-dot chips (parent pieces).
const familyRow = (fsz, gap) => PARENT.brand.family.members.map((s) => { const S = loadHs(s); return `<span style="display:inline-flex;align-items:center;gap:${gap * 0.6}mm;margin-right:${gap}mm"><i style="width:${fsz * 0.55}pt;height:${fsz * 0.55}pt;border-radius:50%;background:${S.K.accent};display:inline-block"></i>${web(S.brand)}</span>`; }).join('');

// Business card: 85 × 55 mm trim + 3 mm bleed = 91 × 61 mm pages (front, back).
function card(H, v, lang, person) {
  const { brand: B, K, isParent } = H, T = copyOf(B, lang), C = B.contact;
  const name = person ? person.name : SAMPLE[lang].name;
  const role = person ? person.role[lang] : SAMPLE[lang].team(B.name);
  const phone = person ? person.phone : C.phone;
  const back = isParent
    ? `<div class="side back" style="background:${K.navy};color:#fff">
      ${markSvg('#fff', '#fff', 'width:15mm;height:15mm;position:relative')}<span class="web" style="position:relative">${web(B)}</span>
      <span class="fam" style="position:relative">${familyRow(5.4, 2.2)}</span></div>`
    : `<div class="side back" style="background:${K.accent};color:${K.navy}">
      ${markSvg(K.navy, K.navy, 'width:15mm;height:15mm;position:relative')}<span class="tag d" style="position:relative">${esc(T.promise.replaceAll('|', ' '))}</span><span class="web" style="position:relative">${web(B)}</span>
      ${v === 'endorsed' ? `<span class="end">${esc(B.endorsement[lang])} · ${web(PARENT.brand)}</span>` : ''}</div>`;
  return head(H, `Business card ${lang}`, `
@page{size:91mm 61mm;margin:0}
.side{width:91mm;height:61mm;position:relative;overflow:hidden;page-break-after:always}
.front{background:#fff}.back{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3mm}
.logo{position:absolute;left:9mm;top:9mm}
.who{position:absolute;left:9mm;bottom:8.5mm;font-size:6.5pt;line-height:1.6;color:${K.slate}}
.who b{font-family:'Bricolage Grotesque';font-size:11pt;font-weight:800;letter-spacing:-.02em;color:${K.navy};display:block;line-height:1.15}
.who .r{color:${accText(K)};font-weight:700;font-size:5.5pt;letter-spacing:.14em;text-transform:uppercase;margin:.8mm 0 2.2mm;display:block}
.tag{font-size:8.5pt;font-weight:750;letter-spacing:-.01em;max-width:62mm;text-align:center;line-height:1.2}
.web{font-size:6pt;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
.fam{font-size:5.4pt;font-weight:600;opacity:.9;margin-top:1mm}.end{position:absolute;bottom:7mm;font-size:5pt;font-weight:600;opacity:.8}`) + `
<div class="side front"><div class="logo"><img src="${svg(H, logoName(H, v, lang))}" style="height:${v === 'endorsed' ? 10.5 : 9}mm"></div>
${markSvg(K.sky, K.sky, 'position:absolute;right:-10mm;bottom:-12mm;width:42mm;height:42mm')}
<div style="position:absolute;right:9mm;top:9.5mm;width:2.6mm;height:2.6mm;border-radius:50%;background:${acc(K)}"></div>
<div class="who"><b>${esc(name)}</b><span class="r">${esc(role)}</span>${esc(phone)}<br>${esc(C.email)}<br>${web(B)}</div></div>
${back}</body></html>`;
}

// A4 letterhead: logo top left, a leaf half bleeding off the top right, contact footer.
function letterhead(H, v, lang) {
  const { brand: B, K, isParent } = H, C = B.contact;
  const endorse = v === 'endorsed'
    ? `<span class="hs">${markSvg(K.navy, K.blue, 'height:5mm;width:5mm')}${esc(B.endorsement[lang])} · ${esc(B.legalName)}</span>`
    : isParent ? `<span class="hs">${familyRow(7, 3)}</span>` : `<span>${esc(B.legalName)}</span>`;
  return head(H, `Letterhead ${lang}`, `
@page{size:A4 portrait;margin:0}
.page{width:210mm;height:297mm;position:relative;overflow:hidden}
.foot{position:absolute;left:20mm;right:20mm;bottom:13mm;border-top:.25mm solid ${K.line};padding-top:3mm;font-size:7.3pt;color:${K.slate};line-height:1.6}
.row{display:flex;justify-content:space-between;align-items:center}.foot b{color:${K.navy};font-weight:700}
.hs{display:flex;align-items:center;gap:2mm}`) + `
<div class="page"><div style="position:absolute;left:0;right:0;top:0;height:2mm;background:${acc(K)}"></div>
${markSvg(K.sky, K.sky, 'position:absolute;right:-16mm;top:-14mm;width:72mm;height:72mm')}
<img src="${svg(H, logoName(H, v, lang))}" style="position:absolute;left:20mm;top:18mm;height:${v === 'endorsed' ? 15 : 13}mm">
<div class="foot"><div class="row"><span>${esc(C.email)} · ${esc(C.phone)} · <b>${web(B)}</b></span>${endorse}</div>
<div>${C.offices.map((o) => esc(o.address)).join(' · ')}</div></div></div></body></html>`;
}

// Email signature: table layout + inline styles only (Gmail, Outlook).
function signature(H, v, lang) {
  const { brand: B, K } = H, T = copyOf(B, lang), C = B.contact;
  const font = "font-family:Manrope,'Segoe UI',Arial,Helvetica,sans-serif";
  const link = `color:${K.blueDeep};text-decoration:none`;
  const endorse = v === 'endorsed' ? `<div style="font-size:11px;color:${K.slate};margin-top:6px"><span style="display:inline-block;width:14px;height:3px;border-radius:2px;background:${acc(K)};vertical-align:middle;margin-right:6px"></span>${esc(B.endorsement[lang])} · <a href="${PARENT.brand.website}" style="${link}">${web(PARENT.brand)}</a></div>` : '';
  return `<!-- ${B.name} email signature (${v}, ${lang}). Replace the sample name and role.
     Before using it, change the logo src to the public URL of the PNG (email clients can't load
     relative paths). Then paste the table into the Gmail / Outlook signature settings. -->
<table cellpadding="0" cellspacing="0" border="0" style="${font};color:${K.ink};font-size:13px;line-height:1.5">
  <tr>
    <td style="padding-right:16px;border-right:3px solid ${acc(K)};vertical-align:middle">
      <a href="${B.website}"><img src="../logo/png/${H.slug}-mark-colour-512w.png" width="56" alt="${B.name}" style="display:block;border:0;width:56px;height:auto"></a>
    </td>
    <td style="padding-left:16px;vertical-align:middle">
      <div style="font-size:15px;font-weight:800;color:${K.navy}">${SAMPLE[lang].name}</div>
      <div style="color:${K.slate}">${SAMPLE[lang].team(B.name)}</div>
      <div style="font-size:12px;white-space:nowrap"><a href="mailto:${C.email}" style="${link}">${C.email}</a> · ${C.phone} · <a href="${B.website}" style="${link};font-weight:700">${web(B)}</a></div>
      <div style="color:${K.slate};font-size:11px;margin-top:2px">${esc(T.promise.replaceAll('|', ' '))}</div>
      ${endorse}
    </td>
  </tr>
</table>
`;
}

// Preview: front and back side by side, trimmed (no bleed).
const previewCss = `.side{width:85mm;height:55mm;border-radius:2mm;margin:6mm;display:inline-flex;box-shadow:0 1mm 3mm rgba(0,0,0,.25);vertical-align:top}
  .side.front{display:inline-block}.logo{left:6mm;top:6mm}.who{left:6mm;bottom:5.5mm}body{background:#e9edf2;white-space:nowrap}</style>`;

function renderCard(H, v, lang, person, outDir, base, SRC) {
  fs.mkdirSync(outDir, { recursive: true });
  const html = path.join(SRC, `${base}.html`);
  writeFile(html, card(H, v, lang, person));
  printPdf(html, path.join(outDir, `${base}.pdf`));
  const prev = path.join(SRC, `${base}-preview.html`);
  writeFile(prev, card(H, v, lang, person).replace('</style>', previewCss));
  screenshot(prev, path.join(outDir, `${base}-preview.png`), 760, 270);
}

for (const slug of slugs) {
  const H = loadHs(slug);
  const OUT = path.join(H.dir, 'stationery'), SRC = path.join(OUT, 'src');
  const versions = H.isParent ? [''] : ['endorsed', 'standalone'];
  for (const lang of H.brand.languages) {
    for (const v of versions) {
      const tag = v ? `${v}-${lang}` : lang;
      renderCard(H, v, lang, null, OUT, `business-card-${tag}`, SRC);
      const lh = path.join(SRC, `letterhead-${tag}.html`);
      writeFile(lh, letterhead(H, v, lang));
      printPdf(lh, path.join(OUT, `letterhead-${tag}.pdf`));
      writeFile(path.join(OUT, `email-signature-${tag}.html`), signature(H, v, lang));
      for (const p of PEOPLE) renderCard(H, v, lang, p, path.join(H.dir, 'private'), `business-card-${p.id}-${tag}`, SRC);
    }
  }
  if (!process.env.KEEP_SRC) fs.rmSync(SRC, { recursive: true, force: true });
  console.log(`${slug}: stationery`);
}
