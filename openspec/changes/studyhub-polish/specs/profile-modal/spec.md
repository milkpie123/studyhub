## ADDED Requirements

### Requirement: User can open their profile modal by clicking their display name

A logged-in user SHALL be able to click their own display name (shown in the room UI) to open a profile modal. Clicking another user's avatar SHALL NOT open this modal.

#### Scenario: User opens profile modal

- **WHEN** a user clicks their own display name in the room
- **THEN** a modal opens showing the profile editor and stats

### Requirement: Profile modal shows animal picker and editable display name

The profile modal SHALL display:
- An animal picker grid (same 8 animals as signup) allowing the user to select a different animal
- A text input pre-filled with the current display name, allowing the user to edit it
- A Save button that persists changes to the `profiles` table via Supabase

#### Scenario: User changes animal

- **WHEN** a user selects a different animal in the profile modal and clicks Save
- **THEN** `avatar_color` is updated in the `profiles` table and the room UI reflects the new animal

#### Scenario: User changes display name

- **WHEN** a user edits the display name input and clicks Save
- **THEN** `display_name` is updated in the `profiles` table and the room UI reflects the new name

#### Scenario: User saves with no changes

- **WHEN** a user opens the profile modal and clicks Save without changing anything
- **THEN** the modal closes and no Supabase update is made

### Requirement: Profile modal shows days on site and total finished tasks

The profile modal SHALL display:
- Days on site: computed as `floor((now - profile.created_at) / 86400000)`, minimum 1 for the first day
- Total finished tasks: count of rows in `tasks` where `user_id = current user` and `done = true`

#### Scenario: Stats are displayed correctly

- **WHEN** the profile modal opens
- **THEN** the days-on-site count and total finished task count are visible

##### Example: days on site calculation

| profile.created_at (relative to now) | Expected days on site |
| ------------------------------------- | --------------------- |
| Same day (0 h elapsed) | 1 |
| 1 day ago | 2 |
| 30 days ago | 31 |

### Requirement: Profile modal can be closed without saving

The modal SHALL include a close affordance (× button or clicking the backdrop) that discards unsaved changes.

#### Scenario: User closes modal without saving

- **WHEN** a user edits the display name then clicks the × button or backdrop
- **THEN** the modal closes and no Supabase update is made
