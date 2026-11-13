# HS SEO — brand kit

HS SEO is the HS Digital group's search agency for small and local businesses in Madrid, Bilbao and across Spain. Technical, local and content SEO with clear reports and no lock-in.
*Que te encuentren en Google, sin humo.* / *Get found on Google, without the hype.*
Part of HS Digital ([kit](../hs-digital/), HS Digital Solutions LTD). Website: [hsseo.es](https://hsseo.es).
Preview of every logo: [preview-logos.png](preview-logos.png)

Built from the live site (theme settings, blocks, copy) and the site logo files, which are kept untouched in `source/` (team repo only).

## Logos

All in `logo/svg/` (vector) and `logo/png/` (transparent, 512 / 1024 / 2048 / 4096 px wide). The mark is the family's leaf "HS"; the wordmark is outlined Bricolage Grotesque (ExtraBold "HS" + Medium "SEO"), so no font is needed.

| Layout | Use it for |
|---|---|
| `hs-seo-endorsed-{es,en}-*` | **Default.** Logo + "Parte de HS Digital" / "Part of HS Digital". |
| `hs-seo-endorsed-stacked-{es,en}-*` | Square formats with the endorsement. |
| `hs-seo-horizontal-*` | Standalone: when HS Digital already appears nearby, or the space is small. |
| `hs-seo-stacked-*` | Square formats, standalone. |
| `hs-seo-wordmark-*` | When the mark is already nearby. |
| `hs-seo-mark-*` | Avatars, favicons, small sizes. |
| `hs-seo-app-icon` · `-navy` | Rounded Navy tile: white mark with the lower half in Verde Ranking, or all white. |

Colourways: `colour` (white/light, default), `navy` (one colour), `accent` (white + accent mark on Navy), `black` (one-colour print), `white` (Navy, Blue or photos).

Write the name **HS SEO** (capital HS, a space, then "SEO"). Accent: **Verde Ranking** (#00C389), graphic device: underline that rises at the end.

## Documents (Spanish + English)

| File | What |
|---|---|
| `guide/hs-seo-brand-guidelines-es.pdf` · `-en.pdf` | Brand guide, 16 portrait A4 pages |
| `guide/index.html` · `index.en.html` | Same guide as a web page (language switch top right) |
| `profile/hs-seo-business-profile-es.pdf` · `-en.pdf` | One-page business profile |
| `profile/hs-seo-business-profile-es.md` · `-en.md` | Profile text and boilerplate for directories and press |

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
- Rebuild: `node scripts/build-hs.mjs hs-seo`, then `node scripts/icons-hs.mjs`, `node scripts/docs/hs-{social,stationery,profile,guide}.mjs hs-seo`
- Fonts: Bricolage Grotesque and Manrope (SIL OFL, in `assets/fonts/`)

## Licence

Guide text and layouts: CC BY 4.0. The HS SEO name and logos are trademarks of HS Digital Solutions LTD: use them to refer to HS SEO (press, directories, partner pages), not to pretend to be it.
