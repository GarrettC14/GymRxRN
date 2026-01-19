import { create } from 'zustand';

interface AppState {
  // Database initialization state
  isDbInitialized: boolean;
  setDbInitialized: (initialized: boolean) => void;

  // Active workout tracking (matches iOS app's WorkoutType.active)
  activeWorkoutId: string | null;
  setActiveWorkoutId: (id: string | null) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Database
  isDbInitialized: false,
  setDbInitialized: (initialized) => set({ isDbInitialized: initialized }),

  // Active workout
  activeWorkoutId: null,
  setActiveWorkoutId: (id) => set({ activeWorkoutId: id }),

  // Loading state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
