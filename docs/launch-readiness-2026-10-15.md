# Launch readiness — October 15, 2026

## Release scope

Enable the real owner-provided Formspree contact endpoint. Replace the old coming-soon contact page, add form-processing privacy information, and remove obsolete initial-version language from information pages. Keep the two reviewed article drafts unpublished. No DNS, hosting, paid service, mail sender identity, or analytics configuration changes.

## Public-page review

All 25 built HTML pages were checked for coming-soon, preparation, placeholder, incomplete, and update-later copy, with scripts/styles excluded. No dead placeholder anchors were found. The only remaining readiness wording is the explicit privacy-information gap below. Future conditional commercial disclosure wording describes a policy, not an unfinished feature.

Build and site audit pass: internal links, local resources, fragments, image dimensions/integrity, canonical URLs, Open Graph metadata, Article schema, and all three sitemap files. Contact is enabled and indexable with the real HTTPS POST endpoint. All 84 existing planner/consent tests pass. The custom contact test verifies enabled controls, the real action, and absence of a private forwarding address.

## Remaining items requiring real owner/account information

- The public legal identity of the operator has not been confirmed for publication. Do not infer or publish a private name/address from Websupport billing or other account information. The privacy page keeps this gap visible and supplies the now-working contact-form route.
- A correspondence retention period and actual deletion routine have not been agreed. Do not invent a retention promise or hide this open item. Formspree's provider-side submission archive limit is not the same as deletion from Gmail.
- Search Console and Bing verification tokens are blank in repository config. Account ownership verification, sitemap submission, and actual indexing are not confirmed. Search engines can still crawl the public site; verification is a measurement/diagnostic follow-up, not proof of indexing.
- GA4 stream-side Enhanced Measurement, Signals, internal-traffic filters, and retention settings have not been inspected. The owner has confirmed Realtime collection; repository consent tests pass.
- Native Formspree submissions use its hosted challenge and response pages. Provider-side domain restrictions, enabled CAPTCHA, and final notification destination must be checked in the owner's account or through a real owner-controlled submission; no dashboard configuration is inferred from the endpoint alone.
- No current Lighthouse/axe or field Core Web Vitals score is claimed. Build checks do not substitute for browser/device performance measurements.
- GitHub Pages suitability must be resolved before the planned advertising/affiliate business launch. The current release adds no monetization and changes no host.

## Delivery verification

The owner has confirmed Websupport-to-Gmail forwarding works, initially arriving in Spam. This does not itself establish that a Formspree submission has arrived. Live form appearance and submission outcomes are recorded after deployment.
