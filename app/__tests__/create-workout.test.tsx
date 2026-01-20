import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

// Mock dependencies before importing component
const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: mockBack,
    replace: mockReplace,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const mockCreateWorkoutType = jest.fn();

jest.mock('../../src/hooks/useDatabase', () => ({
  useDatabaseOperations: () => ({
    createWorkoutType: mockCreateWorkoutType,
  }),
}));

import CreateWorkoutScreen from '../create-workout';

describe('CreateWorkoutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the workout name input', () => {
      const { getByPlaceholderText } = render(<CreateWorkoutScreen />);
      expect(getByPlaceholderText('e.g., Push Day, Leg Day')).toBeTruthy();
    });

    it('renders the description input', () => {
      const { getByPlaceholderText } = render(<CreateWorkoutScreen />);
      expect(getByPlaceholderText('Brief description of this workout...')).toBeTruthy();
    });

    it('renders the workout name label', () => {
      const { getByText } = render(<CreateWorkoutScreen />);
      expect(getByText('Workout Name')).toBeTruthy();
    });

    it('renders the description label', () => {
      const { getByText } = render(<CreateWorkoutScreen />);
      expect(getByText('Description (optional)')).toBeTruthy();
    });

    it('renders Cancel button', () => {
      const { getByText } = render(<CreateWorkoutScreen />);
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('renders Create button', () => {
      const { getByText } = render(<CreateWorkoutScreen />);
      expect(getByText('Create')).toBeTruthy();
    });

    it('renders without crashing', () => {
      const { toJSON } = render(<CreateWorkoutScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Form Input', () => {
    it('updates workout name on text change', async () => {
      const { getByPlaceholderText } = render(<CreateWorkoutScreen />);
      const nameInput = getByPlaceholderText('e.g., Push Day, Leg Day');

      await act(async () => {
        fireEvent.changeText(nameInput, 'My Workout');
      });

      expect(nameInput.props.value).toBe('My Workout');
    });

    it('updates description on text change', async () => {
      const { getByPlaceholderText } = render(<CreateWorkoutScreen />);
      const descInput = getByPlaceholderText('Brief description of this workout...');

      await act(async () => {
        fireEvent.changeText(descInput, 'Test description');
      });

      expect(descInput.props.value).toBe('Test description');
    });
  });

  describe('Create Button State', () => {
    it('does not create when name is empty', async () => {
      const { getByText } = render(<CreateWorkoutScreen />);

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      // The create function should not be called when name is empty
      expect(mockCreateWorkoutType).not.toHaveBeenCalled();
    });

    it('creates when name has content', async () => {
      mockCreateWorkoutType.mockResolvedValue({ id: 'new-workout-id', name: 'My Workout' });
      const { getByPlaceholderText, getByText } = render(<CreateWorkoutScreen />);
      const nameInput = getByPlaceholderText('e.g., Push Day, Leg Day');

      await act(async () => {
        fireEvent.changeText(nameInput, 'My Workout');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateWorkoutType).toHaveBeenCalled();
    });

    it('does not create when name is only whitespace', async () => {
      const { getByPlaceholderText, getByText } = render(<CreateWorkoutScreen />);
      const nameInput = getByPlaceholderText('e.g., Push Day, Leg Day');

      await act(async () => {
        fireEvent.changeText(nameInput, '   ');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateWorkoutType).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Action', () => {
    it('navigates back when Cancel is pressed', async () => {
      const { getByText } = render(<CreateWorkoutScreen />);

      await act(async () => {
        fireEvent.press(getByText('Cancel'));
      });

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Create Action', () => {
    it('calls createWorkoutType with correct parameters', async () => {
      mockCreateWorkoutType.mockResolvedValue({ id: 'new-workout-id', name: 'Test Workout' });
      const { getByPlaceholderText, getByText } = render(<CreateWorkoutScreen />);

      const nameInput = getByPlaceholderText('e.g., Push Day, Leg Day');
      const descInput = getByPlaceholderText('Brief description of this workout...');

      await act(async () => {
        fireEvent.changeText(nameInput, 'Test Workout');
        fireEvent.changeText(descInput, 'Test Description');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateWorkoutType).toHaveBeenCalledWith('Test Workout', 'Test Description');
    });

    it('trims whitespace from inputs', async () => {
      mockCreateWorkoutType.mockResolvedValue({ id: 'new-workout-id', name: 'Test Workout' });
      const { getByPlaceholderText, getByText } = render(<CreateWorkoutScreen />);

      const nameInput = getByPlaceholderText('e.g., Push Day, Leg Day');
      const descInput = getByPlaceholderText('Brief description of this workout...');

      await act(async () => {
        fireEvent.changeText(nameInput, '  Test Workout  ');
        fireEvent.changeText(descInput, '  Test Description  ');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateWorkoutType).toHaveBeenCalledWith('Test Workout', 'Test Description');
    });

    it('navigates to edit-workout after creation', async () => {
      mockCreateWorkoutType.mockResolvedValue({ id: 'new-workout-id', name: 'Test Workout' });
      const { getByPlaceholderText, getByText } = render(<CreateWorkoutScreen />);

      const nameInput = getByPlaceholderText('e.g., Push Day, Leg Day');

      await act(async () => {
        fireEvent.changeText(nameInput, 'Test Workout');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith({
          pathname: '/edit-workout',
          params: { id: 'new-workout-id', name: 'Test Workout' },
        });
      });
    });

    it('shows Creating... text while submitting', async () => {
      // Create a promise that doesn't resolve immediately
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockCreateWorkoutType.mockReturnValue(pendingPromise);

      const { getByPlaceholderText, getByText, queryByText } = render(<CreateWorkoutScreen />);

      const nameInput = getByPlaceholderText('e.g., Push Day, Leg Day');

      await act(async () => {
        fireEvent.changeText(nameInput, 'Test Workout');
      });

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(queryByText('Creating...')).toBeTruthy();

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ id: 'new-id', name: 'Test' });
      });
    });

    it('does not call createWorkoutType when name is empty', async () => {
      const { getByText } = render(<CreateWorkoutScreen />);

      await act(async () => {
        fireEvent.press(getByText('Create'));
      });

      expect(mockCreateWorkoutType).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles create failure gracefully', async () => {
      mockCreateWorkoutType.mockRejectedValue(new Error('Creation failed'));
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByPlaceholderText, getByText } = render(<CreateWorkoutScreen />);
      const nameInput = getByPlaceholderText('e.g., Push Day, Leg Day');

      await act(async () => {
        fireEvent.changeText(nameInput, 'Test Workout');
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
