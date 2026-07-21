# Lift Log v1 — Week 4 Build Plan

Ordered, dependency-respecting build order for v1, based on the frozen spec (`spec.md`, `progression-rule.md`, `wireframes.md`, `eval-cases.md`). Planning only — no code in this doc.

## Build order

**1. Persistence + migration layer**
One single function/module that all localStorage reads and writes go through. Migrates `reps` single-number → array once on load, stamps `schemaVersion`, backfills `timestamp`. Tested in isolation before any UI touches storage.
- *Depends on:* frozen data model (`spec.md` §4).
- *Done when:* old data loads correctly in the new shape, and every storage access in the app routes through this one layer — no stray `localStorage.getItem`/`setItem` calls anywhere else.

**2. Log / Save (write path) — nav shell built alongside**
The Log a Workout screen writes entries in final shape (`id`, `exercise`, `weight`, `reps` array, `timestamp`) through the persistence layer, including the bodyweight sentinel path and the first-ever-session starting-weight path. The bottom tab bar (App Shell, per `wireframes.md`) gets built here too, since every screen from this point needs it.
- *Depends on:* 1.
- *Done when:* a saved entry lands in storage correctly and survives a refresh; the tab bar switches between screens, even if History/Export are still placeholders.

**3. Workout History + delete**
List from stored data, newest-first by `timestamp`, per-row delete with the confirm step from the wireframe.
- *Depends on:* 1, 2.
- *Done when:* sessions display in order, and delete removes exactly one entry after confirmation — checked by refreshing afterward, not just watching it vanish from the page.

**4. Suggestion engine**
Computes the next suggestion live from the last logged entry per `progression-rule.md`: advance/hold, +5 upper-body increment, `reps >= target` predicate across the full rep array, bodyweight → no suggestion, first-ever → prompt for starting weight. Validated against `eval-cases.md`.
- *Depends on:* 1, 2, and real logged data to test against.
- *Done when:* all five `eval-cases.md` cases produce their exact expected output.

**5. CSV export rebuild**
Update for the `reps`-array shape so it doesn't break on arrays; keep the existing empty-state message.
- *Depends on:* 1.
- *Done when:* exported CSV opens cleanly with array reps represented correctly, and the zero-session case still shows the message.

## Day-by-day (Days 22–27, with slack)

- **Day 22 — Step 1 only.** The foundation everything else depends on; nothing else safely starts until it's tested in isolation.
- **Day 23 — Step 2 begins** (write path + nav shell). First day two things are being built at once, so it's the most likely single day to run long.
- **Day 24 — Reserved slack for Step 2.** If Step 2 finishes on Day 23, this day starts Step 3 early instead of sitting idle.
- **Day 25 — Step 3.** Workout History + delete.
- **Day 26 — Step 4 begins.** Suggestion engine — the highest-risk step, since "all five eval cases pass exactly" is a hard bar, not a "looks right" check.
- **Day 27 — Step 4 finishes, Step 5 if time allows.** CSV export is small and low-risk, so it's the deliberate flex item: if Step 4 overruns, Step 5 is what slips, not the suggestion engine.

**Where the slack actually lives:** Day 24 is explicit overflow capacity, and Step 5 is the first thing cut if Step 4 needs more than one day — the likeliest failure point in this plan, since it's the only step gated on an exact-match test.
