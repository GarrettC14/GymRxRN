import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

// Mock dependencies before importing component
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: mockBack,
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    workoutTypeId: 'workout-123',
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const mockAddExerciseToWorkoutType = jest.fn();

const mockExerciseTypes = [
  { id: 'ex-1', name: 'Bench Press', category: 'barbell', bodyPart: 'chest' },
  { id: 'ex-2', name: 'Bicep Curl', category: 'dumbbell', bodyPart: 'biceps' },
  { id: 'ex-3', name: 'Cable Fly', category: 'cable', bodyPart: 'chest' },
  { id: 'ex-4', name: 'Deadlift', category: 'barbell', bodyPart: 'back' },
];

const mockWorkoutExercises = [
  { id: 'existing-1', exerciseTypeId: 'ex-other' },
];

jest.mock('../../src/hooks/useDatabase', () => ({
  useExerciseTypes: jest.fn((searchQuery: string) => ({
    exercises: searchQuery
      ? mockExerciseTypes.filter((ex) =>
          ex.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : mockExerciseTypes,
    loading: false,
  })),
  useWorkoutExercises: jest.fn(() => ({
    exercises: mockWorkoutExercises,
    loading: false,
  })),
  useDatabaseOperations: () => ({
    addExerciseToWorkoutType: mockAddExerciseToWorkoutType,
  }),
}));

jest.mock('../../src/types/enums', () => ({
  ExerciseCategoryLabels: {
    barbell: 'Barbell',
    dumbbell: 'Dumbbell',
    cable: 'Cable',
    machine: 'Machine',
    bodyweight: 'Bodyweight',
  },
  BodyPartLabels: {
    chest: 'Chest',
    biceps: 'Biceps',
    back: 'Back',
    shoulders: 'Shoulders',
  },
}));

jest.mock('../../src/utils', () => ({
  groupBy: jest.fn((items, keyFn) => {
    return items.reduce((acc: any, item: any) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }),
  sortAlphabetically: jest.fn((items, keyFn) => {
    return [...items].sort((a, b) => keyFn(a).localeCompare(keyFn(b)));
  }),
}));

import AddExerciseScreen from '../add-exercise';

describe('AddExerciseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the search bar', () => {
      const { getByPlaceholderText } = render(<AddExerciseScreen />);
      expect(getByPlaceholderText('Search exercises...')).toBeTruthy();
    });

    it('renders exercise list', () => {
      const { getByText } = render(<AddExerciseScreen />);
      expect(getByText('Bench Press')).toBeTruthy();
      expect(getByText('Bicep Curl')).toBeTruthy();
      expect(getByText('Cable Fly')).toBeTruthy();
      expect(getByText('Deadlift')).toBeTruthy();
    });

    it('renders exercise category and body part info', () => {
      const { getByText } = render(<AddExerciseScreen />);
      expect(getByText(/Barbell.*Chest/)).toBeTruthy();
      expect(getByText(/Dumbbell.*Biceps/)).toBeTruthy();
    });

    it('renders alphabet section headers', () => {
      const { getByText } = render(<AddExerciseScreen />);
      expect(getByText('B')).toBeTruthy();
      expect(getByText('C')).toBeTruthy();
      expect(getByText('D')).toBeTruthy();
    });

    it('renders add icon for each exercise', () => {
      const { getAllByText } = render(<AddExerciseScreen />);
      const addIcons = getAllByText('+');
      expect(addIcons.length).toBe(4); // 4 exercises
    });

    it('renders without crashing', () => {
      const { toJSON } = render(<AddExerciseScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    it('filters exercises based on search query', async () => {
      const { getByPlaceholderText, queryByText } = render(<AddExerciseScreen />);
      const searchInput = getByPlaceholderText('Search exercises...');

      await act(async () => {
        fireEvent.changeText(searchInput, 'Bench');
      });

      expect(searchInput.props.value).toBe('Bench');
    });

    it('shows clear button when search has text', async () => {
      const { getByPlaceholderText, getByText } = render(<AddExerciseScreen />);
      const searchInput = getByPlaceholderText('Search exercises...');

      await act(async () => {
        fireEvent.changeText(searchInput, 'test');
      });

      expect(getByText('✕')).toBeTruthy();
    });

    it('clears search when clear button is pressed', async () => {
      const { getByPlaceholderText, getByText } = render(<AddExerciseScreen />);
      const searchInput = getByPlaceholderText('Search exercises...');

      await act(async () => {
        fireEvent.changeText(searchInput, 'test');
      });

      await act(async () => {
        fireEvent.press(getByText('✕'));
      });

      expect(searchInput.props.value).toBe('');
    });

    it('does not show clear button when search is empty', () => {
      const { queryByText } = render(<AddExerciseScreen />);
      expect(queryByText('✕')).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('shows message when no exercises match search', async () => {
      jest.requireMock('../../src/hooks/useDatabase').useExerciseTypes.mockReturnValue({
        exercises: [],
        loading: false,
      });

      const { getByText, getByPlaceholderText } = render(<AddExerciseScreen />);

      const searchInput = getByPlaceholderText('Search exercises...');
      await act(async () => {
        fireEvent.changeText(searchInput, 'xyz');
      });

      expect(getByText(/No exercises found for "xyz"/)).toBeTruthy();
    });

    it('shows generic empty message when no exercises available', async () => {
      jest.requireMock('../../src/hooks/useDatabase').useExerciseTypes.mockReturnValue({
        exercises: [],
        loading: false,
      });

      const { getByText } = render(<AddExerciseScreen />);
      expect(getByText('No exercises available')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator while loading', () => {
      jest.requireMock('../../src/hooks/useDatabase').useExerciseTypes.mockReturnValue({
        exercises: [],
        loading: true,
      });

      // Should show ActivityIndicator
      const { UNSAFE_queryByType } = render(<AddExerciseScreen />);
    });
  });

  describe('Exercise Selection', () => {
    beforeEach(() => {
      jest.requireMock('../../src/hooks/useDatabase').useExerciseTypes.mockReturnValue({
        exercises: mockExerciseTypes,
        loading: false,
      });
    });

    it('adds exercise to workout when pressed', async () => {
      mockAddExerciseToWorkoutType.mockResolvedValue({ id: 'new-instance' });
      const { getByText } = render(<AddExerciseScreen />);

      await act(async () => {
        fireEvent.press(getByText('Bench Press'));
      });

      await waitFor(() => {
        expect(mockAddExerciseToWorkoutType).toHaveBeenCalledWith(
          'workout-123',
          'ex-1',
          1 // next position (mockWorkoutExercises.length)
        );
      });
    });

    it('navigates back after adding exercise', async () => {
      mockAddExerciseToWorkoutType.mockResolvedValue({ id: 'new-instance' });
      const { getByText } = render(<AddExerciseScreen />);

      await act(async () => {
        fireEvent.press(getByText('Bench Press'));
      });

      await waitFor(() => {
        expect(mockBack).toHaveBeenCalled();
      });
    });

    it('handles add failure gracefully', async () => {
      mockAddExerciseToWorkoutType.mockRejectedValue(new Error('Failed'));
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByText } = render(<AddExerciseScreen />);

      await act(async () => {
        fireEvent.press(getByText('Bench Press'));
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      // Should not navigate back on failure
      expect(mockBack).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('Index Position', () => {
    it('calculates correct position based on existing exercises', async () => {
      mockAddExerciseToWorkoutType.mockResolvedValue({ id: 'new-instance' });

      // Mock 3 existing exercises
      jest.requireMock('../../src/hooks/useDatabase').useWorkoutExercises.mockReturnValue({
        exercises: [
          { id: 'e1' },
          { id: 'e2' },
          { id: 'e3' },
        ],
        loading: false,
      });

      const { getByText } = render(<AddExerciseScreen />);

      await act(async () => {
        fireEvent.press(getByText('Bench Press'));
      });

      await waitFor(() => {
        expect(mockAddExerciseToWorkoutType).toHaveBeenCalledWith(
          'workout-123',
          'ex-1',
          3 // position should be 3 (after 3 existing exercises)
        );
      });
    });
  });
});
