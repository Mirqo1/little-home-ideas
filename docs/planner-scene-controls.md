# Scene controls and quantities

- Rotation picker contains only unlocked rotatable furniture. Plants, bistro table, doors and windows are selected directly in the scene or through the separate Objects & locks list.
- Each movable object can be locked. Locked SVG faces use pointer-events:none and tabindex=-1 so they cannot intercept a drag over an overlapping object. Model movement and rotation also reject locked objects. Locks survive recalculation. Locked objects must be unlocked before deletion.
- Trash control beside rotation removes the currently selected object. Extra furniture and plant quantities decrease; stable allocated IDs preserve the other objects' positions. Removing an opening unchecks its input. Individual bistro removals are retained until the bistro option is toggled. Reset positions does not resurrect deleted objects.
- Plant and extra-furniture fields accept whole-number quantities 0–6 per type. Multiple instances have independent stable IDs and numbered labels. Up to twelve plants and twenty-four extra pieces are supported subject to geometric fit. No automatic storage or external transmission.
- US-only visible gap inputs use inches; piece and floor dimensions use feet. Unit selector and centimeter copy removed.
- Successful Show my layout scrolls to the result heading, respecting reduced-motion preferences. Invalid submissions scroll to their feedback while retaining the previous drawing.
- Diagram viewBox is now 960 × 640 instead of 960 × 740, with geometry fitted to real structure bounds plus a stable movable envelope. Duplicate SVG heading/footer copy is moved outside the scene. Wider desktop results column and larger projection reduce empty margins. Pointer projection derives scale from viewBox dimensions to remain correct.
- Door/window fills are transparent; passive outlines and frame bars are faint. Selecting one strengthens its outline for editing.
- Object management and rotation/delete controls are excluded from print.

Validation covers quantities, middle-instance deletion followed by recalculation, bistro/opening deletion, retained locks, keyboard movement rejection, click-through attributes, rotation filtering, US-only fields and result scrolling. Live checks follow deployment.
