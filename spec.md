# Lift Log v1 — MVP Spec

## 1. Purpose

Track logged sets per exercise and tell me, before I lift, what weight/reps/sets to do next, per the rule in `progression-rule.md`.

## 2. User

Just me, on my phone, standing at the gym between sets. No accounts, no other users.

## 3. Screens/sections

- **Log a Workout** — pick an exercise; if it has history, show the suggested weight/target reps/set count (computed live per `progression-rule.md`); if it's the exercise's first-ever session, prompt for a starting weight instead (per that doc's edge case). For exercises tagged bodyweight (Pull-ups, Dips), no weight suggestion is ever shown — the screen displays "bodyweight — no suggestion made" and the session is logged with `weight: 'bodyweight'`. Enter reps for each set, hit Save.
- **Workout History** — running list of past sessions, newest visible without digging through raw storage. Each session has a Delete option.
- **Export** — CSV download button (already built, carries over as-is).

## 4. Data model

Extends the existing entry shape, doesn't replace it:

- `targetReps` (8) and `setCount` (3) are hardcoded constants in v1 — not stored anywhere, not per-exercise, not editable. v2 can introduce a stored `exerciseTargets` record once editability actually exists.
- `targetWeight` is **not stored**. Suggestions are computed from the last logged entry's `weight` plus the body-region increment (advance) or unchanged (hold) — never from a separately stored target. The first-ever session's starting weight, entered by the user, becomes that first entry's `weight` and the anchor for every future suggestion.
- `workoutLog` entries — `{ id, exercise, weight, reps, timestamp }`:
  - `id`: unique identifier generated at save time, via `Date.now()` or `crypto.randomUUID()`.
  - `weight`: a number, **or** the sentinel string `'bodyweight'` for exercises tagged bodyweight (Pull-ups, Dips) — those never get a numeric suggestion.
  - `reps`: an array of per-set rep counts (e.g. `[8, 8, 7]`), one entry per set. `progression-rule.md` defines session identity as "each logged entry is its own session," which only works if one entry holds every set's result.
  - `timestamp`: captured at save time; used for History ordering and for selecting an exercise's "last session."
- **Last session**, defined precisely: the entry for that exercise with the latest `timestamp`; ties broken by `id` insertion order (the later-added entry wins).
- **Hit predicate**, stated explicitly: a set is a hit when `reps >= targetReps`. An entry only triggers Advance if *every* set in its `reps` array is a hit; a single miss triggers Hold. (Matches `progression-rule.md`.)
- **localStorage keys:** `workoutLog` (array of entries), plus a top-level `schemaVersion` value to gate migrations going forward, instead of inferring old-vs-new shape purely from `reps`'s type.
- **Migration:** on load, any existing entry whose `reps` is still a plain number gets wrapped into a single-element array (`8` → `[8]`); entries missing `timestamp` get one backfilled (from `id` if it's a `Date.now()` value, otherwise from migration run time). Old data is reinterpreted, never deleted or discarded. `schemaVersion` is bumped once migration completes.
- Suggestions are never stored — computed fresh from `workoutLog` and the hardcoded `targetReps`/`setCount` constants every time, per `progression-rule.md` line 18.

## 5. MVP feature list

1. Log a session (exercise, weight, per-set reps) — *done when a saved session appears in Workout History.*
2. Show suggested weight/target before logging — *done when an exercise with history displays the rule's computed suggestion prior to input.*
3. First-ever-session handling — *done when logging a new exercise prompts for a starting weight instead of a suggestion.*
4. Workout History list — *done when every saved session is visible in order without opening dev tools.*
5. Delete a session entry — *done when deleting a session removes it from both the displayed list and localStorage immediately.*
6. CSV export **[to rebuild]** — *done when export downloads a file reflecting the current `reps`-as-array shape, or shows an empty-state message with zero sessions.* (The earlier build exported a single `reps` number per row; needs updating for the array shape.)
7. Persistence — *done when closing/reopening the browser preserves all sessions, including through the reps/timestamp/schemaVersion migration above.*

## 6. Non-goals (v1)

- No accounts, multi-user, or cloud sync — one browser, one device.
- No editing a past session's data in place — delete only (see feature list #5), no edit-and-resave.
- No editing target reps or set count — both fixed in v1 as hardcoded constants (`targetReps = 8`, `setCount = 3`); per-exercise editability deferred to v2 (see data model).
- No charts, trends, or analytics beyond the plain list.
- No exercise-library management — exercise list stays fixed/hardcoded.

  v1 exercise list (hardcoded):
  Upper (+5 lb): Flat Bench, Lat Pulldown, Incline DB Bench, Single-arm DB Row, Chest Fly, BB Bicep Curls, Skull Crushers, Incline DB Curls, Tricep Pushdowns, DB Curls
  Bodyweight (no suggestion): Pull-ups, Tricep Dips

- No 2-session confirmation, deload, RPE, or auto-regulation — deferred per `progression-rule.md`'s own v2 list.
- No confetti/"Add Set" gamification counter — removed entirely for v1, not carried over from the earlier prototype.
- No 1-Rep-Max calculator in v1 — removed/hidden; not shipped, not tested for v1 (previously kept as an untested extra, now explicitly cut).
