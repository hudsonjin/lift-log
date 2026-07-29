const TARGET_REPS = 8;
const SET_COUNT = 3;
const UPPER_BODY_INCREMENT = 5;
const BODYWEIGHT_EXERCISES = ['Pull-ups', 'Tricep Dips'];

function isBodyweightExercise(exercise) {
  return BODYWEIGHT_EXERCISES.includes(exercise);
}

function getLastSession(entries, exercise) {
  const matching = entries.filter(function (entry) {
    return entry.exercise === exercise;
  });

  if (matching.length === 0) {
    return null;
  }

  return matching.reduce(function (latest, entry) {
    return entry.timestamp >= latest.timestamp ? entry : latest;
  });
}

function allSetsHitTarget(repsArray, targetReps) {
  return repsArray.every(function (repCount) {
    return repCount >= targetReps;
  });
}

function getSuggestion(exercise) {
  if (isBodyweightExercise(exercise)) {
    return {
      type: 'bodyweight',
      message: 'bodyweight — no suggestion made',
      targetReps: TARGET_REPS,
      setCount: SET_COUNT
    };
  }

  const entries = loadEntries();
  const lastSession = getLastSession(entries, exercise);

  if (lastSession === null) {
    return {
      type: 'first-ever',
      message: 'First time logging this exercise. Enter your starting weight below.',
      targetReps: TARGET_REPS,
      setCount: SET_COUNT
    };
  }

  if (allSetsHitTarget(lastSession.reps, TARGET_REPS)) {
    return {
      type: 'advance',
      weight: lastSession.weight + UPPER_BODY_INCREMENT,
      targetReps: TARGET_REPS,
      setCount: SET_COUNT
    };
  }

  return {
    type: 'hold',
    weight: lastSession.weight,
    targetReps: TARGET_REPS,
    setCount: SET_COUNT
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    getSuggestion: getSuggestion,
    getLastSession: getLastSession,
    allSetsHitTarget: allSetsHitTarget,
    isBodyweightExercise: isBodyweightExercise,
    TARGET_REPS: TARGET_REPS,
    SET_COUNT: SET_COUNT,
    UPPER_BODY_INCREMENT: UPPER_BODY_INCREMENT
  };
}
