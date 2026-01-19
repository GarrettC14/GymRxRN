import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';
import { ExerciseCategory, BodyPart } from '../../types/enums';

export default class ExerciseType extends Model {
  static table = 'exercise_types';

  static associations = {
    exercise_instances: { type: 'has_many' as const, foreignKey: 'exercise_type_id' },
  };

  @field('name') name!: string;
  @field('category') category!: ExerciseCategory;
  @field('body_part') bodyPart!: BodyPart;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('exercise_instances') exerciseInstances!: any;
}
