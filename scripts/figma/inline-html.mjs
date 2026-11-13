// Makes an HTML file self-contained (images, stylesheets and fonts as data URIs) so Figma's
// HTML import can turn it into layers 1:1. Usage:
//   node scripts/figma/inline-html.mjs <in.html> <out.html> [extra css]
import fs from 'node:fs';
import path from 'node:path';

const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const dataUri = (abs) => `data:${MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(abs).toString('base64')}`;
const local = (ref) => ref && !/^(data:|https?:|mailto:|tel:|#)/.test(ref);

export function inline(file, extraCss = '') {
  const dir = path.dirname(path.resolve(file));
  let html = fs.readFileSync(file, 'utf8');
  const cssUrls = (css, base) => css.replace(/url\(['"]?([^'")]+)['"]?\)/g, (m, ref) => local(ref) ? `url('${dataUri(path.resolve(base, ref))}')` : m);
  html = html.replace(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (m, ref) => {
    const abs = path.resolve(dir, ref);
    return `<style>${cssUrls(fs.readFileSync(abs, 'utf8'), path.dirname(abs))}</style>`;
  });
  html = html.replace(/<link[^>]+rel="(icon|alternate)"[^>]*>/g, '');
  html = html.replace(/(<img[^>]*\ssrc=")([^"]+)(")/g, (m, a, ref, b) => local(ref) ? a + dataUri(path.resolve(dir, ref)) + b : m);
  html = html.replace(/<style>([\s\S]*?)<\/style>/g, (m, css) => `<style>${cssUrls(css, dir)}</style>`);
  return html.replace('</head>', `<style>.lang{display:none!important}${extraCss}</style></head>`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'))) {
  const [, , input, output, css = ''] = process.argv;
  fs.writeFileSync(output, inline(input, css));
  console.log(`${output}: ${(fs.statSync(output).size / 1e6).toFixed(2)} MB`);
}
