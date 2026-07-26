const STORAGE_KEY = 'workoutLog';
const SCHEMA_VERSION_KEY = 'schemaVersion';
const CURRENT_SCHEMA_VERSION = 1;

function readRawEntries() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function writeRawEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getSchemaVersion() {
  const stored = localStorage.getItem(SCHEMA_VERSION_KEY);
  return stored ? Number(stored) : 0;
}

function setSchemaVersion(version) {
  localStorage.setItem(SCHEMA_VERSION_KEY, String(version));
}

function looksLikeTimestamp(value) {
  const YEAR_2020 = 1577836800000;
  const YEAR_2100 = 4102444800000;
  return typeof value === 'number' && value > YEAR_2020 && value < YEAR_2100;
}

function migrateEntry(rawEntry) {
  const migrated = Object.assign({}, rawEntry);

  if (!Array.isArray(migrated.reps)) {
    migrated.reps = [Number(migrated.reps)];
  }

  if (migrated.timestamp === undefined) {
    migrated.timestamp = looksLikeTimestamp(migrated.id) ? migrated.id : Date.now();
  }

  return migrated;
}

function loadEntries() {
  let rawEntries;

  try {
    rawEntries = readRawEntries();
  } catch (error) {
    throw new Error('Unable to load saved workouts. Storage may be blocked or corrupted.');
  }

  if (getSchemaVersion() < CURRENT_SCHEMA_VERSION) {
    const migratedEntries = rawEntries.map(migrateEntry);
    writeRawEntries(migratedEntries);
    setSchemaVersion(CURRENT_SCHEMA_VERSION);
    return migratedEntries;
  }

  return rawEntries;
}

function addEntry(newEntryData) {
  const entries = loadEntries();

  const entry = {
    id: crypto.randomUUID(),
    exercise: newEntryData.exercise,
    weight: newEntryData.weight,
    reps: newEntryData.reps,
    timestamp: Date.now()
  };

  entries.push(entry);
  writeRawEntries(entries);

  return entry;
}

function deleteEntry(id) {
  const entries = loadEntries();
  const filteredEntries = entries.filter(function (entry) {
    return entry.id !== id;
  });

  if (filteredEntries.length === entries.length) {
    return false;
  }

  writeRawEntries(filteredEntries);
  return true;
}

if (typeof module !== 'undefined') {
  module.exports = {
    loadEntries: loadEntries,
    addEntry: addEntry,
    deleteEntry: deleteEntry,
    getSchemaVersion: getSchemaVersion,
    migrateEntry: migrateEntry
  };
}
