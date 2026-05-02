## Context

The existing repo is a Next.js 16 + Tailwind CSS project currently used for an unrelated story generator app. The scaffold (routing, config, TypeScript, Tailwind) can be reused. All existing story-related pages and components will be removed and replaced with Studyhub.

Studyhub needs three capabilities: auth, a shared virtual room, and a private task list. The defining architectural challenge is real-time seat presence — when a user claims a seat, all other connected clients must update within ~1 second without a full page reload.

## Goals / Non-Goals

**Goals:**
- Single virtual room, 8 seats, displayed as a top-down grid
- Arrow-key seat selection; confirm key (Enter/Space) to claim or unclaim
- Supabase Realtime broadcasts seat changes to all connected clients
- Private task list stored per user in Supabase; never sent to other clients
- Auth via Supabase Auth (email/password); signup includes display name + avatar color
- Clean UI styled with Tailwind; avatar represented as a colored circle with initials

**Non-Goals:**
- Leaderboard, streaks, or task visibility to other users
- Multiple rooms
- Mobile / touch support
- Continuous avatar movement (only claimed/unclaimed seat state matters)
- Any persistence of the existing story-generator routes or components

## Decisions

### Use Supabase for auth, database, and real-time presence

Supabase provides Postgres + Supabase Auth + Realtime in one free-tier package. Realtime's channel subscriptions allow broadcasting seat-change events to all connected browser clients without building a custom WebSocket server.

**Alternative considered**: Firebase Realtime Database — rejected because Supabase stays closer to Postgres SQL, which is easier to extend, and provides SSR-friendly auth helpers via `@supabase/ssr`.

### Seat state lives in a `seats` table, not ephemeral presence channels

Each seat row has `id` (1–8), `occupied_by` (user_id or null), and `occupied_at`. When a user claims a seat, we `UPDATE seats SET occupied_by = <user_id>`. Supabase Realtime's Postgres Changes subscription fires for all connected clients.

**Alternative considered**: Supabase Presence (ephemeral channel state) — rejected because Postgres Changes gives us durability; a user refreshing still sees the correct seat state from the DB.

**Constraint**: Only one seat per user at a time — before claiming seat N, the server function must clear any existing claim for that user.

### Room rendered as a CSS grid with fixed seat positions

The room layout is a visual representation only — no canvas or game engine needed. A CSS grid (or absolute-positioned div) places 8 seat components at fixed coordinates matching the prototype's top-down library view. The arrow-key focus is managed via a `focusedSeatIndex` state that cycles through seat positions.

**Alternative considered**: HTML5 Canvas — rejected as overkill for a static 8-seat layout.

### Task list persisted in Supabase `tasks` table, fetched on mount

Tasks are stored per user with `id`, `user_id`, `text`, `checked`, `created_at`. The task panel is a client component that fetches on load and updates optimistically on check/uncheck. No real-time subscription needed — tasks are private and only the owner reads them.

### Auth guard via Next.js middleware

Supabase SSR session is read in `middleware.ts` to redirect unauthenticated users away from the room route to `/login`. This prevents flicker of the room before the client discovers the missing session.

## Risks / Trade-offs

- **Seat claim race condition** → Two users claiming the same seat simultaneously could both succeed. Mitigation: add a `UNIQUE` constraint on `occupied_by` in the `seats` table so only one insert/update wins; the losing client receives an error and re-fetches seat state.
- **Stale seat on disconnect** → If a user closes the tab without unclaiming, their seat stays occupied. Mitigation: add a "clear stale seats" button for the owner, or implement a Supabase Edge Function that clears seats older than N hours (out of scope for phase 1 — document as known limitation).
- **Supabase free tier limits** → 500 MB DB, 2 GB bandwidth, 50K monthly active users. Sufficient for launch.
