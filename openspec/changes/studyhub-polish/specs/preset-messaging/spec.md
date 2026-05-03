## ADDED Requirements

### Requirement: User can send a preset message to another user

When a logged-in user clicks another user's avatar (in the seat grid or Coffee Break area), a message popup SHALL appear offering exactly 5 preset messages. Selecting a message SHALL insert a row into the `messages` table and close the popup.

The 5 preset messages SHALL be:
1. "Hi there! 👋"
2. "You got this! 💪"
3. "How are you doing? 😊"
4. "Keep up the great work! ⭐"
5. "Taking a short break? 🍵"

#### Scenario: User opens message popup

- **WHEN** a user clicks another user's avatar
- **THEN** a popup appears showing the 5 preset messages as selectable options and the recipient's display name

#### Scenario: User sends a preset message

- **WHEN** a user selects one of the 5 preset messages from the popup
- **THEN** a row is inserted into `messages` with `sender_id`, `recipient_id`, and `text`, and the popup closes

#### Scenario: User cannot message themselves

- **WHEN** a user clicks their own avatar
- **THEN** no message popup opens (nothing happens, or the profile modal opens instead per profile-modal spec)

### Requirement: Message popup closes without sending

The popup SHALL include a way to dismiss it without sending a message.

#### Scenario: User closes popup without sending

- **WHEN** a user clicks outside the popup or presses Escape
- **THEN** the popup closes and no message is inserted
