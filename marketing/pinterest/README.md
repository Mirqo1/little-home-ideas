# Pinterest launch — Little Home Ideas

## Ready to use

18 portrait image-only JPEG Pins, **1000 × 1500 pixels (2:3)**, two distinct scenes per existing article. Each scene was created directly as a full portrait composition, not cropped from a landscape source. There are no borders, wordmarks, text overlays, or artificial empty panels. Pin titles, descriptions, destination URLs, boards, and alt text are separate fields in `pin-copy.csv` and `pin-copy.json`. This CSV is a manual copy sheet, not a claimed Pinterest bulk-import format. No Pins or account have been published or created by this preparation.

All images were produced with the built-in image_gen tool. The complete prompt set, including a targeted drain-connection correction for one scene, is in `portrait-prompts.json`. `portrait-assets.json` records dimensions, file sizes, and hashes. These scenes are editorial imagery, not evidence of independently tested projects.

Reproduce exports with `python marketing/pinterest/render-pins.py SOURCE_DIRECTORY OUTPUT_DIRECTORY` (Pillow required). SOURCE_DIRECTORY can contain the original portrait PNGs or the JPEGs from the saved launch ZIP. The exporter rejects landscape input and resizes the entire portrait without cropping or padding. The contact sheet is for review, not publication.

## Profile copy (American English)

Display name: **Little Home Ideas**

Username suggestion: **littlehomeideas** — availability has not been checked; use a close branded alternative if needed.

Bio: **Practical ideas for small spaces, renter-friendly homes, and little gardens. Explore helpful guides and our free patio & balcony layout planner.**

Website: https://littlehomeideas.com/

Use the existing brand wordmark/logo for the profile. Do not enter the United States as the operator's location just because the target audience is American; supply actual account details.

## Boards

- **Small Spaces & Storage** — Practical storage and organization ideas for small kitchens, entryways, and everyday spaces.
- **Garden & Patio Ideas** — Compact patios, container gardens, outdoor layouts, and privacy ideas with practical planning checks.
- **DIY & Home Updates** — Small, reversible updates using lighting, textiles, and movable home details.
- **Renter-Friendly Home Ideas** — Rental-conscious decorating ideas with lease, surface, and product checks.
- **Practical Home Solutions** — Useful checks and planning ideas for everyday home problems, from sink storage to window moisture.

Start with one Pin per day in the suggested order. Publish variant two after the first nine days rather than posting both versions of the same article together. This is an initial experiment, not a promised optimal frequency. Review saves, outbound clicks, and visits before changing the pace. Pin descriptions do not promise personal testing, guaranteed damage-free installation, or structural safety.

## What the owner needs to do (Slovak)

1. Vytvor bezplatný firemný Pinterest účet pre Little Home Ideas; prihlasovacie údaje a súhlas s podmienkami vybav vo svojom účte. Reklamnú kampaň ani platený nástroj nepotrebujeme.
2. Nastav názov, anglický profilový text, web a logo. Použi vlastné skutočné údaje pri registrácii.
3. Otvor malú šípku pri profilovej ikonke úplne vpravo hore a vyber **Settings**. Na dodanom screenshote bolo rozbalené hlavné firemné menu vľavo, nie nastavenia účtu. V skutočných nastaveniach pokračuj vľavo cez **Link to Pinterest → Websites → Claim → Add HTML tag**. Rozhranie môže byť lokalizované.
4. Pošli overovaciu značku `<meta name="p:domain_verify" content="...">`. Nie je to heslo. Web má pripravené centrálne pole `pinterestSiteVerification` v `src/data/measurement.json`; po vložení skutočnej hodnoty sa značka objaví v hlavičke. Značka dodaná vlastníkom bola vložená 15. októbra 2026; overenie v účte Pinterest zatiaľ nie je potvrdené. DNS sa nemení.
5. V okne s HTML značkou klikni **Pokračovať / Continue**. V nasledujúcom kroku zadaj `https://littlehomeideas.com` a klikni **Overiť / Verify**. Ak si okno zatvoril, otvor **Nastavenia → Odkaz na Pinterest → Webové lokality → Nárokovať → Pridať značku HTML → Pokračovať**. Značku znova nevkladaj, už je nasadená. Ak je doména už medzi nárokovanými webmi, ďalšie overenie netreba. Potom vytvor nástenky a publikuj piny s údajmi z tabuľky. Súbor contact-sheet.jpg nepublikuj.
6. Na pripravených obrázkoch a v textoch pinov nie sú ručne pridané AI popisky. Pinterest môže nezávisle pridať vlastné označenie pôvodu; tento balík neodstraňuje ani neobchádza označenia platformy. Ilustračné scény neprezentuj ako fotky otestovaných realizácií.

## Website and measurement

The article pages contain Article schema and Open Graph article metadata. This supplies article data used by rich Pins; it is not proof that Pinterest has crawled or accepted the site. No Pinterest tag, pixel, advertising script, or third-party widget was installed. The owner-supplied verification tag is deployed; the owner still needs to click Verify in Pinterest. GA4 remains subject to each visitor's consent. Pin links are plain canonical article URLs; Pinterest's own outbound-click analytics and GA4 referral reports can be reviewed after traffic exists. No Pinterest account analytics, audience, or performance is invented.

## Official references, checked October 15, 2026

- Business account: https://help.pinterest.com/en/business/article/get-a-business-account
- Website verification: https://help.pinterest.com/en/business/article/claim-your-website
- Image specs (standard creative): https://help.pinterest.com/en/business/article/pinterest-product-specs
- Article rich Pins: https://help.pinterest.com/en/business/article/rich-pins
- AI labels: https://help.pinterest.com/en/article/ai-at-pinterest
