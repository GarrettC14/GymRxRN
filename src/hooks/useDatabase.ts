import { useEffect, useState, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '../database';
import ExerciseType from '../database/models/ExerciseType';
import WorkoutType from '../database/models/WorkoutType';
import WorkoutInstance from '../database/models/WorkoutInstance';
import ExerciseInstance from '../database/models/ExerciseInstance';
import { ExerciseCategory, BodyPart, WeightType } from '../types/enums';

// Hook to get all exercise types with optional search
export function useExerciseTypes(searchQuery: string = '') {
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collection = database.get<ExerciseType>('exercise_types');

    let query = collection.query(Q.sortBy('name', Q.asc));

    if (searchQuery.trim()) {
      query = collection.query(
        Q.where('name', Q.like(`%${Q.sanitizeLikeString(searchQuery)}%`)),
        Q.sortBy('name', Q.asc)
      );
    }

    const subscription = query.observe().subscribe((result) => {
      setExercises(result);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [searchQuery]);

  return { exercises, loading };
}

// Hook to get all workout types (templates)
export function useWorkoutTypes() {
  const [workouts, setWorkouts] = useState<WorkoutType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collection = database.get<WorkoutType>('workout_types');
    const subscription = collection
      .query(Q.sortBy('name', Q.asc))
      .observe()
      .subscribe((result) => {
        setWorkouts(result);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  return { workouts, loading };
}

// Hook to get all workout instances (completed workouts)
export function useWorkoutHistory() {
  const [workouts, setWorkouts] = useState<WorkoutInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collection = database.get<WorkoutInstance>('workout_instances');
    const subscription = collection
      .query(Q.sortBy('date', Q.desc))
      .observe()
      .subscribe((result) => {
        setWorkouts(result);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  return { workouts, loading };
}

// Hook to get exercises for a specific workout type
export function useWorkoutExercises(workoutTypeId: string | null) {
  const [exercises, setExercises] = useState<ExerciseInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workoutTypeId) {
      setExercises([]);
      setLoading(false);
      return;
    }

    const collection = database.get<ExerciseInstance>('exercise_instances');
    const subscription = collection
      .query(
        Q.where('workout_type_id', workoutTypeId),
        Q.sortBy('index_position', Q.asc)
      )
      .observe()
      .subscribe((result) => {
        setExercises(result);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [workoutTypeId]);

  return { exercises, loading };
}

// Hook to get all exercise instances for analytics (completed workouts)
export function useExerciseHistory(exerciseTypeId: string | null) {
  const [exercises, setExercises] = useState<ExerciseInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exerciseTypeId) {
      setExercises([]);
      setLoading(false);
      return;
    }

    const collection = database.get<ExerciseInstance>('exercise_instances');
    const subscription = collection
      .query(
        Q.where('exercise_type_id', exerciseTypeId),
        Q.where('workout_instance_id', Q.notEq(null)),
        Q.where('is_complete', true),
        Q.sortBy('date', Q.desc)
      )
      .observe()
      .subscribe((result) => {
        setExercises(result);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [exerciseTypeId]);

  return { exercises, loading };
}

// Hook to get exercises for a specific workout instance
export function useWorkoutInstanceExercises(workoutInstanceId: string | null) {
  const [exercises, setExercises] = useState<ExerciseInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workoutInstanceId) {
      setExercises([]);
      setLoading(false);
      return;
    }

    const collection = database.get<ExerciseInstance>('exercise_instances');
    const subscription = collection
      .query(
        Q.where('workout_instance_id', workoutInstanceId),
        Q.sortBy('index_position', Q.asc)
      )
      .observe()
      .subscribe((result) => {
        setExercises(result);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [workoutInstanceId]);

  return { exercises, loading };
}

// Database operations
export function useDatabaseOperations() {
  // Create a new workout type (template)
  const createWorkoutType = useCallback(
    async (name: string, summary: string = ''): Promise<WorkoutType> => {
      const collection = database.get<WorkoutType>('workout_types');
      const workout = await database.write(async () => {
        return await collection.create((workout) => {
          workout.name = name;
          workout.summary = summary;
          workout.active = false;
        });
      });
      return workout;
    },
    []
  );

  // Create a new workout instance (log a workout)
  const createWorkoutInstance = useCallback(
    async (
      name: string,
      summary: string = '',
      date: Date = new Date()
    ): Promise<WorkoutInstance> => {
      const collection = database.get<WorkoutInstance>('workout_instances');
      const workout = await database.write(async () => {
        return await collection.create((workout) => {
          workout.name = name;
          workout.summary = summary;
          workout.date = date;
        });
      });
      return workout;
    },
    []
  );

  // Add exercise to a workout type (template)
  const addExerciseToWorkoutType = useCallback(
    async (
      workoutTypeId: string,
      exerciseTypeId: string,
      indexPosition: number,
      defaults: {
        sets?: number;
        reps?: number;
        weight?: number;
        weightType?: WeightType;
        restPeriod?: number;
      } = {}
    ): Promise<ExerciseInstance> => {
      const collection = database.get<ExerciseInstance>('exercise_instances');
      const exercise = await database.write(async () => {
        return await collection.create((ex) => {
          ex.exerciseTypeId = exerciseTypeId;
          ex.workoutTypeId = workoutTypeId;
          ex.workoutInstanceId = null;
          ex.indexPosition = indexPosition;
          ex.sets = defaults.sets ?? 3;
          ex.reps = defaults.reps ?? 10;
          ex.weight = defaults.weight ?? 0;
          ex.weightType = defaults.weightType ?? WeightType.Lbs;
          ex.warmUpSets = 0;
          ex.targetSets = defaults.sets ?? 3;
          ex.restPeriod = defaults.restPeriod ?? 90;
          ex.repsInReserve = 2;
          ex.repsPerSet = [];
          ex.weightsPerSet = [];
          ex.note = '';
          ex.isComplete = false;
          ex.date = new Date();
        });
      });
      return exercise;
    },
    []
  );

  // Add exercise to a workout instance (log)
  const addExerciseToWorkoutInstance = useCallback(
    async (
      workoutInstanceId: string,
      exerciseTypeId: string,
      indexPosition: number,
      data: {
        sets?: number;
        reps?: number;
        weight?: number;
        weightType?: WeightType;
        repsPerSet?: number[];
        weightsPerSet?: number[];
        note?: string;
      } = {}
    ): Promise<ExerciseInstance> => {
      const collection = database.get<ExerciseInstance>('exercise_instances');
      const exercise = await database.write(async () => {
        return await collection.create((ex) => {
          ex.exerciseTypeId = exerciseTypeId;
          ex.workoutTypeId = null;
          ex.workoutInstanceId = workoutInstanceId;
          ex.indexPosition = indexPosition;
          ex.sets = data.sets ?? 3;
          ex.reps = data.reps ?? 10;
          ex.weight = data.weight ?? 0;
          ex.weightType = data.weightType ?? WeightType.Lbs;
          ex.warmUpSets = 0;
          ex.targetSets = data.sets ?? 3;
          ex.restPeriod = 90;
          ex.repsInReserve = 2;
          ex.repsPerSet = data.repsPerSet ?? [];
          ex.weightsPerSet = data.weightsPerSet ?? [];
          ex.note = data.note ?? '';
          ex.isComplete = true;
          ex.date = new Date();
        });
      });
      return exercise;
    },
    []
  );

  // Update an exercise instance
  const updateExerciseInstance = useCallback(
    async (
      exerciseId: string,
      data: {
        sets?: number;
        reps?: number;
        weight?: number;
        repsPerSet?: number[];
        weightsPerSet?: number[];
        note?: string;
        isComplete?: boolean;
      }
    ): Promise<void> => {
      const collection = database.get<ExerciseInstance>('exercise_instances');
      const exercise = await collection.find(exerciseId);
      await database.write(async () => {
        await exercise.update((ex) => {
          if (data.sets !== undefined) ex.sets = data.sets;
          if (data.reps !== undefined) ex.reps = data.reps;
          if (data.weight !== undefined) ex.weight = data.weight;
          if (data.repsPerSet !== undefined) ex.repsPerSet = data.repsPerSet;
          if (data.weightsPerSet !== undefined)
            ex.weightsPerSet = data.weightsPerSet;
          if (data.note !== undefined) ex.note = data.note;
          if (data.isComplete !== undefined) ex.isComplete = data.isComplete;
        });
      });
    },
    []
  );

  // Delete a workout type
  const deleteWorkoutType = useCallback(async (id: string): Promise<void> => {
    const collection = database.get<WorkoutType>('workout_types');
    const workout = await collection.find(id);
    await database.write(async () => {
      // Delete associated exercises first
      const exercises = await workout.exercises.fetch();
      for (const ex of exercises) {
        await ex.markAsDeleted();
      }
      await workout.markAsDeleted();
    });
  }, []);

  // Delete a workout instance
  const deleteWorkoutInstance = useCallback(
    async (id: string): Promise<void> => {
      const collection = database.get<WorkoutInstance>('workout_instances');
      const workout = await collection.find(id);
      await database.write(async () => {
        // Delete associated exercises first
        const exercises = await workout.exercises.fetch();
        for (const ex of exercises) {
          await ex.markAsDeleted();
        }
        await workout.markAsDeleted();
      });
    },
    []
  );

  // Update a workout type
  const updateWorkoutType = useCallback(
    async (
      id: string,
      data: { name?: string; summary?: string; active?: boolean }
    ): Promise<void> => {
      const collection = database.get<WorkoutType>('workout_types');
      const workout = await collection.find(id);
      await database.write(async () => {
        await workout.update((w) => {
          if (data.name !== undefined) w.name = data.name;
          if (data.summary !== undefined) w.summary = data.summary;
          if (data.active !== undefined) w.active = data.active;
        });
      });
    },
    []
  );

  // Delete an exercise instance
  const deleteExerciseInstance = useCallback(
    async (id: string): Promise<void> => {
      const collection = database.get<ExerciseInstance>('exercise_instances');
      const exercise = await collection.find(id);
      await database.write(async () => {
        await exercise.markAsDeleted();
      });
    },
    []
  );

  // Get exercise type by ID
  const getExerciseType = useCallback(
    async (id: string): Promise<ExerciseType> => {
      const collection = database.get<ExerciseType>('exercise_types');
      return await collection.find(id);
    },
    []
  );

  // Update an exercise type
  const updateExerciseType = useCallback(
    async (
      id: string,
      data: { name?: string; category?: ExerciseCategory; bodyPart?: BodyPart }
    ): Promise<void> => {
      const collection = database.get<ExerciseType>('exercise_types');
      const exercise = await collection.find(id);
      await database.write(async () => {
        await exercise.update((ex) => {
          if (data.name !== undefined) ex.name = data.name;
          if (data.category !== undefined) ex.category = data.category;
          if (data.bodyPart !== undefined) ex.bodyPart = data.bodyPart;
        });
      });
    },
    []
  );

  // Create a custom exercise type
  const createExerciseType = useCallback(
    async (
      name: string,
      category: ExerciseCategory,
      bodyPart: BodyPart
    ): Promise<ExerciseType> => {
      const collection = database.get<ExerciseType>('exercise_types');
      const exercise = await database.write(async () => {
        return await collection.create((ex) => {
          ex.name = name;
          ex.category = category;
          ex.bodyPart = bodyPart;
        });
      });
      return exercise;
    },
    []
  );

  // Seed 5 default workouts (Get Started)
  const seedDefaultWorkouts = useCallback(async (): Promise<void> => {
    const exerciseTypesCollection = database.get<ExerciseType>('exercise_types');
    const workoutTypesCollection = database.get<WorkoutType>('workout_types');
    const exerciseInstancesCollection = database.get<ExerciseInstance>('exercise_instances');

    // Helper to find exercise by name and category
    const findExercise = async (
      name: string,
      category: ExerciseCategory
    ): Promise<ExerciseType | null> => {
      const results = await exerciseTypesCollection
        .query(
          Q.where('name', name),
          Q.where('category', category)
        )
        .fetch();
      return results[0] || null;
    };

    // Workout templates matching iOS app
    const workoutTemplates: Array<{
      name: string;
      summary: string;
      exercises: Array<{
        name: string;
        category: ExerciseCategory;
        sets: number;
        reps: number;
        restPeriod: number;
      }>;
    }> = [
      {
        name: 'Push Day',
        summary: 'Chest, Triceps and Shoulders',
        exercises: [
          { name: 'Bench Press', category: ExerciseCategory.Barbell, sets: 3, reps: 6, restPeriod: 60 },
          { name: 'Overhead Press', category: ExerciseCategory.Barbell, sets: 3, reps: 8, restPeriod: 60 },
          { name: 'Incline Bench Press', category: ExerciseCategory.Dumbbell, sets: 3, reps: 10, restPeriod: 60 },
          { name: 'Lateral Raise', category: ExerciseCategory.Dumbbell, sets: 3, reps: 12, restPeriod: 60 },
          { name: 'Chest Fly', category: ExerciseCategory.Dumbbell, sets: 2, reps: 12, restPeriod: 60 },
          { name: 'Triceps Extension', category: ExerciseCategory.Cable, sets: 3, reps: 15, restPeriod: 60 },
        ],
      },
      {
        name: 'Pull Day',
        summary: 'Back and Biceps',
        exercises: [
          { name: 'Row', category: ExerciseCategory.Barbell, sets: 3, reps: 8, restPeriod: 60 },
          { name: 'Pull Up', category: ExerciseCategory.Bodyweight, sets: 3, reps: 6, restPeriod: 60 },
          { name: 'Seated Row', category: ExerciseCategory.Cable, sets: 3, reps: 8, restPeriod: 60 },
          { name: 'Lat Pulldown', category: ExerciseCategory.Cable, sets: 4, reps: 12, restPeriod: 60 },
          { name: 'Preacher Curls', category: ExerciseCategory.Machine, sets: 3, reps: 10, restPeriod: 60 },
        ],
      },
      {
        name: 'Leg Day',
        summary: 'Quads, Hamstrings, Glutes and Calves',
        exercises: [
          { name: 'Squat', category: ExerciseCategory.Barbell, sets: 3, reps: 6, restPeriod: 60 },
          { name: 'Romanian Deadlift', category: ExerciseCategory.Barbell, sets: 3, reps: 8, restPeriod: 60 },
          { name: 'Bulgarian Split Squat', category: ExerciseCategory.Dumbbell, sets: 3, reps: 10, restPeriod: 60 },
          { name: 'Leg Curl', category: ExerciseCategory.Machine, sets: 3, reps: 12, restPeriod: 60 },
          { name: 'Leg Extension', category: ExerciseCategory.Machine, sets: 2, reps: 12, restPeriod: 60 },
          { name: 'Calf Raise', category: ExerciseCategory.Machine, sets: 3, reps: 15, restPeriod: 60 },
        ],
      },
      {
        name: '5x5 Strength - A',
        summary: '3 workouts using the 5×5 set and repetition scheme',
        exercises: [
          { name: 'Back Squat', category: ExerciseCategory.Barbell, sets: 5, reps: 5, restPeriod: 150 },
          { name: 'Bench Press', category: ExerciseCategory.Barbell, sets: 5, reps: 5, restPeriod: 150 },
          { name: 'Row', category: ExerciseCategory.Barbell, sets: 5, reps: 5, restPeriod: 150 },
        ],
      },
      {
        name: '5x5 Strength - B',
        summary: '2 workouts using the 5×5 set and reps, Deadlifts performed 1 set',
        exercises: [
          { name: 'Back Squat', category: ExerciseCategory.Barbell, sets: 5, reps: 5, restPeriod: 150 },
          { name: 'Overhead Press', category: ExerciseCategory.Barbell, sets: 5, reps: 5, restPeriod: 150 },
          { name: 'Deadlift', category: ExerciseCategory.Barbell, sets: 1, reps: 5, restPeriod: 150 },
        ],
      },
    ];

    await database.write(async () => {
      for (const template of workoutTemplates) {
        // Create workout
        const workout = await workoutTypesCollection.create((w) => {
          w.name = template.name;
          w.summary = template.summary;
          w.active = false;
        });

        // Add exercises
        for (let i = 0; i < template.exercises.length; i++) {
          const exerciseTemplate = template.exercises[i];
          const exerciseType = await findExercise(
            exerciseTemplate.name,
            exerciseTemplate.category
          );

          if (exerciseType) {
            await exerciseInstancesCollection.create((ex) => {
              ex.exerciseTypeId = exerciseType.id;
              ex.workoutTypeId = workout.id;
              ex.workoutInstanceId = null;
              ex.indexPosition = i;
              ex.sets = exerciseTemplate.sets;
              ex.reps = exerciseTemplate.reps;
              ex.weight = 0;
              ex.weightType = WeightType.Lbs;
              ex.warmUpSets = 0;
              ex.targetSets = exerciseTemplate.sets;
              ex.restPeriod = exerciseTemplate.restPeriod;
              ex.repsInReserve = 2;
              ex.repsPerSet = [];
              ex.weightsPerSet = [];
              ex.note = '';
              ex.isComplete = false;
              ex.date = new Date();
            });
          }
        }
      }
    });
  }, []);

  return {
    createWorkoutType,
    createWorkoutInstance,
    addExerciseToWorkoutType,
    addExerciseToWorkoutInstance,
    updateExerciseInstance,
    deleteWorkoutType,
    deleteWorkoutInstance,
    updateWorkoutType,
    deleteExerciseInstance,
    getExerciseType,
    updateExerciseType,
    createExerciseType,
    seedDefaultWorkouts,
  };
}
