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

## Live verification after PR 39

PR 39 merged as `c29585a1f247897282c57dff2603637dc18fea0e`. The production contact page visibly renders the enabled form and no coming-soon notice. Desktop appearance was inspected. A native submission from the live page, explicitly marked as a setup test with reply email `info@littlehomeideas.com`, reached `https://formspree.io/thanks?language=en` and displayed “The form was submitted successfully.” Provider acceptance is verified. The owner subsequently confirmed that the contact-form test arrived in the normal Gmail inbox, not Spam.

No CAPTCHA challenge appeared during this test. Do not claim CAPTCHA is enabled or disabled based only on that outcome. Its account-side setting remains unverified. The hidden `_gotcha` field is present; local required-field validation is not a substitute for provider protection. The owner should verify reCAPTCHA in the form's Spam protection settings and restrict the accepted domain to `littlehomeideas.com`.

## Owner follow-up recorded October 15, 2026

The owner explicitly asked to retain the unfinished launch work for a later session. Keep these open until separately verified:

- [ ] Confirm the public operator identification and publish it in Privacy.
- [ ] Agree the correspondence-retention period and deletion routine; update Privacy to match actual handling.
- [ ] Verify Formspree CAPTCHA and accepted-domain settings in the owner's account.
- [ ] Complete Search Console ownership verification, sitemap submission, and inspect indexing; Bing remains optional.
- [ ] Run measured performance/accessibility checks and address material findings.
- [ ] Inspect the previously listed GA4 account-side settings.
- [ ] Resolve hosting suitability before monetization; no DNS, hosting, or paid changes without explicit owner approval.
- [x] Real contact form deployed and provider acceptance tested.
- [x] Owner confirmed contact test reached the normal Gmail inbox.

### Formspree free-plan overflow

Checked official documentation October 15, 2026. The current monthly allowance is 50 submissions per account. New submissions above the allowance are held in the form's Over Limit folder, without notification delivery, until manually reprocessed when quota is available. Reprocessing consumes the then-current quota. Over-limit messages follow the same retention rules as other submissions; the free plan stores 30 days of history. Formspree documents usage notices at 50%, 75%, 90%, and overflow. Do not interpret visitor success as guaranteed immediate notification delivery. This is unrelated to direct email received through Websupport forwarding.

Sources:
- https://help.formspree.io/articles/form-and-project-settings/over-limit-submissions (updated September 30, 2026)
- https://help.formspree.io/articles/account-management/account-limits

No paid upgrade is authorized. Review usage notices and the Over Limit folder if the allowance is approached.


## Owner-confirmed follow-up — October 22, 2026

This dated update supersedes the corresponding open items above; other historical statements retain their original dates.

- Owner supplied sole-trader name, business address, IČO, district office and trade-register number, then authorized use of all necessary supplied details. The exact public identification was presented before publication. No private billing data or forwarding Gmail address is included.
- The owner initially agreed to a 12-month deadline, then explicitly requested a practical purpose-based replacement on October 22. Current policy: retain enquiry correspondence only for the enquiry and related follow-up; review at least annually and delete/anonymize unneeded messages, including inbox copies. Continuing business relationships, legal duties and claims may justify retaining only relevant material for longer. A resolved enquiry is not sufficient justification for indefinite retention. This remains a manual owner responsibility, not an implemented Gmail deletion automation. Record the reason for any continued retention. Formspree archive expiry does not clear Gmail.
- Screenshots confirm Formspree form enabled, Formshield enabled and CAPTCHA Enabled. Owner subsequently confirmed saving the project restriction to littlehomeideas.com. A new post-change delivery test has not been performed.
- Owner confirmed Search Console Domain-property DNS verification. Screenshot confirms sitemap index successfully processed; discovered-page count was still zero. Homepage inspection shows indexed and HTTPS. Latest patio-winter article was unknown to Google; owner confirmed the subsequent live test passed. The indexing-request acceptance and eventual article indexing have not been independently confirmed.
- GA4 screenshots confirm correct stream/measurement ID, recent collection, Enhanced Measurement off, email redaction on, Google Signals off, and user-provided data collection off. Detailed location/device collection was enabled and left enabled.
- Owner confirmed setting event and user retention to two months and disabling reset on new activity. Owner confirmed disabling Analytics ads personalization in all regions.
- Internal Traffic exclusion filter remains Testing. Initially no internal-traffic rule existed; owner confirmed saving an exact-IP rule with traffic_type internal. Matching test data has not yet been validated, and filter is not Active. Do not claim own visits are excluded. Allow processing time and verify the Test data filter name dimension before activation; consider changing/shared IP limitations.
- Owner confirmed linking Search Console to the Little Home Ideas Analytics stream. Account-side linkage was not independently inspected after saving.
- Local tests/build/site audit passed on October 22 (32 HTML pages). A PageSpeed Insights run was started earlier, but no scores were extracted. Performance and accessibility measurements remain open.
- Hosting suitability before monetization remains open; no hosting/DNS or paid-service change is part of this privacy release.
