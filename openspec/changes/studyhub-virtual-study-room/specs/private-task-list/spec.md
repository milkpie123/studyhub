## ADDED Requirements

### Requirement: View personal task list

The system SHALL display a task panel visible only to the logged-in user showing their own tasks. The panel SHALL be positioned to the side of the room view and SHALL not be visible to other users.

#### Scenario: Task panel loads on room entry

- **WHEN** a logged-in user navigates to `/`
- **THEN** the system SHALL fetch all tasks for that user from the `tasks` table and render them in the task panel

#### Scenario: Empty task list

- **WHEN** the user has no tasks
- **THEN** the task panel SHALL display a prompt to add a first task

### Requirement: Add a task

The system SHALL allow the user to type a task description and submit it to create a new task. New tasks SHALL appear at the bottom of the task list and SHALL default to unchecked.

#### Scenario: Successful task creation

- **WHEN** the user types a non-empty task description and presses Enter or clicks the add button
- **THEN** the system SHALL insert a row into `tasks` with `checked = false` and render the new task in the list

#### Scenario: Empty task rejected

- **WHEN** the user submits an empty or whitespace-only task description
- **THEN** the system SHALL not create a task and SHALL not show an error (silent no-op)

### Requirement: Check off a task

The system SHALL allow the user to toggle a task between checked and unchecked. The visual state SHALL update immediately (optimistic update) and persist to the `tasks` table.

#### Scenario: Checking a task

- **WHEN** the user clicks the checkbox of an unchecked task
- **THEN** the system SHALL immediately render it as checked and update `tasks.checked = true` in the background

#### Scenario: Unchecking a task

- **WHEN** the user clicks the checkbox of a checked task
- **THEN** the system SHALL immediately render it as unchecked and update `tasks.checked = false` in the background

### Requirement: Task data is private

The system SHALL never expose a user's task list to other users. Task data SHALL only be readable by the authenticated user who owns the tasks, enforced via Supabase Row Level Security (RLS) policies.

#### Scenario: RLS blocks cross-user reads

- **WHEN** User B's client attempts to query tasks with `user_id = User A's id`
- **THEN** Supabase SHALL return an empty result set due to RLS policy enforcement
