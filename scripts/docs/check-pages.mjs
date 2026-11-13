// QA helper: screenshot single pages of a portrait document (guide or profile) to look at them.
// Usage: node scripts/docs/check-pages.mjs <document.html> <out-dir> <page,page,...>
// e.g.   node scripts/docs/check-pages.mjs brands/leedtech/guide/index.en.html _check 1,7,11
import fs from 'node:fs';
import path from 'node:path';
import { screenshot } from './common.mjs';

const [,, html, out, list = '1'] = process.argv;
if (!html || !out) throw new Error('usage: check-pages.mjs <document.html> <out-dir> <page,page,...>');
fs.mkdirSync(out, { recursive: true });
const src = fs.readFileSync(html, 'utf8');
for (const n of list.split(',')) {
  const tmp = path.join(path.dirname(html), `_check-${n}.html`);
  fs.writeFileSync(tmp, src.replace('</head>', `<style>body{background:#fff}.lang{display:none}.page{display:none!important;margin:0!important;box-shadow:none!important}.page:nth-of-type(${n}){display:flex!important}</style></head>`));
  try { screenshot(tmp, path.join(out, `page-${n}.png`), 860, 1160); } finally { fs.rmSync(tmp); }
  console.log(`page ${n} → ${path.join(out, `page-${n}.png`)}`);
}
