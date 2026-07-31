# Known Issues — v2 Backlog

Bugs and limitations found during the Day 27 hardening pass, deliberately deferred rather than fixed for v1.

- **Post-delete list reflow can catch the wrong row on a fast second tap.** Deferred: the Yes/Cancel confirm step already stops any actual data loss from this; a full undo-after-delete is new v2 scope, not a v1 blocker.
- **Switching the exercise dropdown wipes in-progress reps/weight with no warning.** Deferred: it's a UX polish gap (no draft-preservation or confirmation prompt), not a correctness bug — nothing gets saved wrong, input is just lost.
- **Save button sits close to the bottom tab bar in the advance/hold state, raising mis-tap risk.** Deferred: a layout/spacing fix, not a functional bug.
- **Bodyweight ↔ `'bodyweight'`-sentinel pairing is only enforced at Save time, not structurally.** Deferred: only matters for manually tampered or corrupted data, which is out of scope for a single-user, single-device v1.
- **No undo after a confirmed delete.** Deferred: matches `spec.md`'s explicit non-goal (delete only, no edit-and-resave) — undo is new scope, not a hardening fix.
- **Deleting an older, non-last session shows no suggestion change**, which may confuse users expecting one. Deferred: this is correct per the data model (only the last session affects suggestions) — the gap is user expectation/communication, not logic.

## Progression rule limitations

The v1 simplifications already named in `progression-rule.md` (no deload/stall handling, no RPE/auto-regulation, single-session advance trigger instead of 2-consecutive-session confirmation, flat +5 lb increment regardless of exercise) belong to this same v2 backlog. See that doc for the full reasoning — not restated here.
