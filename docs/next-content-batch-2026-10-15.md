# Next editorial batch — October 15, 2026

Status: three complete American-English drafts, not scheduled or published. They are stored in the normal Astro article collection with `draft: true` so the publication filter excludes them from pages, cards, related links, and sitemap. `date` currently records draft preparation; set it to the actual publication date when each article is released. Do not backdate or set an invented future release date.

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

Next tool: see `tile-planner-brief.md`. The tile planner is specified but not implemented. Bathroom planning remains a separate backlog idea.
