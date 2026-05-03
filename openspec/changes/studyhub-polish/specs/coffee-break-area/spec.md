## ADDED Requirements

### Requirement: Coffee Break zone exists below study hall

A Coffee Break area SHALL be rendered below the study hall grid. It SHALL have no fixed seats. Its visual design SHALL follow the existing warm cozy aesthetic (same border, background, and font palette as the study hall).

#### Scenario: Coffee Break area is visible

- **WHEN** the study room page loads
- **THEN** a labeled "Coffee Break" zone is visible below the seat grid

### Requirement: Clicking Coffee Break area moves user there

A logged-in user SHALL be able to click anywhere within the Coffee Break area to move their avatar there. Doing so SHALL release any seat they currently hold and set `in_coffee_break = true` on their profile.

#### Scenario: User moves to Coffee Break from a seat

- **WHEN** a user who occupies seat N clicks the Coffee Break area
- **THEN** seat N is released, `in_coffee_break` is set to true, and the user's avatar appears in the Coffee Break area

#### Scenario: User moves to Coffee Break from no seat

- **WHEN** a user with no seat clicks the Coffee Break area
- **THEN** `in_coffee_break` is set to true and the user's avatar appears in the Coffee Break area

### Requirement: Coffee Break avatars are visible to all users

All users currently in Coffee Break SHALL be displayed inside the Coffee Break zone so other room occupants can see them.

#### Scenario: Other user's avatar visible in Coffee Break

- **WHEN** another user has `in_coffee_break = true`
- **THEN** their avatar (emoji + display name) is rendered inside the Coffee Break area on all clients via Realtime update

### Requirement: Claiming a seat clears Coffee Break status

When a user claims a seat, `in_coffee_break` SHALL be set to false.

#### Scenario: User moves from Coffee Break to a seat

- **WHEN** a user with `in_coffee_break = true` clicks an empty seat
- **THEN** `in_coffee_break` is set to false and the user's avatar appears in the claimed seat
