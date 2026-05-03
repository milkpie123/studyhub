## Context

Studyhub is a Next.js + Supabase virtual study room. The current room uses keyboard navigation (arrow keys to focus a seat, Enter/Space to sit) which is unintuitive for a web app. The social layer is also missing: users cannot communicate with each other and cannot view or edit their own profile. This design covers the interaction model, real-time messaging, and profile editing.

Relevant existing files:
- `components/room/StudyRoom.tsx` — seat grid, Supabase Realtime subscription, sit/leave logic
- `components/room/Seat.tsx` — renders one seat as empty or occupied
- `components/room/Avatar.tsx` — ANIMALS constant, Avatar component
- `app/(main)/page.tsx` — server component fetching profile + seats
- `supabase/migrations/002_seats.sql` — seats 1–8, occupied_by FK to auth.users

## Goals / Non-Goals

**Goals:**
- Replace keyboard seat selection with click-to-sit
- Add Coffee Break area (below study hall) as a soft presence zone with no fixed seats
- Enable one-to-one preset messaging with a bottom-right notification + heart dismiss
- Allow users to edit their display name and animal avatar, and view their stats, in a profile modal

**Non-Goals:**
- Free-text messaging
- Persistent chat history
- More than one "coffee break" zone
- Group/broadcast messages
- Profile photos, bios, or social links beyond what is specified

## Decisions

### Click-to-sit replaces keyboard navigation

Remove the `onKeyDown` handler and the keyboard hint text from `StudyRoom`. Each `Seat` receives an `onClick` prop. Clicking an empty seat calls the existing Supabase claim logic. Clicking an occupied seat by another user shows the message popup. Clicking one's own seat has no effect (or unclaims — keep current leave button behavior unchanged).

The `ADJACENCY` map used for arrow navigation is removed entirely.

### Coffee Break stored as seat_id = null + a separate `in_coffee_break` flag

Two options considered:
- **Option A**: Use a virtual "seat" (e.g., seat_id = 0 or 9) in the existing seats table.
- **Option B**: Add a boolean `in_coffee_break` column to the `profiles` table.

Chosen: **Option B** (profiles column). Reasons:
1. No structural change to the seats table or its constraint (seats 1–8 only).
2. Coffee Break is a soft presence state, not a seat claim — the semantics fit a profile flag better.
3. Simpler RLS: the user can only update their own profile row.

When a user clicks Coffee Break: set `in_coffee_break = true` on their profile and call the existing leave-seat logic. When a user clicks a seat: set `in_coffee_break = false` and claim the seat. Coffee Break users are rendered in the Coffee Break panel below the grid, using the same Avatar component.

### Messaging via Supabase table with Realtime subscription

A `messages` table stores one-way point-to-point messages. Schema: `id`, `sender_id`, `recipient_id`, `text` (max 100 chars), `created_at`, `read_at` (nullable). RLS: sender can insert; recipient can select and update (to mark read). Messages are ephemeral — no pagination, client keeps only the latest unread per sender.

Preset message list (exactly 5):
1. "Hi there! 👋"
2. "You got this! 💪"
3. "How are you doing? 😊"
4. "Keep up the great work! ⭐"
5. "Taking a short break? 🍵"

The message popup (`MessagePopup`) opens when a user clicks another user's Avatar in the study grid or Coffee Break area. It renders as a small card anchored near the clicked avatar. Selecting a message inserts a row into `messages` and closes the popup.

`StudyRoom` subscribes to the `messages` table filtered by `recipient_id = current user` on mount. On INSERT event, it adds the message to a local state array. Each message renders as a `MessageNotification` card stacked in the bottom-right corner.

### Heart dismiss animation

When the user clicks the heart button on a `MessageNotification`, the heart icon transitions to red (CSS transition, 200 ms), then after 400 ms the entire card fades out (opacity 0, 300 ms). After the fade, the card is removed from state. No external animation library — implemented with `useState` + `setTimeout` + Tailwind `transition` utilities.

### Profile modal reads from profiles and tasks tables

The profile modal (`ProfileModal`) is triggered by clicking the user's display name in the room header or status bar. It fetches:
- Current profile (display_name, avatar_color, created_at)
- Count of completed tasks: `select count(*) from tasks where user_id = auth.uid() and done = true`

Days on site = `floor((now - profile.created_at) / 86400000)`, computed client-side.

Edits are saved on modal close (or an explicit Save button) via `supabase.from('profiles').update(...)`. The animal picker reuses the same grid from `app/(auth)/signup/page.tsx`. Display name is a controlled `<input>`.

## Risks / Trade-offs

- [Realtime message delivery] Supabase Realtime may drop events under poor network. Mitigation: messages are persisted in the DB; a future polling fallback can be added if needed. For now, ephemeral delivery is acceptable.
- [Multiple unread messages] If a user receives multiple messages quickly, cards stack vertically in the bottom-right. With more than 3–4, the stack gets tall. Mitigation: cap visible notifications at 3; oldest auto-dismiss after 15 seconds.
- [Coffee Break Realtime] The `in_coffee_break` flag is on `profiles`, which is not currently subscribed to Realtime. Mitigation: subscribe to profiles Realtime changes in `StudyRoom` alongside the seats subscription so other users see someone move to/from Coffee Break.
