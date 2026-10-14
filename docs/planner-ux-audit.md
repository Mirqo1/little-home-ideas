# Planner input usability audit — October 14, 2026

The main problem was that a spatial planning task was blocked by product-fit assumptions and stale hidden settings. Adding more explanations alone would not remove those traps.

| Reproduction / friction | Cause | Implemented behavior |
| --- | --- | --- |
| Add screening to an 8-ft side with a default 3-ft module | Three whole panels cover 9 ft, so the whole drawing was rejected | Draw the requested 8-ft screen. Panel estimates are optional, with a nonblocking product-fit note; shortening a panel is never assumed to be permitted |
| Change a 10-ft floor to 4 ft | A default 6-ft screen stayed fixed | Screening defaults to the entire available section and follows floor/structure dimensions. A custom shorter length is an explicit opt-in |
| Remove a railing after selecting screening above it | The stale above-railing choice remained active | Hide and disable the placement choice without railing, reset it to floor level, and normalize the model accordingly |
| Select wall and screen with no railing split | A full wall and privacy screen contradict the coverage model | Disable screening on a full-wall side and explain how to describe a mixed wall/railing side |
| Add a mixed wall and railing to a narrow side | The fixed default wall length could exceed the side | Start the example split at half the side; it follows dimensions until manually edited. Entered lengths are retained |
| Deselect all screens to work on furniture | The tool required at least one screen | Allow a floor/structure/furniture plan without screens |
| Shrink the floor after moving a chair | Previously saved coordinates no longer fit | Preserve the last drawing and offer an explicit reset of positions for the new floor |
| A preset does not fit | Generic failure with no route to recovery | Show the problem by the relevant furniture setting and offer removal of furniture without resetting the whole space |
| A screen is taller than the roof / shorter than the railing | A real geometry conflict, but users had to find its inputs | Keep the conflict, highlight the relevant field, repeat numeric context, and offer a link to that setting |
| Correct a field but keep seeing an old error | Error state only cleared on successful submission | Clear obsolete feedback on editing; say that changes are pending and that the drawing has not yet changed |

## Input hierarchy

1. Floor and optional roof: actual space measurements.
2. Sides: walls, railings, and intended screen coverage. Show custom length only on request, and placement only for a railing. Shared heights appear only when needed.
3. Optional furniture: footprints first, then placement in the drawing.

Product panel width and price are inside an optional details section. They do not determine whether the spatial layout can be drawn. The figure always represents intended coverage; any depicted shorter final panel section is conceptual and not an approved product modification.

Errors should be reserved for missing/invalid measurements and genuine contradictions. Product compatibility is a review note. Unchanged drawings are explicitly identified. No real roof, railing, or manually entered wall measurement is silently changed to make a plan pass.

## Remaining simplification opportunities

- Click a labeled side in the drawing to open its settings.
- Add a small live floor diagram beside the A–D controls.
- Consider individual furniture pieces rather than presets.
- Allow different heights per wall/rail segment only if users need them; avoid exposing this complexity by default.

These are follow-up ideas, not capabilities currently advertised by the tool. Rectangular floor, full-area flat roof, one wall/rail split per side, and illustrative furniture heights remain the model limits.

## Validation

Regression scenarios cover default full-side coverage, resizing the floor, optional panel mismatch, absent-railing placement, no-screen layouts, inline errors, one-click recovery, decimal separators, moved furniture persistence, and pointer/keyboard movement.
