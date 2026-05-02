## Why

Working alone lacks social accountability — seeing others present and focused creates ambient motivation, the same effect as studying in a library. Studyhub provides a virtual version of that shared space.

## What Changes

- New web application (built on the existing Next.js + Tailwind scaffold) with Supabase for auth, database, and real-time presence
- A single virtual room with 8 seats displayed in a top-down view
- Users navigate seats with arrow keys and claim one by pressing a designated key
- Claimed seats show the occupant's avatar (color + display name) to all connected users in real time
- Each user has a private daily task list — add tasks, check them off; visible only to themselves
- Auth flow: login and signup with avatar color picker

## Non-Goals

- Leaderboard / task streaks — out of scope for this phase
- Task progress visible to other users — tasks are strictly private
- Multiple rooms — one room only at launch
- Live avatar movement between seats — seat state is claimed/unclaimed, not continuous position streaming
- Mobile / touch support — keyboard-first interface only for now

## Capabilities

### New Capabilities

- `user-auth`: User registration and login with display name, username, password, and avatar color selection
- `study-room`: Single shared virtual room with 8 seats; arrow-key navigation to select a seat, press to claim/unclaim; real-time presence showing all occupants' avatars
- `private-task-list`: Per-user daily task list — add, check off, and clear tasks; data is private and never shared

### Modified Capabilities

(none)

## Impact

- Affected specs: user-auth, study-room, private-task-list (all new)
- Affected code:
  - New: app/(main)/page.tsx (replace existing homepage with study room view)
  - New: app/(auth)/login/page.tsx
  - New: app/(auth)/signup/page.tsx
  - New: app/api/auth/route.ts
  - New: components/room/StudyRoom.tsx
  - New: components/room/Seat.tsx
  - New: components/room/Avatar.tsx
  - New: components/tasks/TaskPanel.tsx
  - New: lib/supabase.ts
  - New: lib/presence.ts
  - Modified: app/layout.tsx
  - Modified: package.json (add @supabase/supabase-js, @supabase/ssr)
