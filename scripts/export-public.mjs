// Copies the public part of this repo into a sibling folder that is the public repo.
// Everything matching private.txt (plus tooling folders) is left out.
// Usage: node scripts/export-public.mjs [target]   default target: ../brand-library-public
// The target's .git folder is kept, so you can commit and push from there.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = path.resolve(process.argv[2] || path.join(ROOT, '..', 'brand-library-public'));
if (TARGET === ROOT || TARGET.startsWith(ROOT + path.sep)) throw new Error('Target must be outside the repo');

const ALWAYS = ['.git/**', 'node_modules/**', '_check/**', '.claude-flow/**', '.claude/**', '**/.env*', 'private.txt'];
const toRegex = (glob) => new RegExp('^' + glob
  .replace(/[.+^${}()|[\]\\]/g, '\\$&')
  .replace(/\*\*\/?/g, '\u0000')
  .replace(/\*/g, '[^/]*')
  .replace(/\u0000/g, '.*') + '$');
const patterns = [...ALWAYS, ...fs.readFileSync(path.join(ROOT, 'private.txt'), 'utf8')
  .split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))].map(toRegex);
const isPrivate = (rel) => patterns.some((re) => re.test(rel) || re.test(rel + '/'));

// Clear the target except its .git, then copy.
fs.mkdirSync(TARGET, { recursive: true });
for (const e of fs.readdirSync(TARGET)) if (e !== '.git') fs.rmSync(path.join(TARGET, e), { recursive: true, force: true });

let copied = 0, skipped = 0;
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    const rel = path.relative(ROOT, abs).split(path.sep).join('/');
    if (isPrivate(e.isDirectory() ? rel + '/' : rel)) { skipped++; continue; }
    if (e.isDirectory()) { walk(abs); continue; }
    const out = path.join(TARGET, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.copyFileSync(abs, out);
    copied++;
  }
})(ROOT);
console.log(`Public copy in ${TARGET}: ${copied} files copied, ${skipped} private paths left out`);
