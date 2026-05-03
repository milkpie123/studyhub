## Why

The study room currently uses keyboard-only navigation which feels clunky on the web. Users also have no way to communicate with each other or view/edit their own profile, leaving the social and identity layers incomplete.

## What Changes

- Seats become directly clickable — no more arrow-key selection or keyboard hints
- A "Coffee Break" lounge area is added below the study hall; clicking it moves the user's avatar there (no seats, free-form presence)
- Users can click another user's avatar to send one of 5 preset messages; received messages appear as a bottom-right notification dismissed with a heart button (micro-animation: heart turns red then fades)
- Users can click their own display name to open a profile modal where they can change their animal avatar and display name, and view days-on-site and total finished tasks

## Capabilities

### New Capabilities

- `click-to-sit`: Click an empty seat to claim it; click an occupied seat does nothing; clicking anywhere in the Coffee Break area moves the user there
- `coffee-break-area`: A lounge zone below the study hall with no fixed seats; users can "be" there instead of at a desk
- `preset-messaging`: Click another user's avatar to open a message popup with 5 preset messages; selected message is delivered and shown as a notification to the recipient
- `message-notification`: Received messages appear as a persistent card in the bottom-right corner; dismissed by clicking a heart icon that animates red before the card fades out
- `profile-modal`: Click own display name to open a modal showing animal picker, editable display name, days-on-site counter, and total finished-task count; changes are saved to Supabase

### Modified Capabilities

(none)

## Impact

- Affected specs: click-to-sit, coffee-break-area, preset-messaging, message-notification, profile-modal
- Affected code:
  - New: components/room/CoffeeBreakArea.tsx, components/room/MessagePopup.tsx, components/room/MessageNotification.tsx, components/profile/ProfileModal.tsx, supabase/migrations/004_messages.sql
  - Modified: components/room/StudyRoom.tsx, components/room/Seat.tsx, app/(main)/page.tsx
  - Removed: (none)
