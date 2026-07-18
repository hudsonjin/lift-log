# Lift Log v1 — MVP Spec

## 1. Purpose

Track logged sets per exercise and tell me, before I lift, what weight/reps/sets to do next, per the rule in `progression-rule.md`.

## 2. User

Just me, on my phone, standing at the gym between sets. No accounts, no other users.

## 3. Screens/sections

- **Log a Workout** — pick an exercise; if it has history, show the suggested weight/target reps/set count (computed live per `progression-rule.md`); if it's the exercise's first-ever session, prompt for a starting weight instead (per that doc's edge case). Enter reps for each set, hit Save.
- **Workout History** — running list of past sessions, newest visible without digging through raw storage. Each session has a Delete option.
- **Export** — CSV download button (already built, carries over as-is).

## 4. Data model

Extends the existing entry shape, doesn't replace it:

- `exerciseTargets` *(new)* — one record per exercise: `{ targetWeight, targetReps (default 8, editable), setCount (default 3, editable) }`.
- `workoutLog` entries *(extends today's shape)* — `{ id, exercise, weight, reps }`, where **`reps` changes from a single number to an array of per-set rep counts** (e.g. `[8, 8, 7]`). `progression-rule.md` triggers on "all 3 sets hit target reps *this session*," and defines session identity as "each logged entry is its own session" — that only works if one entry holds the result of every set in that session.
- **Migration:** on load, any existing entry whose `reps` is still a plain number (not an array) gets wrapped into a single-element array (`8` → `[8]`) the first time it's read. Old data is reinterpreted, never deleted or discarded.
- Suggestions are never stored — computed fresh from `workoutLog` + `exerciseTargets` every time, per `progression-rule.md` line 18.

## 5. MVP feature list

1. Log a session (exercise, weight, per-set reps) — *done when a saved session appears in Workout History.*
2. Show suggested weight/target before logging — *done when an exercise with history displays the rule's computed suggestion prior to input.*
3. First-ever-session handling — *done when logging a new exercise prompts for a starting weight instead of a suggestion.*
4. Edit per-exercise target reps/set count — *done when a change applies to future sessions only, per that doc's edge case.*
5. Workout History list — *done when every saved session is visible in order without opening dev tools.*
6. Delete a session entry — *done when deleting a session removes it from both the displayed list and localStorage immediately.*
7. CSV export — *done when export downloads a file, or shows an empty-state message with zero sessions.*
8. Persistence — *done when closing/reopening the browser preserves all sessions and targets, including through the reps migration above.*

## 6. Non-goals (v1)

- No accounts, multi-user, or cloud sync — one browser, one device.
- No editing a past session's data in place — delete only (see feature list #6), no edit-and-resave.
- No charts, trends, or analytics beyond the plain list.
- No exercise-library management — exercise list stays fixed/hardcoded.
- No 2-session confirmation, deload, RPE, or auto-regulation — deferred per `progression-rule.md`'s own v2 list.
- No confetti/"Add Set" gamification counter — removed entirely for v1, not carried over from the earlier prototype.
- The existing 1-Rep-Max calculator stays in the app but isn't part of v1's tested feature set.
