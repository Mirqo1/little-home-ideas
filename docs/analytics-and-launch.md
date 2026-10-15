# Search, analytics, hosting, and launch

## Search Console: prepared, not verified

The shared layout supports `GSC_VERIFICATION` for URL-prefix HTML-tag verification. Obtain the actual token from the owner's Search Console account, set it in the build environment, rebuild, and deploy. Do not insert an example or invented verification value. For Domain property verification, the owner must approve and add the supplied DNS record; no DNS was changed here.

After the chosen verification method succeeds, submit `https://littlehomeideas.com/sitemap-index.xml`. The older `/sitemap.xml` remains automatically generated for compatibility. Inspect the homepage, a category, and an article using URL Inspection. A valid sitemap does not establish that Google has indexed a URL.

Official reference: https://support.google.com/webmasters/answer/9008080

## GA4: consent-based integration enabled October 15, 2026

The owner supplied web-stream ID `G-QHSQ0J8J4R` and authorized installation. `src/data/measurement.json` enables the existing consent controller. The shared layout loads only the local controller until a visitor opts in; the Google tag is not pasted unconditionally. The privacy page now explains actual analytics and local-storage behavior. Operator identification and a dedicated privacy contact are still outstanding and must be supplied by the owner; no personal details have been inferred or invented.

### Remaining account-side checks

1. In this stream, disable Enhanced Measurement to avoid duplicate or extra automatic interaction events. This integration sends page views and explicit article/planner events. Keep Google Signals and advertising features off. These account settings cannot be changed through this repository.
2. Check Realtime in the owner's actual GA4 property after allowing analytics on the website. A browser request or automated test does not prove that the event appeared in the account. Account access has not been provided.
3. Supply operator identification and a dedicated contact address to finish privacy/contact information.
4. Configure internal test traffic only after checking the definition. Do not exclude all Slovak traffic indiscriminately; use a U.S. segment for audience reporting.

### Consent behavior

- Both allow and reject are visible; footer **Analytics choices** reopens the controls.
- Basic consent mode blocks the Google library until opt-in. Advertising storage, advertising user data, and advertising personalization remain denied.
- The visitor's choice is stored locally with a 180-day expiry. Blocked storage is handled without breaking the site; the preference then lasts only for the current page.
- Withdrawing consent disables GA4, removes accessible `_ga` cookies, and reloads the page to unload the previously allowed Google script and timers. Another tab’s changed choice is handled too.
- Custom events are dropped before consent; old planner interactions are not replayed after a later grant.
- Our event payloads exclude planner answers, search text, email addresses, and page URL query strings/fragments. Configure the real stream as described above; this is not a claim that Google processes no technical identifiers after consent.
- This lightweight consent interface is for the current analytics-only setup. Advertising/CMP requirements must be assessed before introducing an ad network; no advertising approval or certified-CMP claim is made here.

Official implementation reference: https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic

## Search engines

Existing `GSC_VERIFICATION` environment support is retained. Prefer the reproducible `googleSiteVerification` field in `src/data/measurement.json` for this repository’s generated-root publishing workflow. The optional `bingSiteVerification` field inserts Bing's `msvalidate.01` meta tag when supplied.

For Search Console, create a URL-prefix property for exactly `https://littlehomeideas.com/`, select HTML-tag verification, and provide only the `content` token from the actual Google tag. Deploy it, then complete verification in the owner's account and submit `https://littlehomeideas.com/sitemap-index.xml`. This path does not change DNS. Verification is independent of visitor analytics consent.

Bing Webmaster Tools is an optional next step after Google setup. No Bing account has been created or verified. Sitemap generation and robots declarations are already active.

## Implemented measurement specification

| Measure | Event / source | Data |
|---|---|---|
| Discovery | Search Console | Impressions, clicks, CTR, query and page; use a U.S. segment |
| Page visit | `page_view` | Title and canonical-style origin/path, once per consented page |
| Article progress | `article_scroll` | 50 or 90 percent; not proof the article was read |
| Open guide | `select_content` | Destination article path |
| Save guide | `save_article` | Published article slug |
| Start tool | `planner_start` | First input/change; tool name only |
| Complete layout | `planner_complete` | Successful submission only; tool name only |
| Save worksheet | `planner_save` | Save action, not confirmation of a finished download |
| Print layout | `planner_print` | Print-dialog action, not proof of physical printing |

Mark `planner_complete` as a key event in the actual property if tool completion is the primary goal. Use the event reports for save/print actions, and compare article landing pages with planner engagement. No purchase or affiliate conversion is fabricated. Counts cover measurable, consenting visits and may differ from all traffic. Evaluate 28-day periods after enough real data, accounting for indexing and seasonality.

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
