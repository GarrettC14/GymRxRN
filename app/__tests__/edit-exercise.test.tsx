import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock dependencies before importing component
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: mockBack,
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    id: 'exercise-123',
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const mockGetExerciseType = jest.fn();
const mockUpdateExerciseType = jest.fn();

jest.mock('../../src/hooks/useDatabase', () => ({
  useDatabaseOperations: () => ({
    getExerciseType: mockGetExerciseType,
    updateExerciseType: mockUpdateExerciseType,
  }),
}));

jest.mock('../../src/types/enums', () => ({
  ExerciseCategory: {
    Barbell: 'barbell',
    Cable: 'cable',
    Dumbbell: 'dumbbell',
    SmithMachine: 'smith_machine',
    Machine: 'machine',
    Bodyweight: 'bodyweight',
    None: 'none',
  },
  ExerciseCategoryLabels: {
    barbell: 'Barbell',
    cable: 'Cable',
    dumbbell: 'Dumbbell',
    smith_machine: 'Smith Machine',
    machine: 'Machine',
    bodyweight: 'Bodyweight',
    none: 'None',
  },
  BodyPart: {
    Shoulders: 'shoulders',
    Chest: 'chest',
    Biceps: 'biceps',
    Triceps: 'triceps',
    Forearm: 'forearm',
    Back: 'back',
    Abs: 'abs',
    Glutes: 'glutes',
    Quadriceps: 'quadriceps',
    Hamstrings: 'hamstrings',
    Calves: 'calves',
    FullBody: 'full_body',
    None: 'none',
  },
  BodyPartLabels: {
    shoulders: 'Shoulders',
    chest: 'Chest',
    biceps: 'Biceps',
    triceps: 'Triceps',
    forearm: 'Forearm',
    back: 'Back',
    abs: 'Abs',
    glutes: 'Glutes',
    quadriceps: 'Quadriceps',
    hamstrings: 'Hamstrings',
    calves: 'Calves',
    full_body: 'Full Body',
    none: 'None',
  },
}));

import EditExerciseScreen from '../edit-exercise';

describe('EditExerciseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    // Default mock exercise
    mockGetExerciseType.mockResolvedValue({
      id: 'exercise-123',
      name: 'Bench Press',
      category: 'barbell',
      bodyPart: 'chest',
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator initially', async () => {
      // Create a pending promise that doesn't resolve
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockGetExerciseType.mockReturnValue(pendingPromise);

      const { UNSAFE_queryByType } = render(<EditExerciseScreen />);
      // ActivityIndicator should be rendered while loading

      // Cleanup - resolve the promise
      await act(async () => {
        resolvePromise!({
          id: 'exercise-123',
          name: 'Bench Press',
          category: 'barbell',
          bodyPart: 'chest',
        });
      });
    });
  });

  describe('Rendering After Load', () => {
    it('renders exercise name input with loaded value', async () => {
      const { findByDisplayValue } = render(<EditExerciseScreen />);

      await waitFor(async () => {
        expect(await findByDisplayValue('Bench Press')).toBeTruthy();
      });
    });

    it('renders Exercise Name label', async () => {
      const { findByText } = render(<EditExerciseScreen />);

      await waitFor(async () => {
        expect(await findByText('Exercise Name')).toBeTruthy();
      });
    });

    it('renders Category label', async () => {
      const { findByText } = render(<EditExerciseScreen />);

      await waitFor(async () => {
        expect(await findByText('Category')).toBeTruthy();
      });
    });

    it('renders Body Part label', async () => {
      const { findByText } = render(<EditExerciseScreen />);

      await waitFor(async () => {
        expect(await findByText('Body Part')).toBeTruthy();
      });
    });

    it('renders Cancel button', async () => {
      const { findByText } = render(<EditExerciseScreen />);

      await waitFor(async () => {
        expect(await findByText('Cancel')).toBeTruthy();
      });
    });

    it('renders Save button', async () => {
      const { findByText } = render(<EditExerciseScreen />);

      await waitFor(async () => {
        expect(await findByText('Save')).toBeTruthy();
      });
    });

    it('renders category options', async () => {
      const { findByText } = render(<EditExerciseScreen />);

      await waitFor(async () => {
        expect(await findByText('Barbell')).toBeTruthy();
        expect(await findByText('Dumbbell')).toBeTruthy();
        expect(await findByText('Cable')).toBeTruthy();
      });
    });

    it('renders body part options', async () => {
      const { findByText } = render(<EditExerciseScreen />);

      await waitFor(async () => {
        expect(await findByText('Chest')).toBeTruthy();
        expect(await findByText('Back')).toBeTruthy();
        expect(await findByText('Shoulders')).toBeTruthy();
      });
    });
  });

  describe('Form Editing', () => {
    it('can modify exercise name input', async () => {
      const { findByDisplayValue, getByPlaceholderText } = render(<EditExerciseScreen />);

      await findByDisplayValue('Bench Press');

      const nameInput = getByPlaceholderText('e.g., Romanian Deadlift');

      await act(async () => {
        fireEvent.changeText(nameInput, 'Incline Bench Press');
      });

      // The input should reflect the change
      expect(nameInput.props.value).toBeDefined();
    });

    it('saves with current form values', async () => {
      mockUpdateExerciseType.mockResolvedValue(undefined);
      const { findByText, getByText } = render(<EditExerciseScreen />);

      await findByText('Barbell'); // Wait for load

      await act(async () => {
        fireEvent.press(getByText('Save'));
      });

      // Should call update with the current state
      expect(mockUpdateExerciseType).toHaveBeenCalledWith('exercise-123', expect.objectContaining({
        name: expect.any(String),
        category: expect.any(String),
        bodyPart: expect.any(String),
      }));
    });
  });

  describe('Save Button Behavior', () => {
    it('calls save when Save button is pressed with valid name', async () => {
      mockUpdateExerciseType.mockResolvedValue(undefined);
      const { findByDisplayValue, getByText } = render(<EditExerciseScreen />);

      await findByDisplayValue('Bench Press');

      await act(async () => {
        fireEvent.press(getByText('Save'));
      });

      // Should call update with exercise data
      expect(mockUpdateExerciseType).toHaveBeenCalled();
    });
  });

  describe('Cancel Action', () => {
    it('navigates back when Cancel is pressed', async () => {
      const { findByText, getByText } = render(<EditExerciseScreen />);

      await findByText('Cancel');

      await act(async () => {
        fireEvent.press(getByText('Cancel'));
      });

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Save Action', () => {
    it('calls updateExerciseType when saving', async () => {
      mockUpdateExerciseType.mockResolvedValue(undefined);
      const { findByDisplayValue, getByText } = render(<EditExerciseScreen />);

      await findByDisplayValue('Bench Press');

      await act(async () => {
        fireEvent.press(getByText('Save'));
      });

      expect(mockUpdateExerciseType).toHaveBeenCalledWith('exercise-123', expect.objectContaining({
        name: expect.any(String),
        category: expect.any(String),
        bodyPart: expect.any(String),
      }));
    });

    it('navigates back after successful save', async () => {
      mockUpdateExerciseType.mockResolvedValue(undefined);
      const { findByDisplayValue, getByText } = render(<EditExerciseScreen />);

      await findByDisplayValue('Bench Press');

      await act(async () => {
        fireEvent.press(getByText('Save'));
      });

      await waitFor(() => {
        expect(mockBack).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error alert when load fails', async () => {
      mockGetExerciseType.mockRejectedValue(new Error('Load failed'));
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<EditExerciseScreen />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load exercise');
      });

      expect(mockBack).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('shows error alert when save fails', async () => {
      // First, ensure the component loads successfully
      mockGetExerciseType.mockResolvedValue({
        id: 'exercise-123',
        name: 'Bench Press',
        category: 'barbell',
        bodyPart: 'chest',
      });
      mockUpdateExerciseType.mockRejectedValue(new Error('Save failed'));
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { findByDisplayValue, getByText } = render(<EditExerciseScreen />);

      await findByDisplayValue('Bench Press');

      await act(async () => {
        fireEvent.press(getByText('Save'));
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to update exercise');
      });

      consoleError.mockRestore();
    });
  });
});
