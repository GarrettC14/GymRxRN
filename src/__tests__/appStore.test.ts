import { useAppStore } from '../stores/appStore';

describe('AppStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAppStore.setState({
      isDbInitialized: false,
      activeWorkoutId: null,
      isLoading: false,
    });
  });

  describe('Database Initialization State', () => {
    describe('isDbInitialized', () => {
      it('defaults to false', () => {
        const { isDbInitialized } = useAppStore.getState();
        expect(isDbInitialized).toBe(false);
      });
    });

    describe('setDbInitialized', () => {
      it('sets database initialized to true', () => {
        const { setDbInitialized } = useAppStore.getState();

        setDbInitialized(true);

        const { isDbInitialized } = useAppStore.getState();
        expect(isDbInitialized).toBe(true);
      });

      it('can set database initialized back to false', () => {
        const { setDbInitialized } = useAppStore.getState();

        setDbInitialized(true);
        setDbInitialized(false);

        const { isDbInitialized } = useAppStore.getState();
        expect(isDbInitialized).toBe(false);
      });
    });
  });

  describe('Active Workout Tracking', () => {
    describe('activeWorkoutId', () => {
      it('defaults to null', () => {
        const { activeWorkoutId } = useAppStore.getState();
        expect(activeWorkoutId).toBeNull();
      });
    });

    describe('setActiveWorkoutId', () => {
      it('sets active workout id', () => {
        const { setActiveWorkoutId } = useAppStore.getState();

        setActiveWorkoutId('workout-123');

        const { activeWorkoutId } = useAppStore.getState();
        expect(activeWorkoutId).toBe('workout-123');
      });

      it('can clear active workout id by setting to null', () => {
        const { setActiveWorkoutId } = useAppStore.getState();

        setActiveWorkoutId('workout-123');
        setActiveWorkoutId(null);

        const { activeWorkoutId } = useAppStore.getState();
        expect(activeWorkoutId).toBeNull();
      });

      it('can change active workout id', () => {
        const { setActiveWorkoutId } = useAppStore.getState();

        setActiveWorkoutId('workout-1');
        setActiveWorkoutId('workout-2');

        const { activeWorkoutId } = useAppStore.getState();
        expect(activeWorkoutId).toBe('workout-2');
      });
    });
  });

  describe('Loading State', () => {
    describe('isLoading', () => {
      it('defaults to false', () => {
        const { isLoading } = useAppStore.getState();
        expect(isLoading).toBe(false);
      });
    });

    describe('setIsLoading', () => {
      it('sets loading to true', () => {
        const { setIsLoading } = useAppStore.getState();

        setIsLoading(true);

        const { isLoading } = useAppStore.getState();
        expect(isLoading).toBe(true);
      });

      it('sets loading back to false', () => {
        const { setIsLoading } = useAppStore.getState();

        setIsLoading(true);
        setIsLoading(false);

        const { isLoading } = useAppStore.getState();
        expect(isLoading).toBe(false);
      });
    });
  });

  describe('State Independence', () => {
    it('setting one state does not affect others', () => {
      const store = useAppStore.getState();

      store.setDbInitialized(true);

      const state = useAppStore.getState();
      expect(state.isDbInitialized).toBe(true);
      expect(state.activeWorkoutId).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('multiple state updates work correctly', () => {
      const store = useAppStore.getState();

      store.setDbInitialized(true);
      store.setActiveWorkoutId('workout-abc');
      store.setIsLoading(true);

      const state = useAppStore.getState();
      expect(state.isDbInitialized).toBe(true);
      expect(state.activeWorkoutId).toBe('workout-abc');
      expect(state.isLoading).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    it('simulates app initialization flow', () => {
      const store = useAppStore.getState();

      // App starts - loading begins
      store.setIsLoading(true);
      expect(useAppStore.getState().isLoading).toBe(true);

      // Database initializes
      store.setDbInitialized(true);
      expect(useAppStore.getState().isDbInitialized).toBe(true);

      // Loading completes
      store.setIsLoading(false);
      expect(useAppStore.getState().isLoading).toBe(false);
    });

    it('simulates starting a workout', () => {
      const store = useAppStore.getState();

      // App is initialized
      store.setDbInitialized(true);

      // No active workout initially
      expect(useAppStore.getState().activeWorkoutId).toBeNull();

      // User starts a workout
      store.setActiveWorkoutId('push-day-workout');
      expect(useAppStore.getState().activeWorkoutId).toBe('push-day-workout');

      // User completes workout
      store.setActiveWorkoutId(null);
      expect(useAppStore.getState().activeWorkoutId).toBeNull();
    });

    it('simulates switching between workouts', () => {
      const store = useAppStore.getState();

      store.setActiveWorkoutId('workout-1');
      expect(useAppStore.getState().activeWorkoutId).toBe('workout-1');

      // Directly switch to another workout
      store.setActiveWorkoutId('workout-2');
      expect(useAppStore.getState().activeWorkoutId).toBe('workout-2');
    });
  });

  describe('Subscription Behavior', () => {
    it('can subscribe to state changes', () => {
      const callback = jest.fn();

      // Subscribe to store changes
      const unsubscribe = useAppStore.subscribe(callback);

      // Make a state change
      useAppStore.getState().setIsLoading(true);

      expect(callback).toHaveBeenCalled();

      unsubscribe();
    });

    it('unsubscribe stops notifications', () => {
      const callback = jest.fn();

      const unsubscribe = useAppStore.subscribe(callback);
      unsubscribe();

      // Make a state change after unsubscribe
      useAppStore.getState().setIsLoading(true);

      // Callback should not have been called again
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Selector Usage', () => {
    it('can use selector to get specific state', () => {
      useAppStore.getState().setDbInitialized(true);

      // Simulate selector usage
      const isDbInitialized = useAppStore.getState().isDbInitialized;
      expect(isDbInitialized).toBe(true);
    });

    it('selector returns updated state after mutation', () => {
      const store = useAppStore.getState();

      expect(store.activeWorkoutId).toBeNull();

      store.setActiveWorkoutId('new-workout');

      // Get fresh state
      const updatedStore = useAppStore.getState();
      expect(updatedStore.activeWorkoutId).toBe('new-workout');
    });
  });
});
