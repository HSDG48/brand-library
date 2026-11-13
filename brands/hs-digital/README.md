# HS Digital — brand kit

HS Digital is the group behind HS Marketing, HS SEO, HS Design and HS Dev. When your project needs more than one speciality, we solve it in-house with a single point of contact.
*Un grupo, cinco especialidades.* / *One group, five specialities.*
Parent brand of the HS family: [HS Marketing](../hs-marketing/), [HS SEO](../hs-seo/), [HS Dev](../hs-dev/), [HS Design](../hs-design/). Legal name: HS Digital Solutions LTD. Website: [hsdigital.es](https://hsdigital.es) · [hsdigisolutions.com](https://hsdigisolutions.com).
Preview of every logo: [preview-logos.png](preview-logos.png)

Built from the live site (theme settings, blocks, copy) and the site logo files, which are kept untouched in `source/` (team repo only).

## Logos

All in `logo/svg/` (vector) and `logo/png/` (transparent, 512 / 1024 / 2048 / 4096 px wide). The mark is the family's leaf "HS"; the wordmark is outlined Bricolage Grotesque (ExtraBold "HS" + Medium "Digital"), so no font is needed.

| Layout | Use it for |
|---|---|
| `hs-digital-horizontal-*` | Default. Mark + "HS Digital". |
| `hs-digital-solutions-horizontal-*` | Formal / legal pieces: "HS Digital Solutions". |
| `hs-digital-stacked-*` | Square formats. |
| `hs-digital-wordmark-*` | When the mark is already nearby. |
| `hs-digital-mark-*` | Avatars, favicons, small sizes. |
| `hs-digital-app-icon` · `-light` | Rounded tile. |
| `hs-digital-family-colour` | The group with its four specialities (presentations, the group block). |

Colourways: `colour` (white/light, default), `navy` and `blue` (one colour), `black` (one-colour print), `white` (Navy, Blue or photos).

Write the name **HS Digital** (capital HS, a space, then "Digital").

## Documents (Spanish + English)

| File | What |
|---|---|
| `guide/hs-digital-brand-guidelines-es.pdf` · `-en.pdf` | Brand guide, 16 portrait A4 pages |
| `guide/index.html` · `index.en.html` | Same guide as a web page (language switch top right) |
| `profile/hs-digital-business-profile-es.pdf` · `-en.pdf` | One-page business profile |
| `profile/hs-digital-business-profile-es.md` · `-en.md` | Profile text and boilerplate for directories and press |

## Stationery (`stationery/`, each as `-es` and `-en`)

| File | What |
|---|---|
| `business-card-{lang}-preview.png` | Front + back preview (sample name) |
| `business-card-{lang}.pdf` | Print PDF, 85 × 55 mm + 3 mm bleed (**team repo only**) |
| `letterhead-{lang}.pdf` | A4 letterhead, body left empty |
| `email-signature-{lang}.html` | Change the name/role, and point the logo `src` to the public PNG URL before pasting into Gmail/Outlook |

Cards with a real person's details go in `private/` (team repo only; people are listed in `hs-digital/private/people.json`).

## Icons and social

- `icons/`: favicon.ico / .svg / 16 / 32, Apple touch icon, Android icons (incl. maskable), `site.webmanifest`, `head-snippet.html` to paste into the site's `<head>`
- `social/`: avatars (navy, blue, light), Open Graph image, LinkedIn, X, Facebook and YouTube covers, each as `-es` and `-en`

## Data

- `brand.json`: colours (with CMYK/Pantone estimates), fonts, voice, services, contacts, Spanish and English copy (single source of truth)
- `master/hs-mark.svg`: master geometry of the mark, shared by the whole family
- Rebuild: `node scripts/build-hs.mjs hs-digital`, then `node scripts/icons-hs.mjs hs-digital`, `node scripts/docs/hs-{social,stationery,profile,guide}.mjs hs-digital`
- Fonts: Bricolage Grotesque and Manrope (SIL OFL, in `assets/fonts/`)

## Licence

Guide text and layouts: CC BY 4.0. The HS Digital name and logos are trademarks of HS Digital Solutions LTD: use them to refer to HS Digital (press, directories, partner pages), not to pretend to be it.
