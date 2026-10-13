# Publishing Little Home Ideas

The authoring source is Astro. The checked-in root HTML is generated output retained for the existing GitHub Pages `main` / root setup. **Never hand-edit generated HTML or indexes.** A future approved Git-based Astro host can build `dist` directly and dispense with the root export.

## Local setup

Use Node 24 and Python 3 for the generated-site audit.

```sh
npm ci
npm run dev
```

## Add one article

1. Create `src/content/articles/your-descriptive-slug.md`. Its filename defines the existing-style URL `/articles/your-descriptive-slug/`.
2. Start with the following frontmatter, then write the article in Markdown:

```yaml
---
title: "A specific, useful title"
description: "A unique description of the problem this guide solves."
category: small-spaces
date: 2026-10-13
image: /assets/your-original-diagram.svg
imageAlt: "Describe the useful information in the illustration."
reviewed: false
draft: true
sources: []
---
```

Allowed categories: `small-spaces`, `garden-patio`, `diy-home`, `renter-friendly`, `practical-solutions`. Add `updated` only after a substantive change. Source objects contain `title` and a valid HTTPS `url`.

3. Research and review according to `docs/editorial-plan.md`. Place the licensed/original image in `public/assets/`. For an SVG illustration provide a same-name PNG for Article and social metadata. Use compatible dimensions, useful alt text, and an image credit. For a photographic cover, adjust the shared caption behavior rather than calling it a schematic.
4. Set `reviewed: true` and `draft: false` only after review. Both flags and a nonfuture publication date are required. Future dates are released at the next build after that date, not automatically at midnight.
5. Run:

```sh
npm test
npm run build
npm run check:site
node scripts/export-pages.mjs
```

6. Review the diff, including automatically updated generated files. Open a working-branch Pull Request. Merge after checks and visual review. Existing GitHub Pages branch publishing handles deployment; no source-setting change is included here.

The homepage, archive, category, related guides, table of contents, canonical, metadata, Article schema, and sitemap update automatically. You do not edit these pages individually.

## Shared design

- `src/layouts/Base.astro`: site-wide head, logo, navigation, footer.
- `src/styles/site.css`: permanent visual system and responsive rules.
- `src/pages/index.astro`: permanent homepage composition.
- `src/components/Card.astro`: article listing presentation.
- `src/data/pages.json`: informational page content; still requires real operator/contact inputs.
- `public/assets/logo.webp`: approved logo. Keep unchanged.

## CI and export

CI builds, tests, audits, exports, and checks for a clean diff. It uploads the `dist` site as an artifact. It neither merges the PR nor changes hosting/DNS. If generated output is stale, run the export and commit it. `.generated-pages.json` tracks owned output; only previously generated files absent from the next build are removed.

Before commercial launch follow `docs/analytics-and-launch.md`. No GA4, ad, or tracking script is enabled by this project.
