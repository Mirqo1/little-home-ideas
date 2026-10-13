# Little Home Ideas — publishing workflow

This repository is a dependency-free static website published from `main` on GitHub Pages.

## Permanent site sections
- `index.html`: homepage
- `ideas/index.html`: all published guides
- `small-spaces/index.html`: small spaces and storage
- `garden-patio/index.html`: garden and patio
- `diy-home/index.html`: DIY and home updates
- `tools/index.html`: interactive tools directory
- `tools/patio-privacy-planner/index.html`: patio privacy planner
- `about/`, `contact/`, `editorial-policy/`, `privacy/`, `disclosure/`: information pages
- `assets/site.css`: shared design
- `assets/site.js`: shared utility script
- `assets/logo.webp`: approved optimized logo

## Publishing a new article
1. Research and fact-check the topic; check applicable safety claims and avoid invented firsthand tests.
2. Copy `templates/article.html` into `articles/your-descriptive-slug/index.html`.
3. Replace ALL placeholders: title, description, canonical URL, category, date, body, related links, JSON-LD.
4. Add a linked card to `ideas/index.html` and the relevant category index; consider featuring it on the homepage.
5. Add the canonical article URL to `sitemap.xml`.
6. Test navigation, images, mobile layout, accessibility, spelling and factual claims.
7. Commit to `main`; GitHub Pages deploys the changes.

Do not publish a placeholder article or unverified prices. Use descriptive image filenames and alt text. For every external affiliate link, add appropriate disclosure and `rel="sponsored nofollow"` where applicable.

## Before monetization
- Confirm appropriate commercial hosting and domain HTTPS redirects.
- Publish real operator/contact details and finalize privacy documentation.
- Add analytics only after appropriate privacy and consent assessment.
- Verify the site in Google Search Console and submit `/sitemap.xml`.
- Review affiliate disclosures and local legal requirements.

## Site limitations
This is a small static site without a CMS, automated article feed, backend contact form or scheduled publication. Category indexes and sitemap are currently updated manually with each new article. A content-driven build (for example Astro) is a sensible later upgrade if publishing volume increases.
