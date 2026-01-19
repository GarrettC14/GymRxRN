// Exercise Category - matches iOS ExerciseType.ExerciseCategory
export enum ExerciseCategory {
  Barbell = 'barbell',
  Cable = 'cable',
  Dumbbell = 'dumbbell',
  SmithMachine = 'smith_machine',
  Machine = 'machine',
  Bodyweight = 'bodyweight',
  None = 'none',
}

export const ExerciseCategoryLabels: Record<ExerciseCategory, string> = {
  [ExerciseCategory.Barbell]: 'Barbell',
  [ExerciseCategory.Cable]: 'Cable',
  [ExerciseCategory.Dumbbell]: 'Dumbbell',
  [ExerciseCategory.SmithMachine]: 'Smith Machine',
  [ExerciseCategory.Machine]: 'Machine',
  [ExerciseCategory.Bodyweight]: 'Bodyweight',
  [ExerciseCategory.None]: 'None',
};

// Body Part - matches iOS ExerciseType.BodyPart
export enum BodyPart {
  Shoulders = 'shoulders',
  Chest = 'chest',
  Biceps = 'biceps',
  Triceps = 'triceps',
  Forearm = 'forearm',
  Back = 'back',
  Abs = 'abs',
  Glutes = 'glutes',
  Quadriceps = 'quadriceps',
  Hamstrings = 'hamstrings',
  Calves = 'calves',
  FullBody = 'full_body',
  None = 'none',
}

export const BodyPartLabels: Record<BodyPart, string> = {
  [BodyPart.Shoulders]: 'Shoulders',
  [BodyPart.Chest]: 'Chest',
  [BodyPart.Biceps]: 'Biceps',
  [BodyPart.Triceps]: 'Triceps',
  [BodyPart.Forearm]: 'Forearm',
  [BodyPart.Back]: 'Back',
  [BodyPart.Abs]: 'Abs',
  [BodyPart.Glutes]: 'Glutes',
  [BodyPart.Quadriceps]: 'Quadriceps',
  [BodyPart.Hamstrings]: 'Hamstrings',
  [BodyPart.Calves]: 'Calves',
  [BodyPart.FullBody]: 'Full Body',
  [BodyPart.None]: 'None',
};

// Weight Type - matches iOS ExerciseInstance.WeightType
export enum WeightType {
  Lbs = 'lbs',
  Kg = 'kg',
}

export const WeightTypeLabels: Record<WeightType, string> = {
  [WeightType.Lbs]: 'lbs',
  [WeightType.Kg]: 'kg',
};
