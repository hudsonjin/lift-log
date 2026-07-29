function createFakeLocalStorage() {
  let store = {};
  return {
    getItem: function (key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem: function (key, value) {
      store[key] = String(value);
    },
    removeItem: function (key) {
      delete store[key];
    }
  };
}

global.localStorage = createFakeLocalStorage();

const storage = require('./storage.js');
global.loadEntries = storage.loadEntries;
global.addEntry = storage.addEntry;

const {
  getSuggestion,
  getLastSession,
  allSetsHitTarget,
  isBodyweightExercise,
  TARGET_REPS,
  SET_COUNT
} = require('./suggestion.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error('FAILED: ' + message);
  }
}

function assertDeepEqual(actual, expected, message) {
  const actualText = JSON.stringify(actual);
  const expectedText = JSON.stringify(expected);
  assert(actualText === expectedText, message + ' (expected ' + expectedText + ', got ' + actualText + ')');
}

function resetStorage() {
  global.localStorage = createFakeLocalStorage();
}

// --- getLastSession: pure function, exhaustive cases ---

function test_getLastSession_returns_null_when_no_entries_match() {
  const entries = [{ exercise: 'Flat Bench', timestamp: 100 }];
  const result = getLastSession(entries, 'Lat Pulldown');
  assert(result === null, 'should return null when no entry matches the exercise');
  console.log('PASS: getLastSession returns null when nothing matches');
}

function test_getLastSession_returns_the_only_match() {
  const onlyEntry = { exercise: 'Flat Bench', timestamp: 100 };
  const result = getLastSession([onlyEntry], 'Flat Bench');
  assert(result === onlyEntry, 'should return the single matching entry');
  console.log('PASS: getLastSession returns the only matching entry');
}

function test_getLastSession_picks_latest_timestamp() {
  const older = { exercise: 'Flat Bench', timestamp: 100 };
  const newer = { exercise: 'Flat Bench', timestamp: 200 };
  const result = getLastSession([older, newer], 'Flat Bench');
  assert(result === newer, 'should pick the entry with the latest timestamp');
  console.log('PASS: getLastSession picks the entry with the latest timestamp');
}

function test_getLastSession_breaks_ties_by_insertion_order() {
  const first = { exercise: 'Flat Bench', timestamp: 100 };
  const second = { exercise: 'Flat Bench', timestamp: 100 };
  const result = getLastSession([first, second], 'Flat Bench');
  assert(result === second, 'on a tied timestamp, the later-inserted entry should win');
  console.log('PASS: getLastSession breaks timestamp ties by insertion order (later wins)');
}

// --- allSetsHitTarget: pure function, exhaustive cases ---

function test_allSetsHitTarget_true_when_exactly_at_target() {
  assert(allSetsHitTarget([8, 8, 8], 8) === true, 'reps exactly equal to target should count as a hit');
  console.log('PASS: allSetsHitTarget is true when every set is exactly at target');
}

function test_allSetsHitTarget_true_on_overshoot() {
  assert(allSetsHitTarget([10, 10, 10], 8) === true, 'reps above target should still count as a hit');
  console.log('PASS: allSetsHitTarget is true when every set overshoots target');
}

function test_allSetsHitTarget_false_when_one_set_misses() {
  assert(allSetsHitTarget([8, 8, 6], 8) === false, 'a single set below target should fail the whole entry');
  console.log('PASS: allSetsHitTarget is false when even one set misses target');
}

function test_allSetsHitTarget_false_at_one_under_target() {
  assert(allSetsHitTarget([7, 8, 8], 8) === false, 'one rep short of target should not count as a hit');
  console.log('PASS: allSetsHitTarget is false right at the boundary (one under target)');
}

// --- isBodyweightExercise ---

function test_isBodyweightExercise_true_for_both_bodyweight_names() {
  assert(isBodyweightExercise('Pull-ups') === true, 'Pull-ups should be tagged bodyweight');
  assert(isBodyweightExercise('Tricep Dips') === true, 'Tricep Dips should be tagged bodyweight');
  console.log('PASS: isBodyweightExercise is true for Pull-ups and Tricep Dips');
}

function test_isBodyweightExercise_false_for_a_normal_exercise() {
  assert(isBodyweightExercise('Flat Bench') === false, 'Flat Bench should not be tagged bodyweight');
  console.log('PASS: isBodyweightExercise is false for a non-bodyweight exercise');
}

// --- getSuggestion: the five eval-cases.md cases, seeded through real addEntry ---

function test_eval_case_1_advance_on_hit() {
  resetStorage();
  addEntry({ exercise: 'Flat Bench', weight: 135, reps: [8, 8, 8] });

  const result = getSuggestion('Flat Bench');
  assertDeepEqual(
    result,
    { type: 'advance', weight: 140, targetReps: TARGET_REPS, setCount: SET_COUNT },
    'eval case 1: Flat Bench 135, 8/8/8 should advance to 140'
  );
  console.log('PASS: eval case 1 — Flat Bench 135 lbs, 8/8/8 → advance to 140 lbs');
}

function test_eval_case_2_hold_on_miss() {
  resetStorage();
  addEntry({ exercise: 'Lat Pulldown', weight: 100, reps: [8, 8, 6] });

  const result = getSuggestion('Lat Pulldown');
  assertDeepEqual(
    result,
    { type: 'hold', weight: 100, targetReps: TARGET_REPS, setCount: SET_COUNT },
    'eval case 2: Lat Pulldown 100, 8/8/6 should hold at 100'
  );
  console.log('PASS: eval case 2 — Lat Pulldown 100 lbs, 8/8/6 → hold at 100 lbs');
}

function test_eval_case_3_first_ever_session() {
  resetStorage();

  const result = getSuggestion('Skull Crushers');
  assertDeepEqual(
    result,
    {
      type: 'first-ever',
      message: 'First time logging this exercise. Enter your starting weight below.',
      targetReps: TARGET_REPS,
      setCount: SET_COUNT
    },
    'eval case 3: Skull Crushers with no history should prompt for a starting weight'
  );
  console.log('PASS: eval case 3 — Skull Crushers, no history → first-ever-session prompt');
}

function test_eval_case_4_bodyweight_no_suggestion() {
  resetStorage();
  addEntry({ exercise: 'Pull-ups', weight: 'bodyweight', reps: [8, 8, 8] });

  const result = getSuggestion('Pull-ups');
  assertDeepEqual(
    result,
    {
      type: 'bodyweight',
      message: 'bodyweight — no suggestion made',
      targetReps: TARGET_REPS,
      setCount: SET_COUNT
    },
    'eval case 4: Pull-ups (bodyweight), 8/8/8 should never get a weight suggestion'
  );
  console.log('PASS: eval case 4 — Pull-ups (bodyweight), 8/8/8 → "bodyweight — no suggestion made"');
}

function test_eval_case_5_overshoot_ignored() {
  resetStorage();
  addEntry({ exercise: 'Incline DB Bench', weight: 135, reps: [10, 10, 10] });

  const result = getSuggestion('Incline DB Bench');
  assertDeepEqual(
    result,
    { type: 'advance', weight: 140, targetReps: TARGET_REPS, setCount: SET_COUNT },
    'eval case 5: overshooting reps (10/10/10) should advance the same +5 as an exact hit, no bonus'
  );
  console.log('PASS: eval case 5 — overshoot (10/10/10) at 135 → advance to 140, extra reps ignored');
}

test_getLastSession_returns_null_when_no_entries_match();
test_getLastSession_returns_the_only_match();
test_getLastSession_picks_latest_timestamp();
test_getLastSession_breaks_ties_by_insertion_order();

test_allSetsHitTarget_true_when_exactly_at_target();
test_allSetsHitTarget_true_on_overshoot();
test_allSetsHitTarget_false_when_one_set_misses();
test_allSetsHitTarget_false_at_one_under_target();

test_isBodyweightExercise_true_for_both_bodyweight_names();
test_isBodyweightExercise_false_for_a_normal_exercise();

test_eval_case_1_advance_on_hit();
test_eval_case_2_hold_on_miss();
test_eval_case_3_first_ever_session();
test_eval_case_4_bodyweight_no_suggestion();
test_eval_case_5_overshoot_ignored();

console.log('All tests passed!');
