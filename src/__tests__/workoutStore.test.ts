import { useWorkoutStore } from '../stores/workoutStore';
import { WeightType } from '../types/enums';

describe('WorkoutStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useWorkoutStore.setState({
      liveExercises: new Map(),
      preferredWeightType: WeightType.Lbs,
    });
  });

  describe('Live Exercise State', () => {
    describe('initLiveExercise', () => {
      it('initializes a live exercise with given data', () => {
        const { initLiveExercise, getLiveExercise } = useWorkoutStore.getState();

        initLiveExercise('exercise-1', [10, 10, 10], [135, 135, 135]);

        const exercise = getLiveExercise('exercise-1');
        expect(exercise).toBeDefined();
        expect(exercise?.repsPerSet).toEqual([10, 10, 10]);
        expect(exercise?.weightsPerSet).toEqual([135, 135, 135]);
        expect(exercise?.note).toBe('');
      });

      it('initializes multiple exercises independently', () => {
        const { initLiveExercise, getLiveExercise } = useWorkoutStore.getState();

        initLiveExercise('exercise-1', [10], [135]);
        initLiveExercise('exercise-2', [8], [155]);

        const ex1 = getLiveExercise('exercise-1');
        const ex2 = getLiveExercise('exercise-2');

        expect(ex1?.weightsPerSet).toEqual([135]);
        expect(ex2?.weightsPerSet).toEqual([155]);
      });

      it('overwrites existing exercise with same id', () => {
        const { initLiveExercise, getLiveExercise } = useWorkoutStore.getState();

        initLiveExercise('exercise-1', [10], [135]);
        initLiveExercise('exercise-1', [5], [200]);

        const exercise = getLiveExercise('exercise-1');
        expect(exercise?.repsPerSet).toEqual([5]);
        expect(exercise?.weightsPerSet).toEqual([200]);
      });
    });

    describe('updateSetReps', () => {
      it('updates reps for a specific set', () => {
        const { initLiveExercise, updateSetReps, getLiveExercise } = useWorkoutStore.getState();

        initLiveExercise('exercise-1', [10, 10, 10], [135, 135, 135]);
        updateSetReps('exercise-1', 1, 12);

        const exercise = getLiveExercise('exercise-1');
        expect(exercise?.repsPerSet).toEqual([10, 12, 10]);
      });

      it('does nothing for non-existent exercise', () => {
        const { updateSetReps, getLiveExercise } = useWorkoutStore.getState();

        updateSetReps('non-existent', 0, 10);

        const exercise = getLiveExercise('non-existent');
        expect(exercise).toBeUndefined();
      });
    });

    describe('updateSetWeight', () => {
      it('updates weight for a specific set', () => {
        const { initLiveExercise, updateSetWeight, getLiveExercise } = useWorkoutStore.getState();

        initLiveExercise('exercise-1', [10, 10, 10], [135, 135, 135]);
        updateSetWeight('exercise-1', 2, 150);

        const exercise = getLiveExercise('exercise-1');
        expect(exercise?.weightsPerSet).toEqual([135, 135, 150]);
      });

      it('does nothing for non-existent exercise', () => {
        const { updateSetWeight, getLiveExercise } = useWorkoutStore.getState();

        updateSetWeight('non-existent', 0, 100);

        const exercise = getLiveExercise('non-existent');
        expect(exercise).toBeUndefined();
      });
    });

    describe('addSet', () => {
      it('adds a new set with zeros', () => {
        const { initLiveExercise, addSet, getLiveExercise } = useWorkoutStore.getState();

        initLiveExercise('exercise-1', [10, 10], [135, 135]);
        addSet('exercise-1');

        const exercise = getLiveExercise('exercise-1');
        expect(exercise?.repsPerSet).toHaveLength(3);
        expect(exercise?.weightsPerSet).toHaveLength(3);
        expect(exercise?.repsPerSet[2]).toBe(0);
        expect(exercise?.weightsPerSet[2]).toBe(0);
      });

      it('does nothing for non-existent exercise', () => {
        const { addSet, liveExercises } = useWorkoutStore.getState();

        addSet('non-existent');

        expect(liveExercises.size).toBe(0);
      });
    });

    describe('removeSet', () => {
      it('removes a set at specified index', () => {
        const { initLiveExercise, removeSet, getLiveExercise } = useWorkoutStore.getState();

        initLiveExercise('exercise-1', [10, 12, 8], [135, 140, 145]);
        removeSet('exercise-1', 1);

        const exercise = getLiveExercise('exercise-1');
        expect(exercise?.repsPerSet).toEqual([10, 8]);
        expect(exercise?.weightsPerSet).toEqual([135, 145]);
      });

      it('does not remove last remaining set', () => {
        const { initLiveExercise, removeSet, getLiveExercise } = useWorkoutStore.getState();

        initLiveExercise('exercise-1', [10], [135]);
        removeSet('exercise-1', 0);

        const exercise = getLiveExercise('exercise-1');
        expect(exercise?.repsPerSet).toHaveLength(1);
      });

      it('does nothing for non-existent exercise', () => {
        const { removeSet, liveExercises } = useWorkoutStore.getState();

        removeSet('non-existent', 0);

        expect(liveExercises.size).toBe(0);
      });
    });

    describe('updateNote', () => {
      it('updates note for an exercise', () => {
        const { initLiveExercise, updateNote, getLiveExercise } = useWorkoutStore.getState();

        initLiveExercise('exercise-1', [10], [135]);
        updateNote('exercise-1', 'Felt strong today');

        const exercise = getLiveExercise('exercise-1');
        expect(exercise?.note).toBe('Felt strong today');
      });

      it('can clear note with empty string', () => {
        const { initLiveExercise, updateNote, getLiveExercise } = useWorkoutStore.getState();

        initLiveExercise('exercise-1', [10], [135]);
        updateNote('exercise-1', 'Some note');
        updateNote('exercise-1', '');

        const exercise = getLiveExercise('exercise-1');
        expect(exercise?.note).toBe('');
      });
    });

    describe('clearLiveWorkout', () => {
      it('clears all live exercises', () => {
        const { initLiveExercise, clearLiveWorkout } = useWorkoutStore.getState();

        initLiveExercise('exercise-1', [10], [135]);
        initLiveExercise('exercise-2', [8], [155]);

        clearLiveWorkout();

        const { liveExercises } = useWorkoutStore.getState();
        expect(liveExercises.size).toBe(0);
      });
    });
  });

  describe('Weight Type Preference', () => {
    describe('preferredWeightType', () => {
      it('defaults to Lbs', () => {
        const { preferredWeightType } = useWorkoutStore.getState();
        expect(preferredWeightType).toBe(WeightType.Lbs);
      });
    });

    describe('setPreferredWeightType', () => {
      it('updates preferred weight type', () => {
        const { setPreferredWeightType } = useWorkoutStore.getState();

        setPreferredWeightType(WeightType.Kg);

        const { preferredWeightType } = useWorkoutStore.getState();
        expect(preferredWeightType).toBe(WeightType.Kg);
      });

      it('can switch between types', () => {
        const { setPreferredWeightType } = useWorkoutStore.getState();

        setPreferredWeightType(WeightType.Kg);
        setPreferredWeightType(WeightType.Lbs);

        const { preferredWeightType } = useWorkoutStore.getState();
        expect(preferredWeightType).toBe(WeightType.Lbs);
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('simulates a complete workout session', () => {
      const store = useWorkoutStore.getState();

      // Initialize exercises
      store.initLiveExercise('bench-press', [10, 10, 10], [135, 135, 135]);
      store.initLiveExercise('overhead-press', [8, 8, 8], [95, 95, 95]);

      // Update some values during workout
      store.updateSetWeight('bench-press', 0, 140);
      store.updateSetReps('bench-press', 0, 8);
      store.updateSetWeight('bench-press', 1, 145);
      store.updateSetReps('bench-press', 1, 6);

      // Add a set
      store.addSet('bench-press');
      store.updateSetWeight('bench-press', 3, 135);
      store.updateSetReps('bench-press', 3, 10);

      // Add notes
      store.updateNote('bench-press', 'PR on second set!');

      // Verify final state
      const benchPress = store.getLiveExercise('bench-press');
      expect(benchPress?.repsPerSet).toEqual([8, 6, 10, 10]);
      expect(benchPress?.weightsPerSet).toEqual([140, 145, 135, 135]);
      expect(benchPress?.note).toBe('PR on second set!');

      // Clear after workout
      store.clearLiveWorkout();
      expect(store.getLiveExercise('bench-press')).toBeUndefined();
    });
  });
});
