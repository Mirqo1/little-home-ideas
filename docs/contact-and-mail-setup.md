# Contact form and domain email — preparation, October 15, 2026

## Current state — updated October 15, 2026

The owner supplied the real public Formspree endpoint `https://formspree.io/f/mwlvalyq`. The contact form is now enabled in source, with a native HTTPS POST, hosted spam-check workflow, and a hidden honeypot. No private recipient address is embedded in the page or repository. Final deployment and provider acceptance checks are recorded in `docs/launch-readiness-2026-10-15.md`.

Free Websupport domain catch-all forwarding was saved successfully. Existing MX records already point to `mx10.websupport.sk` and `mx20.websupport.sk`; no DNS change or purchase was needed. The owner confirmed receipt in Gmail, initially in Spam. The owner explicitly chose to reply from their personal Gmail instead of purchasing a mailbox or setting up SMTP Send as. No outgoing identity or new mailbox password is needed.

The owner's private forwarding destination remains in account-side settings only. Do not add it to public repository files, form HTML, JavaScript, or public documentation. The public contact destination is `info@littlehomeideas.com`; the website provides a form rather than displaying that address.

The setup alternatives below are background guidance from the initial preparation. They are not instructions to purchase or create an SMTP mailbox; the owner has explicitly rejected paid email services.

## Form architecture

- GitHub Pages continues to host the static site. It cannot execute a server-side email handler; no hosting move is needed for an external submission endpoint.
- `ContactForm.astro` posts natively over HTTPS to a Formspree form ID. No SMTP password, provider secret, recipient address, or client-side email API is embedded in the website.
- Name is optional; reply email and message are required. A topic selector supports guide corrections and tool feedback. No attachments, newsletter subscription, automatic reply, or invented success message.
- Browser field validation improves input quality; it is not server-side spam protection. Formspree must enforce the submission controls. Enable the provider's hosted reCAPTCHA, restrict accepted domains to `littlehomeideas.com`, and verify the destination in its dashboard. Do not assume CAPTCHA is enabled by default.
- Native POST uses the provider's hosted challenge, success, and error pages. No custom success URL or AJAX dependency is assumed. Hosted success means provider acceptance; actual inbox delivery must be verified separately.
- No reCAPTCHA script loads from this website. The visitor is told that a spam check may appear after submitting. A disabled form cannot be used, has no live endpoint, stays noindex, and is excluded from both sitemap paths.
- The active privacy section is rendered only when the form is enabled. It identifies Formspree, Google reCAPTCHA, submitted data, and the purpose. It does not claim the operator identity or a final retention policy has already been settled.

## Account-side activation

1. Create or sign in to an owner-controlled Formspree account. The owner must complete any required account terms and verification. Use the free plan if its current limits are sufficient; do not start a paid plan automatically. At research time the free plan listed 50 submissions/month and a 30-day submission archive. This is a service limit, not an assurance that it will remain unchanged.
2. Create the Little Home Ideas contact form; set notifications to `info@littlehomeideas.com` after that mailbox works, and verify the recipient. Keep the personal forwarding destination out of the public endpoint.
3. Enable reCAPTCHA in the form settings and restrict submission domains. Use hosted protection for this version; do not add a fake local CAPTCHA or a private reCAPTCHA secret to GitHub.
4. Copy the public endpoint, for example `https://formspree.io/f/REAL_ID`. Set only its real ID in `formspreeFormId`. The placeholder above is documentation, not a usable endpoint.
5. Agree the operator/contact information and actual handling/retention of correspondence. Complete the remaining privacy wording before launch; the existing site already identifies its privacy notice as incomplete.
6. Test CAPTCHA enforcement, provider acceptance, delivery to the intended mailbox, forwarding to the owner's Gmail, and replying with the intended identity. Do not send messages to third parties just to test the configuration. Use an owner-controlled second address with permission.
7. Set `enabled: true`, rebuild, run site checks, and deploy via a reviewed PR. The active form becomes indexable and enters both sitemap implementations; the other two article drafts remain untouched.

No submissions are sent by the local tests. The enabled build can be validated with a syntactically valid dummy ID in a temporary local copy, then restored. Never deploy that dummy ID.

## Websupport mailbox and forwarding

First inspect the domain's current services in WebAdmin. A registered domain does not prove that an authenticated mailbox service is included. If an existing hosting/mail entitlement supports the domain, use it. If a purchase is required, present the exact product, initial and renewal price for owner approval; do not order it or change DNS implicitly.

Create a real mailbox called `info`, not only a forward-only alias, if authenticated SMTP sending is required. The owner enters and stores the password securely; never paste it into chat or GitHub. Use WebAdmin's domain email list to create a forwarding rule from this mailbox to the private Gmail address supplied in conversation. Websupport documents that forwarding from an existing mailbox keeps a copy in both the source and destination mailboxes. Monitor the source quota.

Before DNS changes, read the current MX/TXT records and existing mail providers. Enabling mail may require MX and sender-authentication changes; the owner requires explicit approval before DNS changes. Preserve the website's existing Pages A/CNAME records. Do not replace an existing SPF record with a second SPF record, guess DKIM values, or weaken an existing DMARC policy. Obtain the exact records from the selected email service.

Websupport's documented SMTP settings at preparation time:

| Setting | Value |
|---|---|
| SMTP host | `smtp.m1.websupport.sk` |
| Username | Full mailbox address: `info@littlehomeideas.com` |
| Transport | TLS on port 587 (provider's recommended choice), or SSL on 465 |
| Password | The mailbox password entered securely by the owner |

Use the server settings shown for the actual purchased product if they differ. Websupport's guide discusses GeoIP protection when Gmail uses foreign SMTP servers. Do not disable or broaden this protection automatically; if it blocks access, document the exact change and obtain action-time confirmation for any reduction in security controls.

Test forwarding from a different owner-controlled account, not from the same Gmail address used as the destination; Websupport warns that the latter may not be a reliable test. Then test an authenticated outbound message and inspect the receiving copy's sender and authentication results. No delivery or SPF/DKIM/DMARC pass is claimed before a real test.

## Gmail: important January 2027 change

Google's current official Help page says that starting January 2027 it will remove third-party **Send as** identities from personal Gmail on web and mobile. During Q3–Q4 2026 it may already restrict new configurations. Forwarding into Gmail is explicitly unaffected. This makes the requested Websupport-to-personal-Gmail sender setup temporary, and it may already be unavailable for a new identity.

If it is still available and the owner wants the temporary configuration: Gmail on a computer → Settings → See all settings → Accounts and Import → Send mail as → Add another email address. Add `Little Home Ideas` and `info@littlehomeideas.com`; use the real Websupport SMTP settings above, enter the mailbox password through the secure interface, and confirm the verification delivered to the mailbox. Check the reply-to address and choose the intended identity when replying. Keep the personal Gmail default unchanged unless the owner explicitly wants to change it. Do not mark every personal outgoing email as Little Home Ideas by default.

Longer-term alternatives:

- Receive forwarded messages in personal Gmail and send business replies through Websupport's own webmail or a desktop IMAP/SMTP client.
- Add the Websupport mailbox as a separate account in the Gmail mobile app. This is a separate mailbox identity, not personal Gmail's third-party Send as feature; Google says external-account support in the mobile app continues.
- If Gmail in a desktop browser is essential for the business mailbox, assess Google Workspace as a separate paid service. Do not purchase, migrate mail, or change MX without explicit approval. No price is assumed here.

## Primary references checked

- [Google: changes to third-party email account support](https://support.google.com/mail/answer/17101213) — January 2027 removal, possible restrictions before then, mobile external accounts, and unaffected forwarding.
- [Google: send emails from a different address or alias](https://support.google.com/mail/answer/22370?hl=en) — current setup, verification, sender selection, and reply-to behavior.
- [Websupport: forwarding and aliases](https://www.websupport.sk/podpora/kb/aliasy-a-presmerovania-e-mailov/) — mailbox/virtual forward distinction and testing caution.
- [Websupport: mailbox creation](https://www.websupport.sk/podpora/kb/vytvorenie-emailovej-schranky-na-hostingu/) — product-side mailbox setup.
- [Websupport: sending through Gmail](https://www.websupport.sk/podpora/kb/odosielanie-emailov-cez-gmail/) — SMTP settings and GeoIP dependency; does not override Google's newer end-of-support notice.
- [Formspree: plans](https://formspree.io/plans) — free plan and limits.
- [Formspree: reCAPTCHA settings](https://help.formspree.io/articles/form-and-project-settings/recaptcha-settings/) — hosted CAPTCHA and per-form configuration.
- [Formspree privacy policy](https://formspree.io/legal/privacy-policy/) — submission processor information.

## Local validation

Both disabled and temporarily enabled builds passed the full site audit. Verified the native HTTPS action, disabled fields when unconfigured, one H1, absence of mailto links, the active privacy anchor, conditional robots/sitemap behavior, and a failing build when enabled without a form ID. All 84 existing tests pass. Dummy configuration was restored; no form was submitted. Provider-side CAPTCHA and actual email delivery are still untested until account setup.

The owner has verified domain forwarding by receiving a test message. Contact-form provider acceptance, CAPTCHA, and live appearance are separate checks; see the launch-readiness record.
