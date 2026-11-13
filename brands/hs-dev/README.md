# HS Dev — brand kit

HS Dev is the HS Digital group's web development and WordPress maintenance studio for small businesses in Madrid, Bilbao and across Spain. We build your website, connect it to your tools and keep it up to date.
*Webs que funcionan. Y que siguen funcionando.* / *Websites that work. And keep working.*
Part of HS Digital ([kit](../hs-digital/), HS Digital Solutions LTD). Website: [hsdev.es](https://hsdev.es).
Preview of every logo: [preview-logos.png](preview-logos.png)

Built from the live site (theme settings, blocks, copy) and the site logo files, which are kept untouched in `source/` (team repo only).

## Logos

All in `logo/svg/` (vector) and `logo/png/` (transparent, 512 / 1024 / 2048 / 4096 px wide). The mark is the family's leaf "HS"; the wordmark is outlined Bricolage Grotesque (ExtraBold "HS" + Medium "Dev"), so no font is needed.

| Layout | Use it for |
|---|---|
| `hs-dev-endorsed-{es,en}-*` | **Default.** Logo + "Parte de HS Digital" / "Part of HS Digital". |
| `hs-dev-endorsed-stacked-{es,en}-*` | Square formats with the endorsement. |
| `hs-dev-horizontal-*` | Standalone: when HS Digital already appears nearby, or the space is small. |
| `hs-dev-stacked-*` | Square formats, standalone. |
| `hs-dev-wordmark-*` | When the mark is already nearby. |
| `hs-dev-mark-*` | Avatars, favicons, small sizes. |
| `hs-dev-app-icon` · `-navy` | Rounded tile: Navy mark on Violeta Compilado, or white on Navy. |

Colourways: `colour` (white/light, default), `navy` (one colour), `accent` (mark on the accent), `black` (one-colour print), `white` (Navy, Blue or photos).

Write the name **HS Dev** (capital HS, a space, then "Dev"). Accent: **Violeta Compilado** (#B39DFF), graphic device: code brackets.

## Documents (Spanish + English)

| File | What |
|---|---|
| `guide/hs-dev-brand-guidelines-es.pdf` · `-en.pdf` | Brand guide, 16 portrait A4 pages |
| `guide/index.html` · `index.en.html` | Same guide as a web page (language switch top right) |
| `profile/hs-dev-business-profile-es.pdf` · `-en.pdf` | One-page business profile |
| `profile/hs-dev-business-profile-es.md` · `-en.md` | Profile text and boilerplate for directories and press |

## Stationery (`stationery/`, each as `-es` and `-en`, in an **endorsed** and a **standalone** version)

| File | What |
|---|---|
| `business-card-{endorsed|standalone}-{lang}-preview.png` | Front + back preview (sample name) |
| `business-card-{endorsed|standalone}-{lang}.pdf` | Print PDF, 85 × 55 mm + 3 mm bleed (**team repo only**) |
| `letterhead-{endorsed|standalone}-{lang}.pdf` | A4 letterhead, body left empty |
| `email-signature-{endorsed|standalone}-{lang}.html` | Change the name/role, and point the logo `src` to the public PNG URL before pasting into Gmail/Outlook |

Cards with a real person's details go in `private/` (team repo only; people are listed in `hs-digital/private/people.json`).

## Icons and social

- `icons/`: favicon.ico / .svg / 16 / 32, Apple touch icon, Android icons (incl. maskable), `site.webmanifest`, `head-snippet.html` to paste into the site's `<head>`; `favicon-mark.svg` is the plain two-tone mark
- `social/`: avatars (accent, navy, light), Open Graph image, LinkedIn, X, Facebook and YouTube covers, each as `-es` and `-en`

## Data

- `brand.json`: colours (with CMYK/Pantone estimates), fonts, voice, services, contacts, Spanish and English copy (single source of truth)
- Rebuild: `node scripts/build-hs.mjs hs-dev`, then `node scripts/icons-hs.mjs hs-dev`, `node scripts/docs/hs-{social,stationery,profile,guide}.mjs hs-dev`
- Fonts: Bricolage Grotesque and Manrope (SIL OFL, in `assets/fonts/`)

## Licence

Guide text and layouts: CC BY 4.0. The HS Dev name and logos are trademarks of HS Digital Solutions LTD: use them to refer to HS Dev (press, directories, partner pages), not to pretend to be it.
