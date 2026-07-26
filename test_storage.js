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

const { loadEntries, addEntry, deleteEntry, getSchemaVersion, migrateEntry } = require('./storage.js');

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

// --- migrateEntry: pure function, exhaustive cases ---

function test_migrateEntry_wraps_number_reps() {
  const result = migrateEntry({ id: 1721000000000, exercise: 'Bench', weight: 135, reps: 8 });
  assertDeepEqual(result.reps, [8], 'numeric reps should be wrapped into an array');
  console.log('PASS: migrateEntry wraps a plain number reps into a single-element array');
}

function test_migrateEntry_wraps_and_converts_string_reps_to_number() {
  // This is the real legacy shape: the old app read reps straight from an <input>'s
  // .value, which is always a string, and stored it as-is without converting it.
  const result = migrateEntry({ id: 1721000000000, exercise: 'Bench', weight: '135', reps: '12' });
  assertDeepEqual(result.reps, [12], 'string reps should be wrapped and converted to a number');
  assert(typeof result.reps[0] === 'number', 'wrapped reps must be a real number, not a numeric string');
  console.log('PASS: migrateEntry wraps string reps ("12") into [12] as a real number');
}

function test_migrateEntry_leaves_array_reps_alone() {
  const result = migrateEntry({ id: 'abc', exercise: 'Bench', weight: 135, reps: [8, 8, 7], timestamp: 123 });
  assertDeepEqual(result.reps, [8, 8, 7], 'array reps should be left unchanged');
  console.log('PASS: migrateEntry leaves already-array reps untouched');
}

function test_migrateEntry_backfills_timestamp_from_timestamp_like_id() {
  const timestampLikeId = 1721000000000;
  const result = migrateEntry({ id: timestampLikeId, exercise: 'Bench', weight: 135, reps: 8 });
  assert(result.timestamp === timestampLikeId, 'timestamp should be backfilled from a Date.now()-shaped id');
  console.log('PASS: migrateEntry backfills timestamp from a Date.now()-shaped id');
}

function test_migrateEntry_backfills_timestamp_from_now_when_id_is_not_timestamp_shaped() {
  const before = Date.now();
  const result = migrateEntry({ id: 'some-uuid-string', exercise: 'Bench', weight: 135, reps: 8 });
  const after = Date.now();
  assert(
    result.timestamp >= before && result.timestamp <= after,
    'timestamp should fall back to the current time when id is not a plausible timestamp'
  );
  console.log('PASS: migrateEntry backfills timestamp from current time when id is not timestamp-shaped');
}

function test_migrateEntry_leaves_existing_timestamp_alone() {
  const result = migrateEntry({ id: 'abc', exercise: 'Bench', weight: 135, reps: [8], timestamp: 555 });
  assert(result.timestamp === 555, 'an existing timestamp should never be overwritten');
  console.log('PASS: migrateEntry does not overwrite an existing timestamp');
}

function test_migrateEntry_fixes_both_reps_and_timestamp_together() {
  const timestampLikeId = 1721000000000;
  const result = migrateEntry({ id: timestampLikeId, exercise: 'Bench', weight: 135, reps: 5 });
  assertDeepEqual(result.reps, [5], 'reps should be wrapped');
  assert(result.timestamp === timestampLikeId, 'timestamp should be backfilled');
  console.log('PASS: migrateEntry fixes reps and timestamp together on the same entry');
}

function test_migrateEntry_is_idempotent_on_already_migrated_entries() {
  const alreadyMigrated = { id: 'abc', exercise: 'Bench', weight: 135, reps: [8, 8, 8], timestamp: 999 };
  const result = migrateEntry(alreadyMigrated);
  assertDeepEqual(result, alreadyMigrated, 'a fully migrated entry should pass through unchanged');
  console.log('PASS: migrateEntry is a no-op on an already-migrated entry');
}

// --- full load/add/delete cycle, using the fake localStorage swap ---

function test_loadEntries_on_empty_storage_returns_empty_array() {
  global.localStorage = createFakeLocalStorage();
  const entries = loadEntries();
  assertDeepEqual(entries, [], 'loadEntries on brand-new storage should return an empty array');
  assert(getSchemaVersion() === 1, 'schemaVersion should be stamped even on an empty first load');
  console.log('PASS: loadEntries on empty storage returns [] and stamps schemaVersion');
}

function test_addEntry_then_loadEntries_round_trip() {
  global.localStorage = createFakeLocalStorage();

  const saved = addEntry({ exercise: 'Flat Bench', weight: 140, reps: [8, 8, 7] });

  assert(typeof saved.id === 'string' && saved.id.length > 0, 'addEntry should generate a non-empty id');
  assert(typeof saved.timestamp === 'number', 'addEntry should generate a numeric timestamp');

  const entries = loadEntries();
  assert(entries.length === 1, 'loadEntries should return exactly the one entry that was added');
  assertDeepEqual(entries[0], saved, 'the loaded entry should exactly match what addEntry returned');

  console.log('PASS: addEntry then loadEntries round-trips a single entry correctly');
}

function test_addEntry_twice_preserves_both_in_order() {
  global.localStorage = createFakeLocalStorage();

  const first = addEntry({ exercise: 'Flat Bench', weight: 140, reps: [8, 8, 7] });
  const second = addEntry({ exercise: 'Lat Pulldown', weight: 100, reps: [8, 8, 8] });

  const entries = loadEntries();
  assert(entries.length === 2, 'both entries should be present');
  assert(entries[0].id === first.id, 'first entry should stay first');
  assert(entries[1].id === second.id, 'second entry should stay second');

  console.log('PASS: adding two entries preserves both, in insertion order');
}

function test_deleteEntry_removes_only_the_matching_entry() {
  global.localStorage = createFakeLocalStorage();

  const first = addEntry({ exercise: 'Flat Bench', weight: 140, reps: [8, 8, 7] });
  const second = addEntry({ exercise: 'Lat Pulldown', weight: 100, reps: [8, 8, 8] });

  const result = deleteEntry(first.id);
  const remaining = loadEntries();

  assert(result === true, 'deleteEntry should return true when it removes something');
  assert(remaining.length === 1, 'exactly one entry should remain');
  assert(remaining[0].id === second.id, 'the remaining entry should be the one that was not deleted');

  console.log('PASS: deleteEntry removes only the matching entry, leaves the other intact');
}

function test_deleteEntry_with_unknown_id_returns_false_and_changes_nothing() {
  global.localStorage = createFakeLocalStorage();

  addEntry({ exercise: 'Flat Bench', weight: 140, reps: [8, 8, 7] });

  const result = deleteEntry('this-id-does-not-exist');
  const remaining = loadEntries();

  assert(result === false, 'deleteEntry should return false when nothing matches');
  assert(remaining.length === 1, 'storage should be unchanged when nothing was deleted');

  console.log('PASS: deleteEntry with an unknown id returns false and leaves storage untouched');
}

function test_loadEntries_migrates_old_shape_data_on_first_load() {
  global.localStorage = createFakeLocalStorage();

  const oldEntry = { id: 1721000000000, exercise: 'Flat Bench', weight: '135', reps: '8' };
  global.localStorage.setItem('workoutLog', JSON.stringify([oldEntry]));

  const migrated = loadEntries();

  assertDeepEqual(migrated[0].reps, [8], 'old string reps should be migrated to a numeric array');
  assert(typeof migrated[0].reps[0] === 'number', 'migrated reps must be real numbers, not strings');
  assert(migrated[0].timestamp === 1721000000000, 'timestamp should be backfilled from the old Date.now()-style id');
  assert(getSchemaVersion() === 1, 'schemaVersion should be bumped after migration runs');

  const secondLoad = loadEntries();
  assertDeepEqual(secondLoad, migrated, 'loading again after migration should return the same already-migrated data');

  console.log('PASS: loadEntries migrates old numeric-reps data and stamps schemaVersion on first load');
}

function test_loadEntries_throws_on_corrupted_storage() {
  global.localStorage = createFakeLocalStorage();
  global.localStorage.setItem('workoutLog', 'this is not valid json{{{');

  let threw = false;
  try {
    loadEntries();
  } catch (error) {
    threw = true;
  }

  assert(threw, 'loadEntries should throw when stored data is corrupted, not fail silently');
  console.log('PASS: loadEntries throws on corrupted storage instead of failing silently');
}

test_migrateEntry_wraps_number_reps();
test_migrateEntry_wraps_and_converts_string_reps_to_number();
test_migrateEntry_leaves_array_reps_alone();
test_migrateEntry_backfills_timestamp_from_timestamp_like_id();
test_migrateEntry_backfills_timestamp_from_now_when_id_is_not_timestamp_shaped();
test_migrateEntry_leaves_existing_timestamp_alone();
test_migrateEntry_fixes_both_reps_and_timestamp_together();
test_migrateEntry_is_idempotent_on_already_migrated_entries();

test_loadEntries_on_empty_storage_returns_empty_array();
test_addEntry_then_loadEntries_round_trip();
test_addEntry_twice_preserves_both_in_order();
test_deleteEntry_removes_only_the_matching_entry();
test_deleteEntry_with_unknown_id_returns_false_and_changes_nothing();
test_loadEntries_migrates_old_shape_data_on_first_load();
test_loadEntries_throws_on_corrupted_storage();

console.log('All tests passed!');
