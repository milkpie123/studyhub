## ADDED Requirements

### Requirement: User registration

The system SHALL allow a new user to register with a display name, username, password, and avatar color. On successful registration the system SHALL create a Supabase Auth account and a corresponding row in the `profiles` table, then redirect the user to the study room.

#### Scenario: Successful signup

- **WHEN** a user submits a valid display name, unique username, password (≥8 characters), and avatar color
- **THEN** the system SHALL create the account, store the profile, and redirect to `/`

#### Scenario: Duplicate username rejected

- **WHEN** a user submits a username that already exists
- **THEN** the system SHALL display the error "Username already taken" and not create an account

#### Scenario: Short password rejected

- **WHEN** a user submits a password shorter than 8 characters
- **THEN** the system SHALL display the error "Password must be at least 8 characters" inline before submission

##### Example: password boundary

| Password length | Expected outcome |
|---|---|
| 7 chars | Inline error, form not submitted |
| 8 chars | Submission allowed |

### Requirement: User login

The system SHALL allow an existing user to log in with username and password. On success the system SHALL establish a Supabase Auth session and redirect to `/`. On failure the system SHALL display a generic error without revealing which field is wrong.

#### Scenario: Successful login

- **WHEN** a user submits correct credentials
- **THEN** the system SHALL set the session cookie and redirect to `/`

#### Scenario: Invalid credentials

- **WHEN** a user submits an incorrect username or password
- **THEN** the system SHALL display "Invalid username or password" and remain on the login page

### Requirement: Session persistence and route protection

The system SHALL maintain the user session across page refreshes via Supabase SSR cookies. The system SHALL redirect unauthenticated requests to `/login` for any route except `/login` and `/signup`.

#### Scenario: Unauthenticated room access

- **WHEN** a visitor navigates to `/` without a valid session
- **THEN** the system SHALL redirect them to `/login`

#### Scenario: Session survives refresh

- **WHEN** a logged-in user refreshes the page
- **THEN** the system SHALL restore the session and display the room without requiring re-login

### Requirement: Avatar color selection

The system SHALL present a fixed palette of 8 avatar colors during signup. The selected color SHALL be stored in the user's profile and used to render their avatar circle throughout the app.

#### Scenario: Color picker interaction

- **WHEN** a user selects a color swatch on the signup page
- **THEN** the system SHALL update the preview avatar circle to reflect that color immediately

##### Example: palette

- **GIVEN** palette: red, orange, yellow, green, teal, blue, purple, pink
- **WHEN** user selects "teal"
- **THEN** avatar preview renders with teal background
