// Shared helpers for HTML documents (guide, profile, social images) and rendering them with Edge.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const ROOT = path.resolve(import.meta.dirname, '../..');

export function loadBrand(slug) {
  const dir = path.join(ROOT, 'brands', slug);
  const brand = JSON.parse(fs.readFileSync(path.join(dir, 'brand.json'), 'utf8'));
  const all = [...brand.colors, ...(brand.groupColors || [])];
  const hex = (name) => all.find((c) => c.name === name).hex;
  return { dir, brand, hex };
}

// Read an SVG file and return its inner markup + viewBox, for inlining.
export function inlineSvg(file, { cls = '', label = '' } = {}) {
  const s = fs.readFileSync(file, 'utf8');
  const vb = s.match(/viewBox="([^"]*)"/)[1];
  const inner = s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>.*?<\/title>/, '');
  const aria = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg class="${cls}" viewBox="${vb}" ${aria} xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

// Decorative globe with a dashed orbit (the "Globo y órbita" brand element).
export function globe({ line = '#ffffff', orbit = '#FFC20E', cls = 'globe' } = {}) {
  const R = 400;
  const meridians = [0.2, 0.45, 0.7, 0.92]
    .map((k) => `<ellipse cx="0" cy="0" rx="${R * k}" ry="${R}" />`)
    .join('');
  const parallels = [-0.66, -0.33, 0, 0.33, 0.66]
    .map((k) => {
      const y = R * k;
      const half = Math.sqrt(R * R - y * y);
      return `<line x1="${-half}" y1="${y}" x2="${half}" y2="${y}" />`;
    })
    .join('');
  return `<svg class="${cls}" viewBox="-520 -520 1040 1040" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="${line}" stroke-width="2.2" stroke-opacity="0.22">
<circle r="${R}" stroke-opacity="0.3"/>${meridians}<line x1="0" y1="-${R}" x2="0" y2="${R}"/>${parallels}</g>
<ellipse rx="510" ry="170" transform="rotate(-22)" fill="none" stroke="${orbit}" stroke-width="3" stroke-dasharray="14 12"/>
<circle cx="380" cy="-300" r="9" fill="${orbit}" transform="rotate(8)"/>
</svg>`;
}

// Font files per brand, in assets/fonts: [family, file, weight].
const FONT_SETS = {
  leedtech: [
    ['Outfit', 'Outfit-Variable.ttf', '100 900'],
    ['Poppins', 'Poppins-Light.ttf', 300],
    ['Poppins', 'Poppins-Regular.ttf', 400],
    ['Poppins', 'Poppins-Medium.ttf', 500],
    ['Poppins', 'Poppins-SemiBold.ttf', 600],
  ],
  qrflick: [['Archivo', 'Archivo-Variable.ttf', '100 900']],
};

export function fontFaces(relToAssets, set = 'leedtech') {
  const f = (family, file, weight, style = 'normal') =>
    `@font-face{font-family:'${family}';src:url('${relToAssets}/fonts/${file}') format('truetype');font-weight:${weight};font-style:${style};font-display:swap}`;
  return FONT_SETS[set].map(([family, file, weight]) => f(family, file, weight)).join('\n');
}

export function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find((p) => fs.existsSync(p));

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

// The Edge launcher can return before the headless browser has written its output,
// so wait until the output file exists and its size has stopped changing.
function edge(args, outFile) {
  if (!EDGE) throw new Error('Edge or Chrome is needed to render documents');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'brandlib-'));
  fs.rmSync(outFile, { force: true });
  try {
    execFileSync(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
      `--user-data-dir=${profile}`, '--virtual-time-budget=4000', ...args], { stdio: 'ignore', timeout: 120000 });
    let last = -1;
    for (let t = 0; t < 600; t++) {
      const size = fs.existsSync(outFile) ? fs.statSync(outFile).size : -1;
      if (size > 0 && size === last) break;
      last = size;
      sleep(250);
    }
    if (!fs.existsSync(outFile)) throw new Error(`Edge did not write ${outFile}`);
  } finally {
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* still in use; temp dir */ }
  }
}

export function screenshot(htmlFile, pngFile, w, h) {
  edge([`--window-size=${w},${h}`, `--screenshot=${path.resolve(pngFile)}`, pathToFileURL(htmlFile).href], path.resolve(pngFile));
}

export function printPdf(htmlFile, pdfFile) {
  edge(['--no-pdf-header-footer', `--print-to-pdf=${path.resolve(pdfFile)}`, pathToFileURL(htmlFile).href], path.resolve(pdfFile));
}
