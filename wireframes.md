# Lift Log v1 — Wireframes

Text sketches only. Covers the three screens from `spec.md`, plus the app shell that ties them together.

## App Shell / Navigation

```
+--------------------------------+
|                                 |
|                                 |
|        (current screen)        |
|                                 |
|                                 |
+--------------------------------+
| [ Log ]   [ History ]  [Export]|
+--------------------------------+
```
App opens directly to **Log a Workout** (the landing screen — matches the "standing at the gym" use case). A persistent bottom tab bar with three buttons lets you jump to any screen with one thumb; no menus, no nested navigation.

## Screen 1: Log a Workout

**Normal state** (exercise has prior history):
```
Log a Workout
--------------------------------
Exercise: ( Flat Bench v )

Suggested: 140 lbs x 8 reps x 3 sets
(hit all sets last time -> +5 lbs)

Weight used: [ 140 ]

Set 1 Reps: [   ]
Set 2 Reps: [   ]
Set 3 Reps: [   ]

[ Save Session ]
```
If last session missed reps instead, that second line reads `(missed reps last time -> same weight)` — same position, same format, just the other branch of the rule.

**First-ever-session state** (no history for the picked exercise):
```
Log a Workout
--------------------------------
Exercise: ( Skull Crushers v )

First time logging this exercise.
Enter your starting weight below.

Starting Weight: [   ]

Set 1 Reps: [   ]   (target: 8)
Set 2 Reps: [   ]   (target: 8)
Set 3 Reps: [   ]   (target: 8)

[ Save Session ]
```

**Empty state:** folded into the first-ever-session state above — the moment you pick an exercise with zero history, it *is* that state. No separate wireframe.

## Screen 2: Workout History

**Normal state:**
```
Workout History
--------------------------------
Flat Bench — 140 lbs — Reps: 8, 8, 7 — Jul 16, 2026     [ Delete ]
Lat Pulldown — 100 lbs — Reps: 8, 8, 8 — Jul 16, 2026    [ Delete ]
Pull-ups — bodyweight — Reps: 8, 6, 5 — Jul 15, 2026     [ Delete ]
```
(newest session first)

**Delete confirmation state** (after tapping [ Delete ] on a row):
```
Workout History
--------------------------------
Flat Bench — 140 lbs — Reps: 8, 8, 7 — Jul 16, 2026

  Delete this session?
  [ Yes ]   [ Cancel ]

Lat Pulldown — 100 lbs — Reps: 8, 8, 8 — Jul 16, 2026    [ Delete ]
Pull-ups — bodyweight — Reps: 8, 6, 5 — Jul 15, 2026     [ Delete ]
```
Nothing is removed until [ Yes ] is tapped; [ Cancel ] returns to the normal row.

**Empty state:**
```
Workout History
--------------------------------
No workouts logged yet.
```

**First-ever-session case:** not distinct — the first logged session is just the lone row in an otherwise-empty list.

## Screen 3: Export

**Normal state (has data):**
```
Export
--------------------------------
[ Export as CSV ]
```

**Empty state (no sessions logged):**
```
Export
--------------------------------
[ Export as CSV ]

No workouts logged yet — nothing to export.
```

**First-ever-session case:** not applicable — Export acts on the whole history at once, not on a single exercise's session state.
