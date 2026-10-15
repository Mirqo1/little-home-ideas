# Pinterest launch — Little Home Ideas

## Ready to use

18 portrait JPEG Pins, 1000 × 1500 (2:3), two per existing article. Each uses a different original AI-generated article image, kept complete rather than cropped. Headlines, short copy, destination URLs, boards, and alt text are in `pin-copy.csv` and `pin-copy.json`. This CSV is a copy sheet, not a claimed Pinterest bulk-import format. `suggested_day` is a relative editorial plan, not a scheduled post. No Pins or account have been published or created by this preparation.

Reproduce the artwork with `python marketing/pinterest/render-pins.py OUTPUT_DIRECTORY` (Pillow and Inkscape required). These are precise vector typography layouts around existing images, not newly generated photos. The user-facing launch bundle contains ready-to-upload JPEGs. The contact sheet is for review, not publication.

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
3. V nastaveniach nájdi **Link to Pinterest → Websites → Claim** a vyber **Add HTML tag**. Rozhranie môže byť lokalizované.
4. Pošli overovaciu značku `<meta name="p:domain_verify" content="...">`. Nie je to heslo. Web má pripravené centrálne pole `pinterestSiteVerification` v `src/data/measurement.json`; po vložení skutočnej hodnoty sa značka objaví v hlavičke. Teraz je pole prázdne a overenie nie je dokončené. DNS sa nemení.
5. Po nasadení značky dokonči **Verify** v Pintereste. Potom vytvor nástenky a publikuj pripravené piny s príslušnými odkazmi z tabuľky. Súbor contact-sheet.jpg nepublikuj.
6. Pri AI obrázkoch používaj dostupné označenie pôvodu. Pinterest môže pridať vlastné označenie AI; neodstraňuj ho ani sa ho nesnaž obísť. Ide o ilustrácie, nie fotky otestovaných realizácií.

## Website and measurement

The article pages contain Article schema and Open Graph article metadata. This supplies article data used by rich Pins; it is not proof that Pinterest has crawled or accepted the site. No Pinterest tag, pixel, advertising script, or third-party widget was installed. Verification requires the owner's real token. GA4 remains subject to each visitor's consent. Pin links are plain canonical article URLs; Pinterest's own outbound-click analytics and GA4 referral reports can be reviewed after traffic exists. No Pinterest account analytics, audience, or performance is invented.

## Official references, checked October 15, 2026

- Business account: https://help.pinterest.com/en/business/article/get-a-business-account
- Website verification: https://help.pinterest.com/en/business/article/claim-your-website
- Image specs (standard creative): https://help.pinterest.com/en/business/article/pinterest-product-specs
- Article rich Pins: https://help.pinterest.com/en/business/article/rich-pins
- AI labels: https://help.pinterest.com/en/article/ai-at-pinterest
