// Date formatting utilities (matching iOS app's date formatters)

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Exercise analytics utilities (matching iOS app's ExercisePersonalRecordCard)

/**
 * Calculate estimated 1RM using Brzycki Formula
 * Formula: weight / (1.0278 - 0.0278 * reps)
 */
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;

  // Brzycki formula
  const oneRM = weight / (1.0278 - 0.0278 * reps);
  return Math.round(oneRM);
}

/**
 * Find the maximum weight from an array of weights
 */
export function findMaxWeight(weightsPerSet: number[]): number {
  if (weightsPerSet.length === 0) return 0;
  return Math.max(...weightsPerSet.filter((w) => w > 0));
}

/**
 * Find the highest rep count from an array of reps
 */
export function findMaxReps(repsPerSet: number[]): number {
  if (repsPerSet.length === 0) return 0;
  return Math.max(...repsPerSet.filter((r) => r > 0));
}

/**
 * Calculate best estimated 1RM across all sets
 */
export function calculateBestOneRepMax(
  repsPerSet: number[],
  weightsPerSet: number[]
): number {
  if (repsPerSet.length !== weightsPerSet.length) return 0;

  let best1RM = 0;
  for (let i = 0; i < repsPerSet.length; i++) {
    const reps = repsPerSet[i];
    const weight = weightsPerSet[i];
    if (reps > 0 && weight > 0) {
      const oneRM = calculateOneRepMax(weight, reps);
      if (oneRM > best1RM) {
        best1RM = oneRM;
      }
    }
  }
  return best1RM;
}

// Array utilities

/**
 * Group items by a key function
 */
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
}

/**
 * Sort items alphabetically by a key function
 */
export function sortAlphabetically<T>(
  items: T[],
  keyFn: (item: T) => string
): T[] {
  return [...items].sort((a, b) => keyFn(a).localeCompare(keyFn(b)));
}
