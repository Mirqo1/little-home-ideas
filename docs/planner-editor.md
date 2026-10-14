# Patio layout editor

The current interface has three sections: floor/roof, boundaries/screens, and furniture. Space type changes the contextual building checks, not the geometry. The previous priorities and wind questionnaire is absent; the output is explicitly a geometric layout rather than product or installation approval.

Each A–D boundary can have wall, railing, and screening. Wall-only uses the full side. When wall and railing are selected together, one wall section is placed at the start or end and railing fills the remainder. A/C run left to right; B/D run far to near. Screening begins at the start of the remaining section, either from the floor or above that side's railing. Blank screening length uses that entire remainder. Heights are from the floor. Wall and rail height are shared across their respective sides.

Screen module counts round up independently per side. A rounded count exceeding its available section is rejected rather than assuming panels can be cut or wrapped around a corner. Invalid input preserves the example or last valid drawing, including moved furniture, and shows an alert outside the result container.

Furniture presets supply editable floor footprints. Pieces are dragged individually using inverse isometric projection and pointer capture. Arrow keys move 0.25 ft; Shift moves 1 ft. Movement clamps to the floor and rejects overlaps. Positions survive recalculation when the preset and dimensions remain unchanged, and appear in downloaded worksheets. Reset furniture positions restores the preset. Start over clears the plan.

Limitations: rectangular floor, flat full-area roof, one contiguous wall/railing split per boundary, screening from that open section's beginning, shared heights, illustrative furniture heights, no rotation or arbitrary new pieces. Door swings, walking clearance, wind, mounting, guard compliance, and structural loads are not calculated.

Validation includes mixed sections, separate side counts, overflow rejection, decimal separators, invalid-plan preservation, pointer projection/movement, keyboard movement, reset, position persistence, costs, and conditional inputs. The older planPrivacy API remains compatible but is not used by the editor UI.
