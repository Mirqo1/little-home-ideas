# Next editorial batch — October 15, 2026

Current status (October 18, 2026): the outdoor cushion storage guide was released October 15, and the closet measurement guide is released October 18 at the owner's request. The furniture-delivery guide remains a reviewed, unscheduled draft, excluded from public routes and sitemaps. Use actual publication dates; do not backdate.

## Prehľad po slovensky

| Koncept | O čom bude | Hodnota pre čitateľa |
|---|---|---|
| How to Measure a Closet Before Buying Organizers | Ako zmerať skriňu, police a otvor dverí pred nákupom boxov či organizérov. | Meracia tabuľka, príklad s dvoma boxmi, rozdiel medzi uložením a pohodlným vyberaním. |
| Will Furniture Fit Through the Door? Measure the Whole Route | Ako preveriť celú trasu doručenia nábytku vrátane zákrut, schodov a výťahu. | Záznam trasy a konkrétna správa predajcovi; žiadne falošné záruky podľa jedného rozmeru. |
| How to Store Outdoor Cushions When You Have Little Space | Kam odložiť vonkajšie sedáky a vankúše mimo používania alebo na sezónu. | Meranie reálneho stohu, porovnanie police/vaku/boxu a kontrola pokynov k údržbe. |

## Source review

Primary sources were opened during preparation on October 15, 2026. Sources in article frontmatter name the specific guidance supported, rather than presenting a generic home page as an article.

- Valet Custom's eight-page measurement PDF: several width measurements, doors, depth, return walls, obstructions. Its tape-measure technique is not reproduced; no supposedly standard closet dimensions are asserted.
- IKEA U.S. PAX planning page: verifies the existence of product-specific assembly/door allowances. No PAX number is generalized into an industry rule.
- CPSC furniture anchoring PDF: applies only to the cabinet/tip-over paragraph, not to loose fabric bins.
- Room & Board delivery page and fit PDF: doors, turns, stairs, landings, elevators, and the need to check the exact route. These are related documents from one retailer, not independent corroborating studies. Our example does not claim a delivery has been tested.
- Sunbrella upholstery instructions: air drying and consulting the furniture manufacturer before removing casings. No chemical cleaning formula is copied into a general cushion guide.
- Weatherend care brochure: complete air drying before seasonal storage for its specified cushions/covers. Its other product-specific instructions are not generalized to other brands or fillings.

The sample dimensions, tables, shopping questions, and workflow are original editorial examples. Verified arithmetic: 28−2×12=4 in; 31−30=1 in; 20×20×16=6,400 cubic inches; 6,400/1,728≈3.7 cubic feet. No first-person testing, purchase price, search-volume estimate, affiliate recommendation, or claim of guaranteed fit.

## Images and links

Six unique scenes: one cover and one inline image for each draft. Covers have a 600-pixel responsive derivative; complete compositions are resized, not cropped. Internal provenance and the complete ImageGen prompts are in `next-article-image-prompts.json`; output metadata is in `next-article-image-manifest.json`. No third-party stock photographs or paid image license is used. These are illustrative scenes, not evidence of a real installation or delivery test. Visible AI captions are not added.

Each draft links to at least two existing relevant articles. The delivery and cushion drafts describe the current planner accurately: illustrative furniture, no delivery simulation, no lid clearance or storage capacity test. Draft articles do not link to each other's unpublished URLs.

## Release sequence

Recommended editorial order: cushion storage while seasonally relevant to some U.S. regions, closet measuring, then delivery route. This is a proposed order, not an automatic schedule. Retain actual publication dates. When releasing a draft, update its publication date, check current sources and source notes, ensure image/alt coverage, set `reviewed: true` and `draft: false`, and run the standard build/site checks. Add inbound contextual links from existing guides as part of that release; do not place dead draft links on public pages now.

Next tool: see `tile-planner-brief.md`. The tile planner is implemented at `/tools/patio-tile-planner/`; see `saved-layouts-and-tiles.md`. Bathroom planning remains a separate backlog idea.

## Validation completed

- Temporarily rendered all three drafts through the existing Article template: 27-page build and full site audit passed, including links, image integrity/dimensions, metadata, schema, and sitemap. Confirmed each draft has both figures and a table. Restored all `draft: true` flags afterward.
- Final public build: 24 pages; all three draft URLs absent from output and sitemap. Generated root export refreshed for CI parity.
- All nine optimized WebP files fully decoded; six unique source scenes, three responsive cover derivatives; total 913,478 bytes. An empty export caught by the integrity audit was replaced before the successful rerun.
- Existing 84 automated tests pass. No new browser/mobile layout or Core Web Vitals measurements were performed for this content-only draft batch.

## First release — October 15, 2026

Published `store-outdoor-cushions-small-home` with the actual publication date October 15, 2026. Added a contextual inbound link from the existing patio layout guide. Replaced the homepage’s fixed three-article selection with the three newest published articles. Collection queries include the new article on the homepage, archive, category page, related cards, and sitemap. The other two drafts remain unpublished and unscheduled. The earlier validation section records the pre-release draft state.

## Closet measurement release — October 18, 2026

Published one article: `measure-closet-before-buying-organizers`, with actual publication date October 18. Reopened the Valet Custom measurement PDF, IKEA U.S. PAX planning page, and CPSC anchoring PDF; the cited guidance remains available. Inspected the two original optimized scenes. Added a contextual incoming link from the entryway guide. The delivery-route draft remains unpublished.

Release checks: production build and full site audit; verify the newly published route, October 18 Article metadata, home/category listings, image files, sitemap inclusion, and continued absence of the delivery draft. No DNS, hosting, analytics, paid services, or unrelated article releases.
