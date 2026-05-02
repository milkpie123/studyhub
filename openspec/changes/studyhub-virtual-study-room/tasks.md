## 1. Project Setup

- [x] 1.1 Install Supabase dependencies: add `@supabase/supabase-js` and `@supabase/ssr` to package.json
- [x] 1.2 Add Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) to `.env.local` and `.env.example`
- [x] 1.3 Create `lib/supabase.ts` exporting browser client and server client helpers using `@supabase/ssr`
- [x] 1.4 Remove existing story-generator pages and components (app/(main)/new, app/(main)/stories, components/stories, components/typewriter, app/api/generate) that are unrelated to Studyhub
- [x] 1.5 Update `app/layout.tsx` to set Studyhub metadata (title "Studyhub") and remove story-app layout chrome

## 2. Database Schema

- [x] 2.1 Create Supabase migration: `profiles` table with columns `id` (uuid, references auth.users), `display_name` (text), `username` (text, unique), `avatar_color` (text)
- [x] 2.2 Create Supabase migration: `seats` table with columns `id` (int 1–8, primary key), `occupied_by` (uuid, nullable, foreign key → profiles.id, unique), `occupied_at` (timestamptz) — seat state lives in a `seats` table, not ephemeral presence channels (design decision)
- [x] 2.3 Create Supabase migration: `tasks` table with columns `id` (uuid), `user_id` (uuid, references profiles.id), `text` (text), `checked` (bool default false), `created_at` (timestamptz)
- [x] 2.4 Enable Supabase Realtime on the `seats` table (set replica identity to FULL)
- [x] 2.5 Add Row Level Security policy on `tasks` table: users can only SELECT/INSERT/UPDATE rows where `user_id = auth.uid()` — satisfies the task data is private requirement

## 3. Auth — User Registration

- [x] 3.1 Create `app/(auth)/signup/page.tsx` with form fields: display name, username, password, avatar color picker (8 swatches: red, orange, yellow, green, teal, blue, purple, pink)
- [x] 3.2 Implement avatar color picker: clicking a swatch updates a preview circle with initials — satisfies the avatar color selection requirement
- [x] 3.3 Implement client-side validation: password must be ≥8 characters; show inline error "Password must be at least 8 characters" before submission — satisfies short password rejected scenario
- [x] 3.4 Implement signup server action: call `supabase.auth.signUp` then insert into `profiles`; on duplicate username return "Username already taken" — satisfies user registration and duplicate username rejected requirements
- [x] 3.5 On successful signup, redirect to `/`

## 4. Auth — User Login

- [x] 4.1 Create `app/(auth)/login/page.tsx` with fields: username and password, login button, and "not a member? sign up" link to `/signup`
- [x] 4.2 Implement login server action: look up `profiles.username` to get the email, call `supabase.auth.signInWithPassword`; on failure return generic "Invalid username or password" — satisfies user login requirement
- [x] 4.3 On successful login, redirect to `/`

## 5. Auth — Session and Route Protection

- [x] 5.1 Implement auth guard via Next.js middleware: create `middleware.ts` using `@supabase/ssr` to read the session cookie; redirect unauthenticated requests for `/` to `/login` — satisfies session persistence and route protection requirement
- [x] 5.2 Verify that a logged-in user refreshing `/` stays on the room page (session survives refresh scenario)

## 6. Study Room — Layout and Seat Rendering

- [x] 6.1 Create `components/room/Avatar.tsx`: renders a colored circle with the user's initial; accepts `color` and `displayName` props
- [x] 6.2 Create `components/room/Seat.tsx`: renders empty or occupied state; accepts `seatId`, `occupant` (profile or null), `isFocused`, `isOwnSeat` props; applies highlight ring when focused — satisfies avatar display in seats and focused seat highlight requirements
- [x] 6.3 Create `components/room/StudyRoom.tsx`: room rendered as a CSS grid with fixed seat positions — positions 8 `Seat` components in a top-down layout matching the prototype; manages `focusedSeatIndex` state — satisfies top-down room layout with 8 seats requirement
- [x] 6.4 Replace `app/(main)/page.tsx` content with `StudyRoom` component

## 7. Study Room — Keyboard Navigation and Seat Claiming

- [x] 7.1 Implement arrow-key seat navigation in `StudyRoom.tsx`: attach a `keydown` listener; map Up/Down/Left/Right to adjacent seat indices in the grid; do not wrap if no adjacent seat exists — satisfies arrow-key seat navigation requirement
- [x] 7.2 Implement claim and unclaim a seat: on Enter or Space, if focused seat is empty call Supabase to set `seats.occupied_by` to current user (clearing any prior claim first); if focused seat is own seat set `seats.occupied_by` to null — satisfies claim an empty seat, unclaim own seat, and moving to a new seat releases the previous one requirements
- [x] 7.4 Block action when focused seat is occupied by another user — satisfies cannot claim a seat occupied by another user requirement

## 8. Study Room — Real-Time Presence

- [x] 8.1 In `StudyRoom.tsx` (or `lib/presence.ts`), subscribe to Supabase Realtime Postgres Changes on the `seats` table on component mount; unsubscribe on unmount
- [x] 8.2 On receiving a seat-change event, merge the updated seat into local state so all connected clients update within ~1 second — satisfies real-time presence updates requirement (another user claims a seat, another user unclaims a seat scenarios)

## 9. Private Task List

- [x] 9.1 Create `components/tasks/TaskPanel.tsx`: task list persisted in Supabase `tasks` table, fetched on mount — render the list with checkboxes; show "Add your first task" prompt when empty — satisfies view personal task list requirement
- [x] 9.2 Implement add-task input: text field + add button; on Enter or click, if value is non-empty insert a new task row; if empty do nothing — satisfies add a task requirement (including empty task rejected scenario)
- [x] 9.3 Implement check/uncheck: clicking a checkbox optimistically toggles `checked` in local state then updates `tasks.checked` in Supabase — satisfies check off a task requirement
- [x] 9.4 Confirm RLS policy from step 2.5 is active; test that querying another user's tasks returns empty — satisfies task data is private requirement

## 10. Supabase Use Supabase for auth, database, and real-time presence Decision Validation

- [x] 10.1 Verify Supabase Realtime channel subscription (Postgres Changes) fires correctly in development before final integration test
- [x] 10.2 Test the seat claim race condition protection: confirm the UNIQUE constraint on `seats.occupied_by` prevents two users from claiming the same seat simultaneously — addresses the race condition risk from design

## 11. Polish and Deployment

- [x] 11.1 Add a logout button in the room header that calls `supabase.auth.signOut` and redirects to `/login`
- [x] 11.2 Update `vercel.json` and environment variable config for Supabase keys in production
- [x] 11.3 Run `next build` and resolve any TypeScript or lint errors before deployment
