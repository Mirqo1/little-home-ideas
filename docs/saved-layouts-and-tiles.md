# Saved patio layouts and Patio Tile Layout Planner

## Scope

Owner authorized progress after the proposed roadmap. This release implements named local patio projects with file portability and two-project visual comparison, plus the requested rectangular patio tile planner. No paid services, accounts, DNS, or hosting changes. Existing unpublished article drafts remain drafts. A sourced companion planning guide is embedded on the tile tool page rather than publishing another article without a separate editorial release.

## Saved patio projects

- Explicit save only; at most eight named copies under `lhi-patio-projects-v1` in browser localStorage. No automatic overwrites: a duplicate name requires a new name.
- Saves the last applied valid model, not half-edited inputs. Includes moved objects, mixed plant types, rotations, locks, deleted pieces, screen gaps, partial walls, roof, doors/windows, and camera angle.
- Download JSON and reopen it locally on another device. A versioned, bounded decoder rejects malformed files; UI restore computes a valid plan before changing the drawing and rolls settings back if invalid.
- Opening a file does not silently add it to browser storage. Blocked/quota-full storage offers file download instead; no server upload.
- Comparison shows two saved copies without changing the current drawing. Download a branded SVG drawing, text worksheet, or print.
- Privacy information now describes explicit local project storage and downloads. No project name, dimensions, positions, or file contents enter analytics.

## Tile tool

URL: `/tools/patio-tile-planner/`. Straight grid and a rectangular measured floor. Inputs are U.S. feet/inches, actual tile dimensions and gaps in inches, tile direction, corner/centered grid, extras, optional box size and user-entered price. Point/comma decimals accepted with at most four decimal places.

The calculation clips individual grid rectangles to the usable floor; count equals the number of drawn positive tile positions. Every cut position gets one new source tile. No reuse/nesting or minimum-purchase claim. Extra pieces, required pieces, boxes, purchased pieces, and surplus from box rounding are separate. Corner grids that end inside a joint explicitly report the unfilled edge strip rather than silently depicting tile there.

Centered mode evaluates central-tile and central-joint alignments independently on each axis and favors wider symmetric edge pieces. The drawing distinguishes cuts with color and hatching. Piece selection supports click and arrow keys. A grouped cut list, layout comparison, text download, branded SVG drawing, and U.S. Letter print report are included. Invalid inputs keep the previous drawing. A 2,500-position cap prevents unbounded rendering.

Example gaps are labeled as geometry examples, not system recommendations. No movement-joint design, obstacles, drainage/waterproofing design, load approval, installation instructions, or click-tile/pedestal-system count is implied. No live market prices are fetched.

## Primary sources reviewed

- https://www.schluter.com/schluter-us/en_US/faq/ditra-ditraxl-movement-joints-tile-installation — DITRA does not eliminate movement joints; linked in the on-page guide.
- https://www.ceramictilefoundation.org/homeowners-guide-to-hiring-qualified-tile-installer — qualified installation planning and system suitability; linked in the guide.

## Verification

Automated coverage includes exact full grids; independent cut-stock allowance; large tiles; joint/perimeter geometry; centered symmetry; rotation; extras/box rounding/cost; invalid and oversized grids; keyboard tile selection; unchanged drawing on invalid input; saved moved furniture/windows/locks/view; mixed plants and deletions; pending edits; duplicate names; comparison; malformed project files; and storage failures. Existing planner/consent tests remain in the suite. Run `npm test`, `npm run build:pages`, and `npm run check:site`.

Live browser appearance and interactions are checked after deployment. Mobile device screenshots, measured performance/accessibility scores, and physical printing are not inferred from unit tests. Existing operator/retention, Formspree account CAPTCHA, Search Console, and pre-monetization hosting follow-ups remain recorded in the launch-readiness document.
