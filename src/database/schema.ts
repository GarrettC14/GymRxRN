import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // ExerciseType - template/definition of an exercise
    tableSchema({
      name: 'exercise_types',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'category', type: 'string' }, // ExerciseCategory enum
        { name: 'body_part', type: 'string' }, // BodyPart enum
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // ExerciseInstance - specific exercise within a workout
    tableSchema({
      name: 'exercise_instances',
      columns: [
        { name: 'exercise_type_id', type: 'string', isIndexed: true },
        { name: 'workout_type_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'workout_instance_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'weight', type: 'number' },
        { name: 'warm_up_sets', type: 'number' },
        { name: 'target_sets', type: 'number' },
        { name: 'sets', type: 'number' },
        { name: 'reps', type: 'number' },
        { name: 'date', type: 'number' },
        { name: 'weight_type', type: 'string' }, // WeightType enum
        { name: 'reps_in_reserve', type: 'number' },
        { name: 'rest_period', type: 'number' }, // seconds
        { name: 'reps_per_set', type: 'string' }, // JSON array
        { name: 'weights_per_set', type: 'string' }, // JSON array
        { name: 'note', type: 'string' },
        { name: 'index_position', type: 'number' },
        { name: 'is_complete', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // WorkoutType - workout template/routine
    tableSchema({
      name: 'workout_types',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'summary', type: 'string' },
        { name: 'active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // WorkoutInstance - completed workout session
    tableSchema({
      name: 'workout_instances',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'summary', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
