// Shared bits for the HS Digital family documents: localised copy, brand CSS, accent motifs.
import { fontFaces, esc } from './common.mjs';
import { loadHs, markMarkup, MARK_LAYERS, MARK_BOX, SUBS } from '../lib/hs.mjs';

export { loadHs, SUBS };

// Copy for one language: brand.copy[lang] (falls back to Spanish for missing keys).
export function copyOf(B, lang) {
  return { ...B.copy.es, ...B.copy[lang] };
}
export const web = (B) => B.website.replace('https://', '');
export const use = (c, lang) => (typeof c.use === 'string' ? c.use : c.use[lang] || c.use.es);

// Inline mark (viewBox 0 0 371 371).
export const markSvg = (top, bottom, css = '') =>
  `<svg viewBox="0 0 371 371" style="${css}" aria-hidden="true">${markMarkup(top, bottom)}</svg>`;

// "Leaf halves": one half of the mark as a big graphic shape (the family's main device).
export function leaf(which, fill, css, opacity = 1) {
  const l = MARK_LAYERS.find((x) => x.id === which);
  return `<svg viewBox="${MARK_BOX.x} ${MARK_BOX.y} ${MARK_BOX.w} ${MARK_BOX.h}" style="position:absolute;${css}" aria-hidden="true"><path d="${l.d}" fill="${fill}" fill-opacity="${opacity}"/></svg>`;
}

// Accent motif on a phrase, per sub-brand (brand.json motif.type):
//  scribble = hand-drawn underline (Marketing) · marker = highlighter band (Design)
//  code = monospace brackets (Dev) · rank = underline with a rising tick (SEO) · plain = accent colour.
export function motif(type, text, colour, { dark = false } = {}) {
  const t = esc(text);
  // On dark grounds the band fills the whole word and the text turns Navy (text on yellow is always Navy).
  if (type === 'marker') return dark
    ? `<span style="background:${colour};color:#0B3768;padding:0 .12em;border-radius:.06em;white-space:nowrap">${t}</span>`
    : `<span style="background:linear-gradient(transparent 52%, ${colour} 52%, ${colour} 92%, transparent 92%);padding:0 .08em">${t}</span>`;
  if (type === 'code') return `<span style="color:${colour}"><span style="font-family:Consolas,'Cascadia Mono',monospace;font-weight:700;opacity:.9">&lt;</span>${t}<span style="font-family:Consolas,'Cascadia Mono',monospace;font-weight:700;opacity:.9">/&gt;</span></span>`;
  const svg = type === 'scribble'
    ? `<svg viewBox="0 0 300 24" preserveAspectRatio="none" style="position:absolute;left:-2%;bottom:-.16em;width:104%;height:.3em;overflow:visible" aria-hidden="true"><path d="M4 16 C 60 6, 120 4, 180 9 S 270 18, 296 8" fill="none" stroke="${colour}" stroke-width="7" stroke-linecap="round"/></svg>`
    : type === 'rank'
      ? `<svg viewBox="0 0 300 30" preserveAspectRatio="none" style="position:absolute;left:0;bottom:-.2em;width:100%;height:.3em;overflow:visible" aria-hidden="true"><path d="M2 24 L 240 24 L 270 6 L 298 6" fill="none" stroke="${colour}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : '';
  if (!svg) return `<span style="color:${colour}">${t}</span>`;
  return `<span style="position:relative;display:inline-block;white-space:nowrap">${t}${svg}</span>`;
}

// Headline with the motif applied to `mark` (a substring of `text`). Line breaks: "|" in text.
export function headline(text, mark, type, colour, opts) {
  const parts = mark && text.includes(mark) ? text.split(mark) : [text];
  const html = parts.length > 1 ? esc(parts[0]) + motif(type, mark, colour, opts) + esc(parts.slice(1).join(mark)) : esc(text);
  return html.replaceAll('|', '<br>');
}

// Base CSS for every HS document.
export function baseCss(H, assetsRel) {
  const { K } = H;
  return `${fontFaces(assetsRel, 'hs')}
:root{--navy:${K.navy};--blue:${K.blue};--blue7:${K.blueDeep};--sky:${K.sky};--mist:${K.mist};--ink:${K.ink};--slate:${K.slate};--line:${K.line};--acc:${K.accent || K.blue};--acc7:${K.accentDeep || K.blueDeep}}
body{font-family:Manrope,system-ui,'Segoe UI',sans-serif;color:${K.ink}}
.d{font-family:'Bricolage Grotesque',Manrope,system-ui,sans-serif}`;
}

// The accent colour to use for small text on white (sub-brand: accent 700; parent: Blue 700).
export const accText = (K) => K.accentDeep || K.blueDeep;
export const acc = (K) => K.accent || K.blue;
