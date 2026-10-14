# Outdoor layout planner: separate screens and additional furnishing

The same existing URL now presents the Patio & Balcony Layout Planner, with arrangement emphasized on its page, the homepage teaser, tools page and footer. No URL or hosting change.

## Screen pieces and gaps
Each screened side can optionally use separate pieces, with its own piece width in feet and gap unit (inches or centimeters). One gap repeats; a semicolon-separated list applies gaps in sequence and repeats the final gap for subsequent pieces. Decimal points and decimal commas work inside each value. Negative, malformed, or oversized entries are rejected at the relevant field while the last valid drawing stays available.

The selected side length is a span including gaps. Material pieces are laid along this span, clipping the final piece or final gap at the span boundary. Counts are still separate per side. Whole-unit purchase width is count × piece width; unused material width is purchased width minus material actually drawn, rather than minus the span that includes open gaps. No offcut reuse assumption. This remains an illustrative drawing and count: cutting and installation feasibility are not assessed. Optional cost entries apply the user's same per-piece price.

Regular and uneven gaps are actual empty spaces between SVG polygons; top outlines do not bridge gaps. Continuous screening remains the default. Gaps work without opening the optional cost section.

## Furniture and openings
Four extra fixed example footprints: compact bench 4 × 1.5 ft, lounge chair 2 × 5 ft, side table 1.5 × 1.5 ft, storage chest 3 × 1.5 ft. Each has a distinct vector shape, stable ID, drag and keyboard movement, collision validation, and 90-degree rotation. Existing bistro and plant options remain. These are illustrations, not product standards or clearance approval.

Door/window fill opacity is 0.055, with faint outlines and frame bars, so front-wall markers do not obscure furniture. Selection keeps a stronger interactive outline. Wall length and position fields use shrinking grid columns, equal control heights and aligned label heights; very narrow screens stack them.

Validation: automated tests cover centimeter conversion, decimal commas, uneven gaps, material accounting, invalid inputs retaining the drawing, extra piece movement/rotation and opening opacity. Static build, site audit and live review follow before delivery.
