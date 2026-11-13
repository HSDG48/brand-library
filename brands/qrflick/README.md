# QRflick — brand kit

Editable QR codes for cafés, trades, freelancers and small shops. *Imprime una vez. Cámbialo siempre.* / *Print once. Change forever.*
A product of HS Digital ([hsdigital.es](https://hsdigital.es)). Website: [qrflick.com](https://qrflick.com).
Preview of every logo: [preview-logos.png](preview-logos.png)

Built from the original QRflick brand files (logo SVG/PNG and the 8-page guide v1.0), which are kept untouched in `source/` (team repo only).

## Logos

All in `logo/svg/` (vector) and `logo/png/` (transparent, 512 / 1024 / 2048 / 4096 px wide). The wordmark is outlined Archivo ExtraBold, so no font is needed.

| Layout | Use it for |
|---|---|
| `qrflick-horizontal-*` | Default. Mark + wordmark. |
| `qrflick-stacked-*` | Square formats. |
| `qrflick-wordmark-*` | When the mark is already nearby. |
| `qrflick-mark-*` | Avatars, favicons, small sizes (below 24 mm). |
| `qrflick-app-icon` · `-dark` | Rounded tile: white mark on Teal, or Glow mark on Night. |

| Colourway suffix | Background it's made for |
|---|---|
| `colour-light` | White / light (default) |
| `colour-dark` | Night / dark |
| `deep` | Light, small sizes and print (Teal Deep reads better) |
| `ink` | One-colour printing |
| `white` | Teal or photos |

The mark: four corners of a scan frame, one data module and two flick strokes. Write the name **QRflick** (never "QR Flick", "Qrflick" or "QRFlick").
The HS Digital endorsement is set as text ("Un producto de HS Digital" / "A product of HS Digital"). There is no HS Digital logo in this kit.

## Documents (Spanish + English)

| File | What |
|---|---|
| `guide/qrflick-brand-guidelines-es.pdf` · `-en.pdf` | Brand guide, 15 portrait A4 pages |
| `guide/index.html` · `index.en.html` | Same guide as a web page (language switch top right) |
| `profile/qrflick-business-profile-es.pdf` · `-en.pdf` | One-page business profile |
| `profile/qrflick-business-profile-es.md` · `-en.md` | Profile text and boilerplate to copy into directories, press, app stores |

## Stationery (`stationery/`, each as `-es` and `-en`)

| File | What |
|---|---|
| `business-card-{lang}-preview.png` | Front + back preview (sample name) |
| `business-card-{lang}.pdf` | Print PDF, 85 × 55 mm + 3 mm bleed (**team repo only**) |
| `letterhead-{lang}.pdf` | A4 letterhead, body left empty |
| `email-signature-{lang}.html` | Change the name/role, and point the logo `src` to the public PNG URL before pasting into Gmail/Outlook |

No phone number on public pieces. Cards with a real person's details (and phone) go in `private/` (team repo only).

## Icons and social

- `icons/`: favicon.ico / .svg / 16 / 32, Apple touch icon, Android icons (incl. maskable), `site.webmanifest`, `head-snippet.html` to paste into a site's `<head>`
- `social/`: avatars (teal, dark, light), Open Graph image, LinkedIn, X, Facebook and YouTube covers, each as `-es` and `-en`

## Data

- `brand.json`: colours (with CMYK/Pantone estimates), Archivo type scale, voice, contacts, logo rules, English in `i18n.en` (single source of truth)
- `master/qrflick-mark.svg`: master geometry of the mark (100 × 100)
- `source/`: untouched original files (team repo only)

Rebuild everything (from `brand-library/`, needs Node and Microsoft Edge or Chrome):

```
node scripts/build-qrflick.mjs            # logos + app icons + preview
node scripts/icons-qrflick.mjs            # favicons, app icons, avatars
node scripts/docs/qrflick-social.mjs      # social covers
node scripts/docs/qrflick-stationery.mjs  # cards, letterhead, email signature
node scripts/docs/qrflick-guide.mjs       # brand guide (run after stationery and social)
node scripts/docs/qrflick-profile.mjs     # business profile
```

Look at single pages: `node scripts/docs/check-pages.mjs brands/qrflick/guide/index.en.html _check 1,7`.

**Open points:** CMYK and Pantone values are estimates (ask for a printed proof); Snow (#F2F3F3) was added from the guide's dark examples; HS Digital legal name; OK to publish.

**Licence:** guide text and layouts are CC BY 4.0. The QRflick name and logo are trademarks of their owner.
You may use them to refer to QRflick; do not alter them or use them in a way that suggests endorsement.
Archivo is under the SIL Open Font License (`assets/fonts/OFL-Archivo.txt`).
