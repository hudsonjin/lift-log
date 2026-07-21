The rule

Per exercise, store a target weight, a target reps number (default 8 for every exercise — the bottom of the ACSM 8–12 zone, so there's headroom and 3×8 is an achievable advance bar — stored per-exercise and user-editable), and a set count (3). 


Advance: If all 3 sets hit target reps this session → next session, add weight. (Reps ≥ target counts as a hit; overshoot has no additional effect in v1.)

Lower-body lifts (squat, deadlift, hip hinge, leg press): +10 lb
Upper-body lifts (press, row, curl, etc.): +5 lb

v1 exercise list contains no lower-body lifts; the +10 lb tier is retained but currently unused.



Hold: If any set fell short of target reps → repeat the same weight next session.


Bodyweight exercises: exercises tagged as bodyweight (per spec.md's exercise list) receive no weight suggestion — the rule outputs "bodyweight — no suggestion made." They are logged and tracked normally, but the rule never suggests adding load. Rep-based progression for bodyweight is explicitly deferred to v2.


That's it. One trigger, one increment per body region, one fallback. This is linear progression with a fixed rep-and-set target — not full double progression (see v1 simplifications).

Suggestions are always computed fresh from stored history, never cached.

Edge cases (v1 behavior)


First-ever session: On the first log of an exercise there's no history to evaluate, so the app prompts the user to enter a starting weight, applies the default target reps (8), makes no weight suggestion, and simply records the session; the rule first fires on session two.
Gap / layoff: Elapsed time is ignored — the rule reads only the last completed session's hit/miss, so after a two-week break it resumes at the last weight as if nothing happened (known limitation: no post-layoff deload in v1; a returning user just repeats or advances from where they left off).
Exercise swap: Explicitly deferred — v1 has no concept of swapping, so a substituted exercise is just a different record that runs its own first-ever-session logic and carries nothing over from the exercise it replaced.
Target-reps change: Editing the target reps or set count for an exercise applies going forward only; past sessions are not reinterpreted under the new target.
Session identity: Each logged workout entry for an exercise is its own session, full stop — two same-day logs of the same exercise count as two separate sessions for advance/hold purposes.


What's solid vs. a judgment call

Solid (well-supported):


A beginner will progress on nearly any honest progressive scheme. The "newbie gains" adaptation is well-established, so the structure mattering less than consistent effort is a safe bet. This rule's job is just to guarantee the load keeps climbing without me guessing.
Small increments beat large ones for sustaining progress. Broadly agreed coaching practice, and it costs nothing to follow.
Training in a moderate rep range at ~60–80% 1RM is a documented ACSM recommendation for novices, so the target-reps window sits in a sensible zone.


Judgment calls (defensible, not proven):


The exact numbers: +5 lb upper / +10 lb lower. These are coaching-convention defaults, not evidence-derived constants. The one concrete source I found was a cardiac-rehab table — right shape, wrong population — so I'm treating them as reasonable starting values to tune, not truth.
"All 3 sets at target in a single session" as the trigger. The textbook rule (NSCA 2-for-2) wants two consecutive sessions clearing the target before adding load. I'm using one session on purpose (see below).
Splitting increments by body region at all. Real, but coarse — a barbell OHP and a dumbbell curl are both "upper body" and don't really want the same jump. v2: make the increment a per-exercise editable field with region-based defaults, which is where this coarseness gets fixed.


What v1 keeps deliberately simple


No rep-range double progression. Real double progression climbs reps within a range (e.g. 8→12) before adding weight. v1 collapses that to a single target and adds weight directly. Simpler to build and reason about; the cost is slightly bigger, less granular jumps.
No 2-consecutive-session confirmation. Single-session trigger is easier to implement and to test. Risk: I add weight off one good day and stall. Acceptable for v1; the 2-session gate is the obvious v2 upgrade.
No deload / stall handling. If I miss the target several sessions running, v1 just keeps repeating the weight. No auto-deload, no fatigue logic. I'll add a "missed N times → drop 10%" branch later.
No RPE / reps-in-reserve, no auto-regulation, no microplate math. Pure hit/miss on a fixed target. Effort-based loading is more accurate but needs input I don't want to collect yet.


v1 principle: ship a rule that's fully defined and testable, with clear edge cases (missed session, exercise swap, first-ever session), before adding accuracy. Every simplification above is a named, deliberate tradeoff — not an oversight.