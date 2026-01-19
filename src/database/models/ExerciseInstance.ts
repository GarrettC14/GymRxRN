import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation, json } from '@nozbe/watermelondb/decorators';
import { WeightType } from '../../types/enums';

const sanitizeIntArray = (raw: unknown): number[] => {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is number => typeof item === 'number');
  }
  return [];
};

export default class ExerciseInstance extends Model {
  static table = 'exercise_instances';

  static associations = {
    exercise_types: { type: 'belongs_to' as const, key: 'exercise_type_id' },
    workout_types: { type: 'belongs_to' as const, key: 'workout_type_id' },
    workout_instances: { type: 'belongs_to' as const, key: 'workout_instance_id' },
  };

  @field('exercise_type_id') exerciseTypeId!: string;
  @field('workout_type_id') workoutTypeId!: string | null;
  @field('workout_instance_id') workoutInstanceId!: string | null;
  @field('weight') weight!: number;
  @field('warm_up_sets') warmUpSets!: number;
  @field('target_sets') targetSets!: number;
  @field('sets') sets!: number;
  @field('reps') reps!: number;
  @date('date') date!: Date;
  @field('weight_type') weightType!: WeightType;
  @field('reps_in_reserve') repsInReserve!: number;
  @field('rest_period') restPeriod!: number;
  @json('reps_per_set', sanitizeIntArray) repsPerSet!: number[];
  @json('weights_per_set', sanitizeIntArray) weightsPerSet!: number[];
  @field('note') note!: string;
  @field('index_position') indexPosition!: number;
  @field('is_complete') isComplete!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('exercise_types', 'exercise_type_id') exerciseType!: any;
  @relation('workout_types', 'workout_type_id') workoutType!: any;
  @relation('workout_instances', 'workout_instance_id') workoutInstance!: any;
}
