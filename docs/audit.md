# Audit and change record — October 13, 2026

## Original repository

Read the complete original text source, scripts, styles, page metadata, sitemap, robots file, and publishing instructions; inventoried all assets. Confirmed the live homepage through the browser. The approved `assets/logo.webp` is preserved byte-for-byte. No original article was dropped.

| Finding | Change |
|---|---|
| Separate page headers, footers, and inline styles drifted | Shared Astro layout and shared CSS |
| Article linked to `/#planner`, which did not exist | Link to `/tools/patio-privacy-planner/` |
| Banner duplicated the logo instead of using a scene | Original AI-generated home/patio hero, disclosed as illustrative |
| Heavy serif headings and crowded footer | Lighter sans-serif hierarchy, restrained italic accents, two footer rows |
| Each article required manual archive/category/sitemap edits | Typed central Markdown collection; generated routes and listings |
| Planner width did not affect suggestions | Explicit module-count estimate with assumptions and validation |
| Planner did not distinguish exposed sites adequately | Conservative wind default; pause selection for exposed or unapproved balconies |
| Incomplete site-wide social metadata | Canonical, Open Graph, social image, Twitter card, shared schema |
| Original article had isolated layout and incomplete publisher image metadata | Shared article template, full Article schema, original diagram and PNG social image |
| No automated publication checks | CI build, planner tests, local-link/schema/sitemap checker |
| Contact and operator information missing | Preserve honest status; no invented address; contact noindex |

## Image provenance

- Approved logo: unchanged from original repo; no claim of newly acquired rights.
- `public/assets/home-patio-hero.webp` and `home-patio-hero-800.webp`: original generated scene, built-in imagegen; AI-image disclosure is in the editorial policy rather than overlaid on the banner. Final prompt: wide editorial scene of a modest cream/oak living room opening onto a compact planted ground-level patio; natural light, warm cream/sage palette, no people, text, logos, or unsafe mounted objects. Original generation is an illustration, not a photographed project or independently tested arrangement.
- `drawer-zones`, `under-sink`, `entryway`, `patio-layout`, `container-planting`, `removable-hook`, `reversible-room`, `window-moisture`: original code-authored SVG planning illustrations. PNG renderings are provided for social images. Not copied from references; schematic, not to scale.

## Verification and limits

Run `npm test`, `npm run build`, `npm run check:site`, then `node scripts/export-pages.mjs`. The checker verifies all built HTML, local resources, fragment targets, h1/main landmarks, image alt/dimensions, canonicals, social metadata, Article fields, and sitemap targets. Tests exercise calculation rounding, invalid inputs, and balcony/exposure restrictions.

No browser-based mobile/desktop visual verification, Lighthouse score, axe score, or field Core Web Vitals result is claimed. Managed preview/browser tooling is unavailable. External-source references were researched; the automated HTML checker checks local links, not the availability of every external site. Search Console ownership/indexing and GA4 activation require real owner configuration. No analytics, advertisements, commercial account registration, DNS cutover, or paid action occurred.

## Visual refinement after owner feedback

Removed fixed image-height cropping, card hover zoom, and the rounded planner mask. Images retain their full intrinsic proportions. Below 1100 px the homepage text panel follows the full-width hero image rather than covering a cropped background. Redrew the eight original SVGs with varied palettes, viewpoints, and compositions, and regenerated their PNG social images. A dark forest category band separates the light article and planner sections. Removed the banner overlay credit and placed an explicit image-provenance explanation in the editorial policy.

## Finished worksheet and homepage refinement

Strengthened navigation type, changed the hero button icon to a right arrow, replaced the category list with light illustrated cards, clarified the reader-facing editorial promise, and rebuilt the footer. The Patio Privacy Planner now includes measured outdoor dimensions, screening targets, a consistently scaled SVG boundary sketch, module fit warnings, distinct priority/budget approaches, optional arithmetic from visitor-entered prices, and a local text download and print view. No accounts, live prices, tracking, or answer transmission were added.
