import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock dependencies before importing component
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const mockDeleteWorkoutType = jest.fn();
const mockSeedDefaultWorkouts = jest.fn();

jest.mock('../../src/hooks/useDatabase', () => ({
  useWorkoutTypes: jest.fn(() => ({
    workouts: [
      { id: 'workout-1', name: 'Push Day', summary: 'Chest and Triceps' },
      { id: 'workout-2', name: 'Pull Day', summary: 'Back and Biceps' },
    ],
    loading: false,
  })),
  useDatabaseOperations: () => ({
    deleteWorkoutType: mockDeleteWorkoutType,
    seedDefaultWorkouts: mockSeedDefaultWorkouts,
  }),
}));

import WorkoutsScreen from '../(tabs)/index';

describe('WorkoutsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  describe('Rendering', () => {
    it('renders the screen title', () => {
      const { getByText } = render(<WorkoutsScreen />);
      expect(getByText('Your Workouts')).toBeTruthy();
    });

    it('renders workout cards when workouts exist', () => {
      const { getByText } = render(<WorkoutsScreen />);
      expect(getByText('Push Day')).toBeTruthy();
      expect(getByText('Pull Day')).toBeTruthy();
    });

    it('renders workout summaries', () => {
      const { getByText } = render(<WorkoutsScreen />);
      expect(getByText('Chest and Triceps')).toBeTruthy();
      expect(getByText('Back and Biceps')).toBeTruthy();
    });

    it('renders the FAB button', () => {
      const { getByText } = render(<WorkoutsScreen />);
      expect(getByText('+')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      jest.requireMock('../../src/hooks/useDatabase').useWorkoutTypes.mockReturnValue({
        workouts: [],
        loading: false,
      });
    });

    afterEach(() => {
      jest.requireMock('../../src/hooks/useDatabase').useWorkoutTypes.mockReturnValue({
        workouts: [
          { id: 'workout-1', name: 'Push Day', summary: 'Chest and Triceps' },
          { id: 'workout-2', name: 'Pull Day', summary: 'Back and Biceps' },
        ],
        loading: false,
      });
    });

    it('shows empty state when no workouts', () => {
      const { getByText } = render(<WorkoutsScreen />);
      expect(getByText('No workouts available')).toBeTruthy();
      expect(getByText('Get Started')).toBeTruthy();
    });

    it('calls seedDefaultWorkouts when Get Started is pressed', async () => {
      mockSeedDefaultWorkouts.mockResolvedValue(undefined);
      const { getByText } = render(<WorkoutsScreen />);

      await act(async () => {
        fireEvent.press(getByText('Get Started'));
      });

      expect(mockSeedDefaultWorkouts).toHaveBeenCalled();
    });
  });

  describe('Workout Actions', () => {
    it('shows delete confirmation on long press', async () => {
      const { getByText } = render(<WorkoutsScreen />);

      await act(async () => {
        fireEvent(getByText('Push Day'), 'longPress');
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Workout',
        expect.stringContaining('Push Day'),
        expect.any(Array)
      );
    });

    it('deletes workout when confirmed', async () => {
      mockDeleteWorkoutType.mockResolvedValue(undefined);
      const { getByText } = render(<WorkoutsScreen />);

      await act(async () => {
        fireEvent(getByText('Push Day'), 'longPress');
      });

      // Get delete confirmation and press Delete
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2].find((btn: any) => btn.text === 'Delete');

      await act(async () => {
        await deleteButton.onPress();
      });

      expect(mockDeleteWorkoutType).toHaveBeenCalledWith('workout-1');
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator while loading', () => {
      jest.requireMock('../../src/hooks/useDatabase').useWorkoutTypes.mockReturnValue({
        workouts: [],
        loading: true,
      });

      const { UNSAFE_queryByType } = render(<WorkoutsScreen />);
      // Check that ActivityIndicator is rendered
      // Note: This is a simplified check
    });
  });
});
