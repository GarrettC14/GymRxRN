import { create } from 'zustand';
import { WeightType } from '../types/enums';

// Represents the live state of an exercise being performed
interface LiveExerciseState {
  exerciseInstanceId: string;
  repsPerSet: number[];
  weightsPerSet: number[];
  note: string;
}

interface WorkoutState {
  // Live workout session state
  liveExercises: Map<string, LiveExerciseState>;

  // Actions for managing live exercise state
  initLiveExercise: (
    exerciseInstanceId: string,
    initialReps: number[],
    initialWeights: number[]
  ) => void;
  updateSetReps: (exerciseInstanceId: string, setIndex: number, reps: number) => void;
  updateSetWeight: (exerciseInstanceId: string, setIndex: number, weight: number) => void;
  addSet: (exerciseInstanceId: string) => void;
  removeSet: (exerciseInstanceId: string, setIndex: number) => void;
  updateNote: (exerciseInstanceId: string, note: string) => void;
  getLiveExercise: (exerciseInstanceId: string) => LiveExerciseState | undefined;
  clearLiveWorkout: () => void;

  // Default weight type preference
  preferredWeightType: WeightType;
  setPreferredWeightType: (type: WeightType) => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  liveExercises: new Map(),

  initLiveExercise: (exerciseInstanceId, initialReps, initialWeights) => {
    set((state) => {
      const newMap = new Map(state.liveExercises);
      newMap.set(exerciseInstanceId, {
        exerciseInstanceId,
        repsPerSet: [...initialReps],
        weightsPerSet: [...initialWeights],
        note: '',
      });
      return { liveExercises: newMap };
    });
  },

  updateSetReps: (exerciseInstanceId, setIndex, reps) => {
    set((state) => {
      const newMap = new Map(state.liveExercises);
      const exercise = newMap.get(exerciseInstanceId);
      if (exercise) {
        const newReps = [...exercise.repsPerSet];
        newReps[setIndex] = reps;
        newMap.set(exerciseInstanceId, { ...exercise, repsPerSet: newReps });
      }
      return { liveExercises: newMap };
    });
  },

  updateSetWeight: (exerciseInstanceId, setIndex, weight) => {
    set((state) => {
      const newMap = new Map(state.liveExercises);
      const exercise = newMap.get(exerciseInstanceId);
      if (exercise) {
        const newWeights = [...exercise.weightsPerSet];
        newWeights[setIndex] = weight;
        newMap.set(exerciseInstanceId, { ...exercise, weightsPerSet: newWeights });
      }
      return { liveExercises: newMap };
    });
  },

  addSet: (exerciseInstanceId) => {
    set((state) => {
      const newMap = new Map(state.liveExercises);
      const exercise = newMap.get(exerciseInstanceId);
      if (exercise) {
        newMap.set(exerciseInstanceId, {
          ...exercise,
          repsPerSet: [...exercise.repsPerSet, 0],
          weightsPerSet: [...exercise.weightsPerSet, 0],
        });
      }
      return { liveExercises: newMap };
    });
  },

  removeSet: (exerciseInstanceId, setIndex) => {
    set((state) => {
      const newMap = new Map(state.liveExercises);
      const exercise = newMap.get(exerciseInstanceId);
      if (exercise && exercise.repsPerSet.length > 1) {
        const newReps = exercise.repsPerSet.filter((_, i) => i !== setIndex);
        const newWeights = exercise.weightsPerSet.filter((_, i) => i !== setIndex);
        newMap.set(exerciseInstanceId, {
          ...exercise,
          repsPerSet: newReps,
          weightsPerSet: newWeights,
        });
      }
      return { liveExercises: newMap };
    });
  },

  updateNote: (exerciseInstanceId, note) => {
    set((state) => {
      const newMap = new Map(state.liveExercises);
      const exercise = newMap.get(exerciseInstanceId);
      if (exercise) {
        newMap.set(exerciseInstanceId, { ...exercise, note });
      }
      return { liveExercises: newMap };
    });
  },

  getLiveExercise: (exerciseInstanceId) => {
    return get().liveExercises.get(exerciseInstanceId);
  },

  clearLiveWorkout: () => {
    set({ liveExercises: new Map() });
  },

  preferredWeightType: WeightType.Lbs,
  setPreferredWeightType: (type) => set({ preferredWeightType: type }),
}));
