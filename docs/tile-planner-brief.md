# Balcony & Patio Tile Layout Planner — proposed next tool

Prepared October 15, 2026. Implementation now accompanies this specification; see `docs/saved-layouts-and-tiles.md` for shipped scope, tests, and limitations. The on-page planning guide supplies the companion explanation; no additional article draft was published.

## Reader value

Show where full tiles and edge cuts fall, compare a centered layout with a corner start, and estimate pieces and boxes before shopping. The visual result is the main feature. A bare area division would hide the effect of separate rows, narrow strips, and rotation.

Working U.S. title: **Patio Tile Layout Planner**. Candidate URL: `/tools/patio-tile-planner/` (implemented in this release). This is the user's earlier balcony/terrace tile idea; the bathroom planner remains a separate later project.

## First version

Three compact, visually distinct input groups beside a large top-down preview:

1. **Your floor:** rectangular width and depth in feet and inches; a button swaps width/depth. Clearly label this as measured floor space.
2. **Your tile:** actual tile width and length in inches, joint width in inches, optional perimeter gap in inches. Start with clearly labeled example dimensions, not asserted installation recommendations. Zero joint or perimeter gap is a geometry option, not approval to install that way. Do not mix click-together deck tiles with cuttable ceramic/paver assumptions in the first version.
3. **Your layout:** corner start or centered grid, tile rotation 0°/90°, extra pieces as a user-selected percentage, optional pieces per box and box price in USD. Simple controls, instant updates, no account needed.

Keep the initial release to a rectangular floor and straight grid. Defer diagonal patterns, irregular outlines, obstacles, pedestal systems, drains, and manual offcut nesting. Do not silently pretend a rectangular estimate accounts for those features.

## Visual behavior

- Full-width preview on mobile; larger preview column on desktop.
- Draw measured outer floor and inset tiled area, actual tiles, joints, and perimeter gaps. Distinguish complete tiles from cut pieces using both color and a pattern/legend. Keep dimensions legible.
- Offer corner/centered and rotated views as comparisons of the same inputs, with resulting counts. Centered mode should center the grid symmetrically, avoiding tiny slivers when an alternate central tile/joint alignment gives wider edge pieces; state the chosen alignment.
- Clicking a cut piece reveals required cut width/length and its source tile allowance. Display tiny cuts as a prompt to compare layouts, not a universal pass/fail rule.
- A dimensionally impossible input keeps the last valid drawing with a nearby plain-language message naming the field. No repeated alerts, scroll jumps, or reset of other answers.
- Save the plan as a local file and print a clean U.S. Letter plan with logo, URL, dimensions, assumptions, totals, and date. Keep input controls out of print.
- Make all controls usable with a keyboard. Do not require dragging. Fit the whole plan without large unused margins; permit a zoomed view separately.

## Calculation contract

Use one internal unit and exact or stable bounded arithmetic. Convert feet/inches at the boundary; normalize decimal point and decimal comma as numeric input, while displaying U.S. units. Reject negatives, non-finite values, excessive precision, and dimensions beyond an explicit documented rendering limit. Never interpret an empty field as an unnoticed zero.

Let floor width/depth be W,D, perimeter gap p, tile dimensions a,b, and joint g. Usable span is W−2p,D−2p and must be positive. Place a grid with pitch a+g,b+g. Clip each tile rectangle to the usable rectangle; count only positive intersections. Joints are gaps between tiles, not an extra joint after the final tile. Do not estimate a count solely with ceil(floor area/tile area).

Report separately:

- Covered tile area and floor area (joints/perimeter prevent them being identical).
- Full tiles and cut tile positions.
- Base stock allowance: one new source tile for every positive tile position, including each cut position. **No offcut reuse assumed.** This is conservative and is not a claim of the mathematical minimum purchase quantity.
- Extra pieces = ceil(base allowance × selected percent / 100).
- Required pieces = base allowance + extra pieces.
- Boxes = ceil(required pieces / pieces per box), when provided.
- Purchased pieces = boxes × pieces per box; box-rounding surplus shown separately from requested extras.
- Estimated box cost only when the user enters a box price. No invented market prices, taxes, shipping, adhesive, grout, or labor.

Group cut sizes for a useful cutting list, but do not imply that identical or complementary cuts share a source tile. Material grain, permitted rotation, cutting kerf, breakage, and minimum reusable sizes make real offcut optimization a separate feature. A future reuse mode must produce an explicit valid cut assignment rather than subtracting areas.

## Acceptance examples to implement as tests

All examples below use zero joints and zero perimeter gap strictly to isolate arithmetic.

| Floor and tile | Expected corner layout | Reason |
|---|---|---|
| 10 ft × 8 ft; 12 in × 12 in | 80 full; 0 cut; base 80 | Exact grid |
| 3 ft × 7 ft; 14.4 in × 14.4 in | 10 full; 8 cut positions; base 18 | 3 columns × 6 rows, not area-only ceil(21/1.44)=15 |
| 25 in × 25 in; 12 in × 12 in | 4 full; 5 cut positions; base 9 | Narrow cuts still require positions under the no-reuse policy |
| Base 18; extra 10%; 8 per box | 2 extra; 20 required; 3 boxes; 24 purchased; 4 surplus | Separate extra allowance and box rounding |
| Tile larger than usable floor | 1 cut position; base 1 | A clipped positive tile is not zero tiles |

Also test exact fits with nonzero joints (e.g. 24.125 in span = 12 + 0.125 + 12), values just above/below a grid boundary, asymmetric rectangular tiles in both rotations, centered symmetry, zero extras, box-price omission, invalid perimeter gaps, decimal comma, responsive preview, keyboard focus, and print layout. Validate that drawn pieces and calculated counts always agree. Store at most an explicitly bounded number of renderable pieces; request larger tile sizes or dimensions within limits rather than freezing the page.

## Installation boundaries and publication gate

The planner estimates layout and shopping quantities. It does not select an outdoor-rated system, approve a balcony's load, diagnose the substrate, design waterproofing/slope/drainage, or determine movement joints. Tile, adhesive, grout, and gap requirements must come from the exact system and applicable professional guidance. No universal gap default should be presented as an installation recommendation.

Before public release: research primary system instructions; implement and test the contract; check phone/desktop and print; write a companion article with its own source review; integrate a tool card and relevant links. Reuse the existing local consent-aware analytics integration for start/complete/save/print events only, without sending dimensions or project answers. No new trackers or external services.
