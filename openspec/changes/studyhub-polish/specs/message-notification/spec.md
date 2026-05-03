## ADDED Requirements

### Requirement: Received messages appear as bottom-right notification cards

When a user receives a message, it SHALL appear as a notification card in the bottom-right corner of the viewport. Cards SHALL stack vertically (newest on top). A maximum of 3 cards SHALL be visible simultaneously; the oldest card SHALL be auto-dismissed after 15 seconds if the stack exceeds 3.

#### Scenario: Message received

- **WHEN** the Supabase Realtime subscription fires an INSERT event on `messages` for the current user
- **THEN** a notification card appears in the bottom-right corner showing the sender's display name and the message text

#### Scenario: Maximum 3 cards visible

- **WHEN** 4 or more messages arrive in rapid succession
- **THEN** at most 3 notification cards are visible; the oldest card is removed to make room

### Requirement: Heart button dismisses the notification with animation

Each notification card SHALL have a heart icon button. Clicking it SHALL first animate the heart to red (200 ms CSS transition), then after 400 ms the card SHALL fade out (opacity 0 over 300 ms). After the fade, the card SHALL be removed from the DOM.

#### Scenario: User dismisses a notification

- **WHEN** a user clicks the heart icon on a notification card
- **THEN** the heart turns red within 200 ms, then the card fades to opacity 0 over 300 ms, then the card is removed from the notification stack

##### Example: dismiss timing

| Step | Time from click | Observed state |
| ---- | --------------- | -------------- |
| Click heart | 0 ms | Heart begins transition to red |
| Heart red | ≤ 200 ms | Heart is fully red |
| Card fade starts | 400 ms | Card opacity begins dropping |
| Card gone | 700 ms | Card removed from DOM |

### Requirement: Auto-dismiss after 15 seconds

A notification card SHALL auto-dismiss (with the same heart animation) after 15 seconds if the user has not dismissed it manually.

#### Scenario: Auto-dismiss fires

- **WHEN** a notification card has been visible for 15 seconds without user interaction
- **THEN** the card begins the heart-red → fade-out animation sequence and is then removed
