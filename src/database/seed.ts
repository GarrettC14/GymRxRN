import { Database } from '@nozbe/watermelondb';
import { ExerciseCategory, BodyPart } from '../types/enums';

// Map JSON values to our enums
const categoryMap: Record<string, ExerciseCategory> = {
  Barbell: ExerciseCategory.Barbell,
  Cable: ExerciseCategory.Cable,
  Dumbbell: ExerciseCategory.Dumbbell,
  'Smith Machine': ExerciseCategory.SmithMachine,
  Machine: ExerciseCategory.Machine,
  Bodyweight: ExerciseCategory.Bodyweight,
  None: ExerciseCategory.None,
};

const bodyPartMap: Record<string, BodyPart> = {
  Shoulders: BodyPart.Shoulders,
  Chest: BodyPart.Chest,
  Biceps: BodyPart.Biceps,
  Triceps: BodyPart.Triceps,
  Forearm: BodyPart.Forearm,
  Back: BodyPart.Back,
  Abs: BodyPart.Abs,
  Glutes: BodyPart.Glutes,
  Quadriceps: BodyPart.Quadriceps,
  Hamstrings: BodyPart.Hamstrings,
  Calves: BodyPart.Calves,
  'Full Body': BodyPart.FullBody,
  None: BodyPart.None,
};

// Seed data from iOS app
const exerciseTypeSeedData = [
  { exerciseName: 'Arnold Press', exerciseCategory: 'Dumbbell', bodyPart: 'Shoulders' },
  { exerciseName: 'Back Squat', exerciseCategory: 'Barbell', bodyPart: 'Quadriceps' },
  { exerciseName: 'Bench Dips', exerciseCategory: 'None', bodyPart: 'Triceps' },
  { exerciseName: 'Bench Press', exerciseCategory: 'Barbell', bodyPart: 'Chest' },
  { exerciseName: 'Bench Press', exerciseCategory: 'Dumbbell', bodyPart: 'Chest' },
  { exerciseName: 'Bench Press', exerciseCategory: 'Smith Machine', bodyPart: 'Chest' },
  { exerciseName: 'Bent Over One Arm Row', exerciseCategory: 'Dumbbell', bodyPart: 'Back' },
  { exerciseName: 'Bent Over Row', exerciseCategory: 'Barbell', bodyPart: 'Back' },
  { exerciseName: 'Bicep Curl', exerciseCategory: 'Barbell', bodyPart: 'Biceps' },
  { exerciseName: 'Bicep Curl', exerciseCategory: 'Dumbbell', bodyPart: 'Biceps' },
  { exerciseName: 'Bulgarian Split Squat', exerciseCategory: 'Dumbbell', bodyPart: 'Quadriceps' },
  { exerciseName: 'Bulgarian Split Squat', exerciseCategory: 'Barbell', bodyPart: 'Quadriceps' },
  { exerciseName: 'Burpee', exerciseCategory: 'None', bodyPart: 'None' },
  { exerciseName: 'Cable Crossover', exerciseCategory: 'Cable', bodyPart: 'Chest' },
  { exerciseName: 'Calf Raise', exerciseCategory: 'Barbell', bodyPart: 'Calves' },
  { exerciseName: 'Calf Raise', exerciseCategory: 'None', bodyPart: 'Calves' },
  { exerciseName: 'Calf Raise', exerciseCategory: 'Dumbbell', bodyPart: 'Calves' },
  { exerciseName: 'Calf Raise', exerciseCategory: 'Smith Machine', bodyPart: 'Calves' },
  { exerciseName: 'Chest Fly', exerciseCategory: 'Cable', bodyPart: 'Chest' },
  { exerciseName: 'Chest Fly', exerciseCategory: 'Dumbbell', bodyPart: 'Chest' },
  { exerciseName: 'Chin Up', exerciseCategory: 'None', bodyPart: 'Back' },
  { exerciseName: 'Clean', exerciseCategory: 'Barbell', bodyPart: 'Full Body' },
  { exerciseName: 'Clean and Jerk', exerciseCategory: 'Barbell', bodyPart: 'Full Body' },
  { exerciseName: 'Crunch', exerciseCategory: 'None', bodyPart: 'Abs' },
  { exerciseName: 'Decline Bench Press', exerciseCategory: 'Barbell', bodyPart: 'Chest' },
  { exerciseName: 'Decline Bench Press', exerciseCategory: 'Dumbbell', bodyPart: 'Chest' },
  { exerciseName: 'Deadlift', exerciseCategory: 'Barbell', bodyPart: 'Back' },
  { exerciseName: 'Dips', exerciseCategory: 'None', bodyPart: 'Triceps' },
  { exerciseName: 'Face Pull', exerciseCategory: 'Cable', bodyPart: 'Shoulders' },
  { exerciseName: 'Front Raise', exerciseCategory: 'Barbell', bodyPart: 'Shoulders' },
  { exerciseName: 'Front Raise', exerciseCategory: 'Cable', bodyPart: 'Shoulders' },
  { exerciseName: 'Front Raise', exerciseCategory: 'Dumbbell', bodyPart: 'Shoulders' },
  { exerciseName: 'Front Squat', exerciseCategory: 'Barbell', bodyPart: 'Quadriceps' },
  { exerciseName: 'Good Morning', exerciseCategory: 'Dumbbell', bodyPart: 'Back' },
  { exerciseName: 'Hack Squat', exerciseCategory: 'None', bodyPart: 'Quadriceps' },
  { exerciseName: 'Hammer Curl', exerciseCategory: 'Dumbbell', bodyPart: 'Biceps' },
  { exerciseName: 'Hanging Knee Raise', exerciseCategory: 'None', bodyPart: 'Abs' },
  { exerciseName: 'Hip Adductor', exerciseCategory: 'None', bodyPart: 'Glutes' },
  { exerciseName: 'Hip Thrust', exerciseCategory: 'Barbell', bodyPart: 'Glutes' },
  { exerciseName: 'Hip Thrust', exerciseCategory: 'None', bodyPart: 'Glutes' },
  { exerciseName: 'Incline Bench Press', exerciseCategory: 'Barbell', bodyPart: 'Chest' },
  { exerciseName: 'Incline Bench Press', exerciseCategory: 'Dumbbell', bodyPart: 'Chest' },
  { exerciseName: 'Incline Bench Press', exerciseCategory: 'Smith Machine', bodyPart: 'Chest' },
  { exerciseName: 'Kettle Bell Swing', exerciseCategory: 'None', bodyPart: 'Full Body' },
  { exerciseName: 'Lat Pulldown', exerciseCategory: 'Cable', bodyPart: 'Back' },
  { exerciseName: 'Lat Pulldown', exerciseCategory: 'Smith Machine', bodyPart: 'Back' },
  { exerciseName: 'Lateral Raise', exerciseCategory: 'Cable', bodyPart: 'Shoulders' },
  { exerciseName: 'Lateral Raise', exerciseCategory: 'Dumbbell', bodyPart: 'Shoulders' },
  { exerciseName: 'Lateral Raise', exerciseCategory: 'None', bodyPart: 'Shoulders' },
  { exerciseName: 'Leg Curl', exerciseCategory: 'None', bodyPart: 'Hamstrings' },
  { exerciseName: 'Leg Extension', exerciseCategory: 'None', bodyPart: 'Quadriceps' },
  { exerciseName: 'Leg Press', exerciseCategory: 'None', bodyPart: 'Quadriceps' },
  { exerciseName: 'Lunge', exerciseCategory: 'Barbell', bodyPart: 'Quadriceps' },
  { exerciseName: 'Lunge', exerciseCategory: 'Dumbbell', bodyPart: 'Quadriceps' },
  { exerciseName: 'Neutral Grip Pull Up', exerciseCategory: 'None', bodyPart: 'Back' },
  { exerciseName: 'Overhead Press', exerciseCategory: 'Barbell', bodyPart: 'Shoulders' },
  { exerciseName: 'Overhead Press', exerciseCategory: 'Dumbbell', bodyPart: 'Shoulders' },
  { exerciseName: 'Overhead Press', exerciseCategory: 'Smith Machine', bodyPart: 'Shoulders' },
  { exerciseName: 'Pec Deck', exerciseCategory: 'None', bodyPart: 'Chest' },
  { exerciseName: 'Pistol Squat', exerciseCategory: 'None', bodyPart: 'Quadriceps' },
  { exerciseName: 'Plank', exerciseCategory: 'None', bodyPart: 'Abs' },
  { exerciseName: 'Preacher Curls', exerciseCategory: 'None', bodyPart: 'Biceps' },
  { exerciseName: 'Power Clean', exerciseCategory: 'None', bodyPart: 'Full Body' },
  { exerciseName: 'Power Snatch', exerciseCategory: 'None', bodyPart: 'Full Body' },
  { exerciseName: 'Push Up', exerciseCategory: 'None', bodyPart: 'Chest' },
  { exerciseName: 'Pull Up', exerciseCategory: 'None', bodyPart: 'Back' },
  { exerciseName: 'Reverse Fly', exerciseCategory: 'Cable', bodyPart: 'Shoulders' },
  { exerciseName: 'Reverse Fly', exerciseCategory: 'None', bodyPart: 'Shoulders' },
  { exerciseName: 'Romanian Deadlift', exerciseCategory: 'Dumbbell', bodyPart: 'Hamstrings' },
  { exerciseName: 'Romanian Deadlift', exerciseCategory: 'Barbell', bodyPart: 'Hamstrings' },
  { exerciseName: 'Row', exerciseCategory: 'Barbell', bodyPart: 'Back' },
  { exerciseName: 'Row', exerciseCategory: 'Cable', bodyPart: 'Back' },
  { exerciseName: 'Row', exerciseCategory: 'Dumbbell', bodyPart: 'Back' },
  { exerciseName: 'Seated Overhead Press', exerciseCategory: 'Barbell', bodyPart: 'Shoulders' },
  { exerciseName: 'Seated Overhead Press', exerciseCategory: 'Dumbbell', bodyPart: 'Shoulders' },
  { exerciseName: 'Seated Row', exerciseCategory: 'Cable', bodyPart: 'Back' },
  { exerciseName: 'Seated Row', exerciseCategory: 'None', bodyPart: 'Back' },
  { exerciseName: 'Shoulder Press', exerciseCategory: 'Dumbbell', bodyPart: 'Shoulders' },
  { exerciseName: 'Shrug', exerciseCategory: 'Barbell', bodyPart: 'Shoulders' },
  { exerciseName: 'Shrug', exerciseCategory: 'Dumbbell', bodyPart: 'Shoulders' },
  { exerciseName: 'Squat', exerciseCategory: 'Barbell', bodyPart: 'Quadriceps' },
  { exerciseName: 'Squat', exerciseCategory: 'Dumbbell', bodyPart: 'Quadriceps' },
  { exerciseName: 'Squat', exerciseCategory: 'Smith Machine', bodyPart: 'Quadriceps' },
  { exerciseName: 'T-Bar Row', exerciseCategory: 'None', bodyPart: 'Back' },
  { exerciseName: 'Triceps Extension', exerciseCategory: 'Cable', bodyPart: 'Triceps' },
  { exerciseName: 'Triceps Extension', exerciseCategory: 'Dumbbell', bodyPart: 'Triceps' },
  { exerciseName: 'Wide Grip Pull Up', exerciseCategory: 'None', bodyPart: 'Back' },
];

export async function seedExerciseTypes(database: Database): Promise<void> {
  const exerciseTypesCollection = database.get('exercise_types');

  // Check if already seeded
  const existingCount = await exerciseTypesCollection.query().fetchCount();
  if (existingCount > 0) {
    console.log('Database already seeded with exercise types');
    return;
  }

  console.log('Seeding exercise types...');

  await database.write(async () => {
    const batch = exerciseTypeSeedData.map((exercise) =>
      exerciseTypesCollection.prepareCreate((record: any) => {
        record.name = exercise.exerciseName;
        record.category = categoryMap[exercise.exerciseCategory] || ExerciseCategory.None;
        record.bodyPart = bodyPartMap[exercise.bodyPart] || BodyPart.None;
      })
    );

    await database.batch(...batch);
  });

  console.log(`Seeded ${exerciseTypeSeedData.length} exercise types`);
}
