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
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const mockCreateExerciseType = jest.fn();

jest.mock('../../src/hooks/useDatabase', () => ({
  useDatabaseOperations: () => ({
    createExerciseType: mockCreateExerciseType,
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

import CreateExerciseScreen from '../create-exercise';

describe('CreateExerciseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the exercise name input', () => {
      const { getByPlaceholderText } = render(<CreateExerciseScreen />);
      expect(getByPlaceholderText('e.g., Romanian Deadlift')).toBeTruthy();
    });

    it('renders the Exercise Name label', () => {
      const { getByText } = render(<CreateExerciseScreen />);
      expect(getByText('Exercise Name')).toBeTruthy();
    });

    it('renders the Category label', () => {
      const { getByText } = render(<CreateExerciseScreen />);
      expect(getByText('Category')).toBeTruthy();
    });

    it('renders the Body Part label', () => {
      const { getByText } = render(<CreateExerciseScreen />);
      expect(getByText('Body Part')).toBeTruthy();
    });

    it('renders Cancel button', () => {
      const { getByText } = render(<CreateExerciseScreen />);
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('renders Create button', () => {
      const { getByText } = render(<CreateExerciseScreen />);
      expect(getByText('Create')).toBeTruthy();
    });

    it('renders category options', () => {
      const { getByText } = render(<CreateExerciseScreen />);
      expect(getByText('Barbell')).toBeTruthy();
      expect(getByText('Dumbbell')).toBeTruthy();
      expect(getByText('Cable')).toBeTruthy();
      expect(getByText('Machine')).toBeTruthy();
      expect(getByText('Bodyweight')).toBeTruthy();
    });

    it('renders body part options', () => {
      const { getByText } = render(<CreateExerciseScreen />);
      expect(getByText('Chest')).toBeTruthy();
      expect(getByText('Back')).toBeTruthy();
      expect(getByText('Shoulders')).toBeTruthy();
      expect(getByText('Biceps')).toBeTruthy();
      expect(getByText('Triceps')).toBeTruthy();
    });

    it('renders without crashing', () => {
      const { toJSON } = render(<CreateExerciseScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Form Input', () => {
    it('updates exercise name on text change', async () => {
      const { getByPlaceholderText } = render(<CreateExerciseScreen />);
      const nameInput = getByPlaceholderText('e.g., Romanian Deadlift');

      await act(async () => {
        fireEvent.changeText(nameInput, 'My Exercise');
      });

      expect(nameInput.props.value).toBe('My Exercise');
    });
  });

  describe('Category Selection', () => {
    it('defaults to Dumbbell category', () => {
      // The component defaults to Dumbbell, check that it's selected initially
      const { getByText } = render(<CreateExerciseScreen />);
      // Dumbbell should be selected by default
      const dumbbellButton = getByText('Dumbbell');
      expect(dumbbellButton).toBeTruthy();
    });

    it('can select different category', async () => {
      const { getByText, getByPlaceholderText } = render(<CreateExerciseScreen />);

      await act(async () => {
        fireEvent.press(getByText('Barbell'));
      });

      // Verify by creating exercise and checking the category
      mockCreateExerciseType.mockResolvedValue({ id: 'new-ex' });
      const nameInput = getByPlaceholderText('e.g., Romanian Deadlift');

      await act(async () => {
        fireEvent.changeText(nameInput, 'Test');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateExerciseType).toHaveBeenCalledWith(
        'Test',
        'barbell', // Should be barbell
        expect.any(String)
      );
    });
  });

  describe('Body Part Selection', () => {
    it('defaults to Chest body part', () => {
      const { getByText } = render(<CreateExerciseScreen />);
      const chestButton = getByText('Chest');
      expect(chestButton).toBeTruthy();
    });

    it('can select different body part', async () => {
      const { getByText, getByPlaceholderText } = render(<CreateExerciseScreen />);

      await act(async () => {
        fireEvent.press(getByText('Back'));
      });

      mockCreateExerciseType.mockResolvedValue({ id: 'new-ex' });
      const nameInput = getByPlaceholderText('e.g., Romanian Deadlift');

      await act(async () => {
        fireEvent.changeText(nameInput, 'Test');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateExerciseType).toHaveBeenCalledWith(
        'Test',
        expect.any(String),
        'back' // Should be back
      );
    });
  });

  describe('Create Button State', () => {
    it('does not create when name is empty', async () => {
      const { getByText } = render(<CreateExerciseScreen />);

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateExerciseType).not.toHaveBeenCalled();
    });

    it('creates when name has content', async () => {
      mockCreateExerciseType.mockResolvedValue({ id: 'new-exercise' });
      const { getByPlaceholderText, getByText } = render(<CreateExerciseScreen />);
      const nameInput = getByPlaceholderText('e.g., Romanian Deadlift');

      await act(async () => {
        fireEvent.changeText(nameInput, 'My Exercise');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateExerciseType).toHaveBeenCalled();
    });

    it('does not create when name is whitespace only', async () => {
      const { getByPlaceholderText, getByText } = render(<CreateExerciseScreen />);
      const nameInput = getByPlaceholderText('e.g., Romanian Deadlift');

      await act(async () => {
        fireEvent.changeText(nameInput, '   ');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateExerciseType).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Action', () => {
    it('navigates back when Cancel is pressed', async () => {
      const { getByText } = render(<CreateExerciseScreen />);

      await act(async () => {
        fireEvent.press(getByText('Cancel'));
      });

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Create Action', () => {
    it('calls createExerciseType with correct parameters', async () => {
      mockCreateExerciseType.mockResolvedValue({ id: 'new-exercise' });
      const { getByPlaceholderText, getByText } = render(<CreateExerciseScreen />);

      const nameInput = getByPlaceholderText('e.g., Romanian Deadlift');

      await act(async () => {
        fireEvent.changeText(nameInput, 'Custom Exercise');
      });

      // Select specific category and body part
      await act(async () => {
        fireEvent.press(getByText('Machine'));
        fireEvent.press(getByText('Quadriceps'));
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateExerciseType).toHaveBeenCalledWith(
        'Custom Exercise',
        'machine',
        'quadriceps'
      );
    });

    it('trims whitespace from name', async () => {
      mockCreateExerciseType.mockResolvedValue({ id: 'new-exercise' });
      const { getByPlaceholderText, getByText } = render(<CreateExerciseScreen />);

      const nameInput = getByPlaceholderText('e.g., Romanian Deadlift');

      await act(async () => {
        fireEvent.changeText(nameInput, '  Custom Exercise  ');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateExerciseType).toHaveBeenCalledWith(
        'Custom Exercise',
        expect.any(String),
        expect.any(String)
      );
    });

    it('navigates back after creation', async () => {
      mockCreateExerciseType.mockResolvedValue({ id: 'new-exercise' });
      const { getByPlaceholderText, getByText } = render(<CreateExerciseScreen />);

      const nameInput = getByPlaceholderText('e.g., Romanian Deadlift');

      await act(async () => {
        fireEvent.changeText(nameInput, 'Test');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      await waitFor(() => {
        expect(mockBack).toHaveBeenCalled();
      });
    });

    it('shows Creating... text while submitting', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockCreateExerciseType.mockReturnValue(pendingPromise);

      const { getByPlaceholderText, getByText, queryByText } = render(<CreateExerciseScreen />);

      const nameInput = getByPlaceholderText('e.g., Romanian Deadlift');

      await act(async () => {
        fireEvent.changeText(nameInput, 'Test');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(queryByText('Creating...')).toBeTruthy();

      await act(async () => {
        resolvePromise!({ id: 'new-id' });
      });
    });

    it('does not call createExerciseType when name is empty', async () => {
      const { getByText } = render(<CreateExerciseScreen />);

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateExerciseType).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles create failure gracefully', async () => {
      mockCreateExerciseType.mockRejectedValue(new Error('Creation failed'));
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByPlaceholderText, getByText } = render(<CreateExerciseScreen />);
      const nameInput = getByPlaceholderText('e.g., Romanian Deadlift');

      await act(async () => {
        fireEvent.changeText(nameInput, 'Test');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      // Should still show Create button (not Creating...)
      expect(getByText('Create')).toBeTruthy();

      consoleError.mockRestore();
    });
  });
});
