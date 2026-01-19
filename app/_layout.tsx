import '../global.css';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { initializeDatabase } from '../src/database';
import { useAppStore } from '../src/stores/appStore';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export const unstable_settings = {
  anchor: '(tabs)',
};

function DatabaseInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const setDbInitialized = useAppStore((state) => state.setDbInitialized);

  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase();
        setDbInitialized(true);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Still set ready to show the app even if DB fails
        setIsReady(true);
      }
    }
    init();
  }, [setDbInitialized]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DarkTheme}>
          <DatabaseInitializer>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="create-workout"
                options={{
                  presentation: 'modal',
                  title: 'New Workout',
                  headerStyle: { backgroundColor: '#1A1A1A' },
                  headerTintColor: '#FFFFFF',
                }}
              />
              <Stack.Screen
                name="edit-workout"
                options={{
                  presentation: 'modal',
                  title: 'Edit Workout',
                  headerStyle: { backgroundColor: '#1A1A1A' },
                  headerTintColor: '#FFFFFF',
                }}
              />
              <Stack.Screen
                name="add-exercise"
                options={{
                  presentation: 'modal',
                  title: 'Add Exercise',
                  headerStyle: { backgroundColor: '#1A1A1A' },
                  headerTintColor: '#FFFFFF',
                }}
              />
              <Stack.Screen
                name="log-workout"
                options={{
                  title: 'Log Workout',
                  headerStyle: { backgroundColor: '#1A1A1A' },
                  headerTintColor: '#FFFFFF',
                }}
              />
              <Stack.Screen
                name="workout-detail"
                options={{
                  title: 'Workout',
                  headerStyle: { backgroundColor: '#1A1A1A' },
                  headerTintColor: '#FFFFFF',
                }}
              />
              <Stack.Screen
                name="create-exercise"
                options={{
                  presentation: 'modal',
                  title: 'Create Exercise',
                  headerStyle: { backgroundColor: '#1A1A1A' },
                  headerTintColor: '#FFFFFF',
                }}
              />
              <Stack.Screen
                name="workout-analytics"
                options={{
                  title: 'Workout Analytics',
                  headerStyle: { backgroundColor: '#1A1A1A' },
                  headerTintColor: '#FFFFFF',
                }}
              />
              <Stack.Screen
                name="exercise-analytics"
                options={{
                  title: 'Exercise Analytics',
                  headerStyle: { backgroundColor: '#1A1A1A' },
                  headerTintColor: '#FFFFFF',
                }}
              />
              <Stack.Screen
                name="edit-exercise"
                options={{
                  presentation: 'modal',
                  title: 'Edit Exercise',
                  headerStyle: { backgroundColor: '#1A1A1A' },
                  headerTintColor: '#FFFFFF',
                }}
              />
            </Stack>
          </DatabaseInitializer>
          <StatusBar style="light" />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
