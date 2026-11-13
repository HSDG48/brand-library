# LeedTech — brand kit

Recruitment company of Grupo Lanak, Barcelona. *Talent Beyond Borders.*
Preview of every logo: [preview-logos.png](preview-logos.png)

## Logos

All in `logo/svg/` (vector masters) and `logo/png/` (transparent, 512 / 1024 / 2048 / 4096 px wide).

| Layout | Use it for |
|---|---|
| `leedtech-primary-*` | Default. Wordmark + spark + tagline. |
| `leedtech-horizontal-*` | Small spaces (no tagline). |
| `leedtech-vertical-*` | Square formats. |
| `leedtech-symbol-*` | Avatars, favicons, app icons. |
| `lockups/leedtech-grupo-lanak-cobrand-*` | **LeedTech \| Grupo Lanak**: the **preferred** signature. Use it wherever possible: cards, web, email, social. |
| `lockups/leedtech-grupo-lanak-endorsement-*` | **LeedTech · Una empresa del Grupo Lanak**: shows group membership. |
| `group/` | Grupo Lanak, Lanak, Akilan, Qualis (colour, black, white). |

| Colourway suffix | Background it's made for |
|---|---|
| `colour-dark` | Black (preferred) |
| `colour-light` | White / light |
| `black` / `white` | One-colour printing, embossing, photos |
| `group` | White, inside Grupo Lanak materials (Azul + Lima) |
| `group-negative` | Azul Grupo background |

Rule: never mix the two systems in one piece (e.g. a yellow spark with a blue wordmark).

## Documents (Spanish + English)

| File | What |
|---|---|
| `guide/leedtech-brand-guidelines-es.pdf` · `-en.pdf` | Brand guide, 16 portrait A4 pages |
| `guide/index.html` · `index.en.html` | Same guide as a web page (language switch top right) |
| `profile/leedtech-business-profile-es.pdf` · `-en.pdf` | One-page business profile |
| `profile/leedtech-business-profile-es.md` · `-en.md` | Profile text and boilerplate to copy into directories, press, tenders |

## Stationery: two versions of everything

Use **co-brand** (LeedTech | Grupo Lanak) wherever possible. **Standard** (LeedTech logo + "Una empresa del Grupo Lanak") is for small spaces or pieces where the Group shouldn't appear. Each file exists as `-es` and `-en`, in `stationery/`.

| File | What |
|---|---|
| `business-card-{cobrand,standard}-{lang}-preview.png` | Front + back preview |
| `business-card-{cobrand,standard}-{lang}.pdf` | Print PDF, 85 × 55 mm + 3 mm bleed (**team repo only**) |
| `letterhead-{cobrand,standard}-{lang}.pdf` | A4 letterhead, body left empty |
| `email-signature-{cobrand,standard}-{lang}.html` | Change the name/role, and point the logo `src` to the public PNG URL before pasting into Gmail/Outlook |

Cards with a real person's details go in `private/` (team repo only), never in `stationery/`.

## Icons and social

- `icons/`: favicon.ico / .svg, Apple touch icon, Android icons (incl. maskable), `site.webmanifest`, `head-snippet.html` to paste into a site's `<head>`
- `social/`: avatars (dark, yellow, light), Open Graph image, LinkedIn, X, Facebook and YouTube covers, each as `-es` and `-en`, and as co-brand `-cobrand-es` / `-cobrand-en` (preferred)

## Data

- `brand.json`: colours, fonts, contacts, logo rules (single source of truth)
- `guide/content.es.md`: full text of the original brand manual
- `source/figma/`: untouched exports from the Figma file (team repo only)

Rebuild everything (from `brand-library/`, needs Node and Microsoft Edge or Chrome):

```
node scripts/build-leedtech.mjs          # logos + lockups
node scripts/icons-leedtech.mjs          # favicons, app icons, avatars
node scripts/docs/leedtech-social.mjs      # social covers, standard + co-brand
node scripts/docs/leedtech-stationery.mjs  # cards, letterheads, email signatures
node scripts/docs/leedtech-guide.mjs       # brand guide, every language in brand.json (run after stationery)
node scripts/docs/leedtech-profile.mjs     # business profile
```

Look at single pages: `node scripts/docs/check-pages.mjs brands/leedtech/guide/index.en.html _check 1,7`.

**Licence:** guide text and layouts are CC BY 4.0. The LeedTech and Grupo Lanak names and logos
are trademarks of their owners. You may use them to refer to LeedTech; do not alter them or use
them in a way that suggests endorsement.
