# Search, analytics, hosting, and launch

## Search Console: prepared, not verified

The shared layout supports `GSC_VERIFICATION` for URL-prefix HTML-tag verification. Obtain the actual token from the owner's Search Console account, set it in the build environment, rebuild, and deploy. Do not insert an example or invented verification value. For Domain property verification, the owner must approve and add the supplied DNS record; no DNS was changed here.

After the chosen verification method succeeds, submit `https://littlehomeideas.com/sitemap-index.xml`. The older `/sitemap.xml` remains automatically generated for compatibility. Inspect the homepage, a category, and an article using URL Inspection. A valid sitemap does not establish that Google has indexed a URL.

Official reference: https://support.google.com/webmasters/answer/9008080

## GA4: integration design, disabled

No GA4, GTM, advertising, consent-management, or third-party tracking script is inserted. An account/stream and actual measurement ID have not been supplied. Preparation in this PR is a concrete integration and measurement plan, not an activated or implemented tracker.

Before activation:
1. Supply the operator identity, working contact channel, final privacy notice, and the actual GA4 web-stream ID.
2. Select and configure an appropriate consent solution and explicitly approve activation.
3. Implement basic consent mode: do not request the Google tag before analytics consent. Initialize analytics and advertising consent states as denied; allow analytics only after the visitor's applicable choice. Keep ad storage, ad user data, and ad personalization denied for an analytics-only configuration.
4. Provide a persistent, accessible way to change and withdraw consent. Consent mode itself does not store visitor choices.
5. Validate both denied and granted paths in the browser network panel, consent tooling, and GA4 DebugView. Check that refusing consent causes no analytics requests or analytics cookies under the chosen basic implementation.
6. Keep configuration in one shared component. Do not distribute snippets across articles or add an unconfigured container.

Official reference: https://developers.google.com/tag-platform/security/guides/consent

## Measurement specification

| Measure | Source / proposed event | What to include |
|---|---|---|
| Discovery | Search Console | Impressions, clicks, CTR, query and page; U.S. segment |
| Article consumption | GA4 page_view / configured scroll | Page path, article category; no personal or form data |
| Tool interest | `planner_start` | Tool name only; first deliberate interaction |
| Tool completion | `planner_complete` | Tool name and success; no submitted answers |
| Next useful step | `related_article_click` | Source and destination article paths |
| Affiliate interest, later | `affiliate_click` | Approved partner and destination host; disclosed links |

Do not interpret scroll as reading or affiliate clicks as sales. Measure actual commission reports separately if a program is activated. Evaluate articles after enough time for indexing and meaningful data; compare 28-day periods and note seasonal differences. Use Search Console without adding a website tracking script while GA4 remains disabled.

## Hosting assessment

GitHub Pages is a convenient current static publication path, but GitHub says it is not intended or allowed as free hosting for an online business or sites primarily facilitating commercial transactions or SaaS. That wording does not establish that every informational page containing an affiliate link is prohibited. For the planned commercial magazine, do not assume eligibility; clarify the policy or move to hosting designed for that use before monetization. Pages also has size and soft bandwidth limits. This PR changes no DNS, domain, host, subscription, or Pages source setting.

Official limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

Recommendation for this static Astro project: evaluate Cloudflare Pages with Git integration. Its current Free limits include 500 builds per month, 20,000 files per site, and a 25 MiB per-asset limit. This project's current static output is well within those file/asset limits. HTTPS and Git-based builds remove the need for a continuously running Node server; no account has been registered or connected here. Recheck terms and limits when the owner approves the move.

- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/

Proposed build: Node 24, `npm ci && npm run build`, output `dist`, production branch `main`. Test the provider's preview URL, then obtain explicit owner approval before any custom-domain/DNS cutover. Retain current GitHub Pages until a successful cutover is verified. Do not enable optional paid functions, add-ons, analytics, or advertising by default.

## Current release boundaries

- New source and generated root files are proposed in a PR. They are not on live `main` until merged.
- Existing main/root GitHub Pages publishing remains usable through `npm run build:pages`; no hosting-mode switch is needed for the exported root files.
- Article/category URLs and `/sitemap.xml` are preserved; new categories add URLs. No redirect is needed for existing published pages.
- The contact page still lacks a supplied working contact channel and is deliberately `noindex`. Operator identity and final privacy details remain owner inputs.
- Mobile and desktop CSS are implemented, but local browser screenshots, Lighthouse, axe, and measured Core Web Vitals remain unverified in this environment. Build and static-document checks are not substitutes for them.

## Before merging and commercial launch

Visually inspect homepage, category, article, information pages, planner, and 404 at approximately 375 px, 768 px, and 1440 px. Check keyboard focus, mobile wrapping, meaningful alt text, form announcements, and no horizontal overflow. Run Lighthouse/axe and inspect actual network loading. Test planner validation, exposed/balcony restrictions, and no-JavaScript fallback. After merging, verify HTTPS and live pages, submit sitemap after ownership verification, and repeat URL Inspection. Do not claim a speed/accessibility score until measured.
