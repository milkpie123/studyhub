## ADDED Requirements

### Requirement: Top-down room layout with 8 seats

The system SHALL render a single virtual study room as a top-down view containing exactly 8 seats arranged around tables. Each seat SHALL display as either empty or occupied (showing the occupant's avatar).

#### Scenario: Room loads with current occupancy

- **WHEN** a logged-in user navigates to `/`
- **THEN** the system SHALL fetch current seat state from the `seats` table and render each seat as occupied or empty accordingly

#### Scenario: Empty room view

- **WHEN** no users are occupying any seats
- **THEN** all 8 seats SHALL render as empty placeholders

### Requirement: Arrow-key seat navigation

The system SHALL allow the user to move focus between seats using the arrow keys (Up, Down, Left, Right). Focus cycles through seats in the layout order without wrapping off-screen. The focused seat SHALL be visually highlighted.

#### Scenario: Arrow key moves focus

- **WHEN** the user presses an arrow key
- **THEN** the focus moves to the adjacent seat in that direction; if no adjacent seat exists in that direction, focus SHALL not change

#### Scenario: Focused seat is highlighted

- **WHEN** a seat has keyboard focus
- **THEN** the system SHALL render a visible highlight ring around that seat

### Requirement: Claim and unclaim a seat

The system SHALL allow the user to claim the focused seat by pressing Enter or Space. A user SHALL only occupy one seat at a time. Pressing Enter or Space on an already-occupied own seat SHALL unclaim it.

#### Scenario: Claim an empty seat

- **WHEN** the user focuses an empty seat and presses Enter or Space
- **THEN** the system SHALL set `seats.occupied_by` to the current user's id and render the user's avatar in that seat

#### Scenario: Cannot claim a seat occupied by another user

- **WHEN** the user focuses a seat occupied by another user and presses Enter or Space
- **THEN** the system SHALL do nothing (no state change)

#### Scenario: Unclaim own seat

- **WHEN** the user presses Enter or Space on the seat they currently occupy
- **THEN** the system SHALL set `seats.occupied_by` to null and render that seat as empty

#### Scenario: Moving to a new seat releases the previous one

- **WHEN** the user claims seat B while already occupying seat A
- **THEN** the system SHALL atomically set seat A to null and seat B to the user's id

### Requirement: Real-time presence updates

The system SHALL subscribe to Supabase Realtime Postgres Changes on the `seats` table. When any seat changes, all connected clients SHALL update their room view within approximately 1 second without a page reload.

#### Scenario: Another user claims a seat

- **WHEN** User B claims seat 3
- **THEN** User A's browser SHALL update seat 3 to show User B's avatar within ~1 second

#### Scenario: Another user unclaims a seat

- **WHEN** User B unclaims seat 3
- **THEN** User A's browser SHALL update seat 3 to show as empty within ~1 second

### Requirement: Avatar display in seats

Occupied seats SHALL display a colored circle with the occupant's initials (first letter of display name) in the seat's avatar slot. The circle color SHALL match the user's stored avatar color.

#### Scenario: Avatar renders correctly

- **WHEN** a seat is occupied by a user with display name "Lili" and avatar color orange
- **THEN** the seat SHALL render an orange circle containing the letter "L"
