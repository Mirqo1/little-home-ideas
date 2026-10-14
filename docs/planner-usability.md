# Planner usability update

- Printed worksheets hide piece selection, rotation, movement status, reset buttons, view toggles and form feedback.
- Pointer movement previews allow footprints to cross other pieces. Collision checks run on release; an occupied destination restores the starting arrangement. Keyboard moves and rotation still validate each action.
- Each potted plant has an independent thuja/leafy illustration selector. Shared footprint/height fields describe all plants; these are planning illustrations, not plant suitability recommendations.
- Wall plus screen now exposes wall length/position even with no railing. The wall and screen occupy complementary sections of the side. A railing remains optional.
- The diagram uses a wider projection area and a larger desktop results column. Projection bounds remain stable while moving pieces.

Validation: 51 automated tests, static build and the 24-page link/metadata audit.

## Follow-up corrections

- Removed the bulk plant illustration control; each plant has exactly one independent type selector.
- Wall length and end placement are exposed whenever a wall is checked. Partial walls work with an open remainder and do not require another boundary feature. A custom screen length suggests a complementary initial wall length.
- Above-railing geometry errors attach to the specific side's screen-position selector, rather than the shared height field below all sides. Recovery changes only that side to cover the railing.
- Validation: 55 automated tests, including side-specific errors and recovery, standalone partial walls, and absence of the contradictory bulk selector.
