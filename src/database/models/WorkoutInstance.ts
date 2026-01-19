import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';

export default class WorkoutInstance extends Model {
  static table = 'workout_instances';

  static associations = {
    exercise_instances: { type: 'has_many' as const, foreignKey: 'workout_instance_id' },
  };

  @field('name') name!: string;
  @field('summary') summary!: string;
  @date('date') date!: Date;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('exercise_instances') exercises!: any;
}
