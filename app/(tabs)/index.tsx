import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 6;
const CONTAINER_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CONTAINER_PADDING * 2 - CARD_MARGIN * 4) / 2;
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWorkoutTypes } from '../../src/hooks/useDatabase';
import { useDatabaseOperations } from '../../src/hooks/useDatabase';
import WorkoutType from '../../src/database/models/WorkoutType';

export default function WorkoutsScreen() {
  const router = useRouter();
  const { workouts, loading } = useWorkoutTypes();
  const { deleteWorkoutType, seedDefaultWorkouts } = useDatabaseOperations();
  const [seeding, setSeeding] = useState(false);

  const handleCreateWorkout = () => {
    router.push('/create-workout');
  };

  const handleWorkoutPress = (workout: WorkoutType) => {
    router.push({
      pathname: '/edit-workout',
      params: { id: workout.id, name: workout.name },
    });
  };

  const handleStartWorkout = (workout: WorkoutType) => {
    router.push({
      pathname: '/log-workout',
      params: { workoutTypeId: workout.id, workoutName: workout.name },
    });
  };

  const handleDeleteWorkout = (workout: WorkoutType) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${workout.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkoutType(workout.id);
            } catch (error) {
              console.error('Failed to delete workout:', error);
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const handleGetStarted = async () => {
    setSeeding(true);
    try {
      await seedDefaultWorkouts();
    } catch (error) {
      console.error('Failed to seed workouts:', error);
      Alert.alert('Error', 'Failed to create starter workouts');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Your Workouts</Text>

          {loading || seeding ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              {seeding && (
                <Text style={styles.loadingText}>Creating starter workouts...</Text>
              )}
            </View>
          ) : workouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No workouts available</Text>
              <Text style={styles.emptyText}>
                Start with our pre-built workout templates or create your own.
              </Text>
              <Pressable style={styles.getStartedButton} onPress={handleGetStarted}>
                <Text style={styles.getStartedText}>Get Started</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.workoutGrid}>
              {workouts.map((workout: WorkoutType) => (
                <Pressable
                  key={workout.id}
                  style={styles.workoutCard}
                  onPress={() => handleWorkoutPress(workout)}
                  onLongPress={() => handleDeleteWorkout(workout)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.icon}>🏋️</Text>
                    </View>
                    <Pressable
                      style={styles.playButton}
                      onPress={() => handleStartWorkout(workout)}
                    >
                      <Text style={styles.playIcon}>▶</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.workoutName} numberOfLines={2}>
                    {workout.name}
                  </Text>
                  {workout.summary ? (
                    <Text style={styles.workoutSummary} numberOfLines={2}>
                      {workout.summary}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          )}
        </View>
        {/* Bottom padding for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating action button */}
      <Pressable style={styles.fab} onPress={handleCreateWorkout}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    paddingVertical: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginTop: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  getStartedButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  workoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -CARD_MARGIN,
  },
  workoutCard: {
    width: CARD_WIDTH,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    margin: CARD_MARGIN,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  playButton: {
    width: 36,
    height: 36,
    backgroundColor: '#007AFF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 2,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutSummary: {
    color: '#8E8E93',
    fontSize: 13,
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
  },
});
