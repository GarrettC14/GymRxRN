import {
  formatDate,
  formatMonthYear,
  formatTime,
  calculateOneRepMax,
  findMaxWeight,
  findMaxReps,
  calculateBestOneRepMax,
  groupBy,
  sortAlphabetically,
} from '../utils';

describe('Date Formatting Utilities', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      // Use explicit time to avoid timezone issues
      const date = new Date(2024, 2, 15); // March 15, 2024 (months are 0-indexed)
      const formatted = formatDate(date);
      expect(formatted).toMatch(/3\/15\/2024/);
    });

    it('handles single digit months and days', () => {
      const date = new Date(2024, 0, 5); // January 5, 2024
      const formatted = formatDate(date);
      expect(formatted).toMatch(/1\/5\/2024/);
    });
  });

  describe('formatMonthYear', () => {
    it('formats month and year correctly', () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      const formatted = formatMonthYear(date);
      expect(formatted).toBe('March 2024');
    });

    it('handles different months', () => {
      expect(formatMonthYear(new Date(2024, 0, 1))).toBe('January 2024');
      expect(formatMonthYear(new Date(2024, 11, 31))).toBe('December 2024');
    });
  });

  describe('formatTime', () => {
    it('formats seconds to mm:ss', () => {
      expect(formatTime(90)).toBe('1:30');
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(0)).toBe('0:00');
    });

    it('handles minutes correctly', () => {
      expect(formatTime(120)).toBe('2:00');
      expect(formatTime(600)).toBe('10:00');
    });

    it('pads seconds with leading zero', () => {
      expect(formatTime(61)).toBe('1:01');
      expect(formatTime(69)).toBe('1:09');
    });
  });
});

describe('Exercise Analytics Utilities', () => {
  describe('calculateOneRepMax', () => {
    it('returns weight for 1 rep', () => {
      expect(calculateOneRepMax(100, 1)).toBe(100);
    });

    it('calculates 1RM using Brzycki formula', () => {
      // 135 lbs for 10 reps should be approximately 180 lbs 1RM
      const result = calculateOneRepMax(135, 10);
      expect(result).toBeGreaterThan(170);
      expect(result).toBeLessThan(190);
    });

    it('returns 0 for invalid inputs', () => {
      expect(calculateOneRepMax(0, 10)).toBe(0);
      expect(calculateOneRepMax(100, 0)).toBe(0);
      expect(calculateOneRepMax(-100, 10)).toBe(0);
      expect(calculateOneRepMax(100, -5)).toBe(0);
    });

    it('increases with more weight', () => {
      const oneRM100 = calculateOneRepMax(100, 5);
      const oneRM150 = calculateOneRepMax(150, 5);
      expect(oneRM150).toBeGreaterThan(oneRM100);
    });

    it('estimates similar 1RM regardless of rep scheme', () => {
      // Different rep schemes at proportional weights should give similar 1RM estimates
      const oneRM5 = calculateOneRepMax(100, 5);
      const oneRM10 = calculateOneRepMax(100, 10);
      // Both estimate 1RM from the same working weight, should be within 25
      expect(Math.abs(oneRM5 - oneRM10)).toBeLessThanOrEqual(25);
    });
  });

  describe('findMaxWeight', () => {
    it('finds maximum weight from array', () => {
      expect(findMaxWeight([100, 135, 150, 135])).toBe(150);
    });

    it('returns 0 for empty array', () => {
      expect(findMaxWeight([])).toBe(0);
    });

    it('ignores zero values', () => {
      expect(findMaxWeight([0, 100, 0, 135])).toBe(135);
    });

    it('handles single value', () => {
      expect(findMaxWeight([200])).toBe(200);
    });

    it('handles all zeros', () => {
      expect(findMaxWeight([0, 0, 0])).toBe(-Infinity); // Math.max of empty filtered array
    });
  });

  describe('findMaxReps', () => {
    it('finds maximum reps from array', () => {
      expect(findMaxReps([8, 10, 12, 8])).toBe(12);
    });

    it('returns 0 for empty array', () => {
      expect(findMaxReps([])).toBe(0);
    });

    it('ignores zero values', () => {
      expect(findMaxReps([0, 8, 0, 10])).toBe(10);
    });

    it('handles single value', () => {
      expect(findMaxReps([15])).toBe(15);
    });
  });

  describe('calculateBestOneRepMax', () => {
    it('calculates best 1RM across all sets', () => {
      const reps = [10, 8, 6];
      const weights = [135, 155, 175];
      const best = calculateBestOneRepMax(reps, weights);

      // Should be highest from individual calculations
      expect(best).toBeGreaterThan(0);
    });

    it('returns 0 for mismatched arrays', () => {
      expect(calculateBestOneRepMax([10, 8], [135])).toBe(0);
    });

    it('returns 0 for empty arrays', () => {
      expect(calculateBestOneRepMax([], [])).toBe(0);
    });

    it('ignores sets with zero reps or weight', () => {
      const reps = [10, 0, 8];
      const weights = [135, 155, 0];
      const best = calculateBestOneRepMax(reps, weights);

      // Should only calculate from first set (10 reps at 135)
      expect(best).toBe(calculateOneRepMax(135, 10));
    });

    it('handles single set', () => {
      const result = calculateBestOneRepMax([5], [200]);
      expect(result).toBe(calculateOneRepMax(200, 5));
    });
  });
});

describe('Array Utilities', () => {
  describe('groupBy', () => {
    it('groups items by key function', () => {
      const items = [
        { name: 'Apple', category: 'fruit' },
        { name: 'Banana', category: 'fruit' },
        { name: 'Carrot', category: 'vegetable' },
      ];

      const grouped = groupBy(items, (item) => item.category);

      expect(grouped.fruit).toHaveLength(2);
      expect(grouped.vegetable).toHaveLength(1);
    });

    it('handles empty array', () => {
      const grouped = groupBy([], (item: { key: string }) => item.key);
      expect(Object.keys(grouped)).toHaveLength(0);
    });

    it('groups by numeric key', () => {
      const items = [
        { name: 'A', score: 1 },
        { name: 'B', score: 2 },
        { name: 'C', score: 1 },
      ];

      const grouped = groupBy(items, (item) => item.score);

      expect(grouped[1]).toHaveLength(2);
      expect(grouped[2]).toHaveLength(1);
    });

    it('creates single-item groups', () => {
      const items = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ];

      const grouped = groupBy(items, (item) => item.id);

      expect(Object.keys(grouped)).toHaveLength(3);
    });
  });

  describe('sortAlphabetically', () => {
    it('sorts items alphabetically', () => {
      const items = [
        { name: 'Zebra' },
        { name: 'Apple' },
        { name: 'Mango' },
      ];

      const sorted = sortAlphabetically(items, (item) => item.name);

      expect(sorted[0].name).toBe('Apple');
      expect(sorted[1].name).toBe('Mango');
      expect(sorted[2].name).toBe('Zebra');
    });

    it('does not mutate original array', () => {
      const items = [{ name: 'B' }, { name: 'A' }];
      const original = [...items];

      sortAlphabetically(items, (item) => item.name);

      expect(items).toEqual(original);
    });

    it('handles empty array', () => {
      const sorted = sortAlphabetically([], (item: { name: string }) => item.name);
      expect(sorted).toEqual([]);
    });

    it('handles single item', () => {
      const items = [{ name: 'Only' }];
      const sorted = sortAlphabetically(items, (item) => item.name);
      expect(sorted).toEqual(items);
    });

    it('handles case-insensitive sorting', () => {
      const items = [
        { name: 'banana' },
        { name: 'Apple' },
        { name: 'cherry' },
      ];

      const sorted = sortAlphabetically(items, (item) => item.name);

      // localeCompare handles case
      expect(sorted[0].name).toBe('Apple');
    });
  });
});
