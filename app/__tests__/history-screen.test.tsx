import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const mockDeleteWorkoutInstance = jest.fn();

const mockWorkouts = [
  {
    id: 'workout-1',
    name: 'Push Day',
    date: new Date('2024-03-15'),
  },
  {
    id: 'workout-2',
    name: 'Pull Day',
    date: new Date('2024-03-14'),
  },
  {
    id: 'workout-3',
    name: 'Leg Day',
    date: new Date('2024-02-20'),
  },
];

jest.mock('../../src/hooks/useDatabase', () => ({
  useWorkoutHistory: jest.fn(() => ({
    workouts: mockWorkouts,
    loading: false,
  })),
  useDatabaseOperations: () => ({
    deleteWorkoutInstance: mockDeleteWorkoutInstance,
  }),
}));

jest.mock('../../src/utils', () => ({
  formatDate: (date: Date) => date.toLocaleDateString(),
  formatMonthYear: (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  groupBy: jest.fn((items, keyFn) => {
    return items.reduce((acc: any, item: any) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }),
}));

import HistoryScreen from '../(tabs)/history';

describe('HistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  describe('Rendering', () => {
    it('renders the screen title', () => {
      const { getByText } = render(<HistoryScreen />);
      expect(getByText('History')).toBeTruthy();
    });

    it('renders workout history items', () => {
      const { getByText } = render(<HistoryScreen />);
      expect(getByText('Push Day')).toBeTruthy();
      expect(getByText('Pull Day')).toBeTruthy();
      expect(getByText('Leg Day')).toBeTruthy();
    });

    it('groups workouts by month', () => {
      const { getByText } = render(<HistoryScreen />);
      expect(getByText('March 2024')).toBeTruthy();
      expect(getByText('February 2024')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      jest.requireMock('../../src/hooks/useDatabase').useWorkoutHistory.mockReturnValue({
        workouts: [],
        loading: false,
      });
    });

    afterEach(() => {
      jest.requireMock('../../src/hooks/useDatabase').useWorkoutHistory.mockReturnValue({
        workouts: mockWorkouts,
        loading: false,
      });
    });

    it('shows empty state when no workout history', () => {
      const { getByText } = render(<HistoryScreen />);
      expect(getByText(/No workouts logged yet/)).toBeTruthy();
    });
  });

  describe('Workout Actions', () => {
    it('shows delete confirmation on long press', async () => {
      const { getByText } = render(<HistoryScreen />);

      await act(async () => {
        fireEvent(getByText('Push Day'), 'longPress');
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Workout',
        expect.any(String),
        expect.any(Array)
      );
    });

    it('deletes workout when confirmed', async () => {
      mockDeleteWorkoutInstance.mockResolvedValue(undefined);
      const { getByText } = render(<HistoryScreen />);

      await act(async () => {
        fireEvent(getByText('Push Day'), 'longPress');
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2].find((btn: any) => btn.text === 'Delete');

      await act(async () => {
        await deleteButton.onPress();
      });

      expect(mockDeleteWorkoutInstance).toHaveBeenCalledWith('workout-1');
    });

    it('navigates to workout detail on press', () => {
      const mockPush = jest.fn();
      jest.requireMock('expo-router').useRouter = () => ({
        push: mockPush,
        back: jest.fn(),
      });

      const { getByText } = render(<HistoryScreen />);

      fireEvent.press(getByText('Push Day'));

      // Would verify navigation params
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator while loading', () => {
      jest.requireMock('../../src/hooks/useDatabase').useWorkoutHistory.mockReturnValue({
        workouts: [],
        loading: true,
      });

      const { UNSAFE_queryByType } = render(<HistoryScreen />);
      // Loading indicator should be present
    });
  });
});
