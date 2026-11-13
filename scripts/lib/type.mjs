// Set text as outlined SVG paths with opentype.js, so files open without the font installed.
import opentype from 'opentype.js';

const cache = new Map();
export function loadFont(file) {
  if (!cache.has(file)) cache.set(file, opentype.loadSync(file));
  return cache.get(file);
}

// Path data for `text` with its baseline at (x, y). letterSpacing in the same units as size
// (like CSS letter-spacing in px). Kerning on, ligatures off (wordmarks keep every letter).
export function textPathData(font, text, { x = 0, y = 0, size, letterSpacing = 0 }) {
  return font.getPath(text, x, y, size, {
    kerning: true,
    letterSpacing: letterSpacing / size,
    features: { liga: false, rlig: false },
  }).toPathData(2);
}

// Advance width of `text`, including letter spacing after every letter but the last.
export function textWidth(font, text, { size, letterSpacing = 0 }) {
  return font.getAdvanceWidth(text, size, { kerning: true, letterSpacing: letterSpacing / size, features: { liga: false, rlig: false } });
}
