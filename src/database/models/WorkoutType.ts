import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';

export default class WorkoutType extends Model {
  static table = 'workout_types';

  static associations = {
    exercise_instances: { type: 'has_many' as const, foreignKey: 'workout_type_id' },
  };

  @field('name') name!: string;
  @field('summary') summary!: string;
  @field('active') active!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('exercise_instances') exercises!: any;
}
