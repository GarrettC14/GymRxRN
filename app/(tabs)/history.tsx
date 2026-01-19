import { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  useWorkoutHistory,
  useDatabaseOperations,
} from '../../src/hooks/useDatabase';
import { formatDate, formatMonthYear, groupBy } from '../../src/utils';
import WorkoutInstance from '../../src/database/models/WorkoutInstance';

export default function HistoryScreen() {
  const router = useRouter();
  const { workouts, loading } = useWorkoutHistory();
  const { deleteWorkoutInstance } = useDatabaseOperations();

  // Group workouts by month/year
  const groupedWorkouts = useMemo(() => {
    const groups = groupBy(workouts, (workout: WorkoutInstance) =>
      formatMonthYear(workout.date)
    );

    // Get unique months in order (most recent first)
    const months = [...new Set(workouts.map((w) => formatMonthYear(w.date)))];

    return months.map((month) => ({
      month,
      workouts: groups[month] || [],
    }));
  }, [workouts]);

  const handleWorkoutPress = (workout: WorkoutInstance) => {
    router.push({
      pathname: '/workout-detail',
      params: {
        id: workout.id,
        name: workout.name,
        date: workout.date.toISOString(),
      },
    });
  };

  const handleDeleteWorkout = (workout: WorkoutInstance) => {
    Alert.alert(
      'Delete Workout',
      `Delete "${workout.name}" from ${formatDate(workout.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkoutInstance(workout.id);
            } catch (error) {
              console.error('Failed to delete workout:', error);
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>History</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : workouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No workouts logged yet.{'\n'}Complete a workout to see it here.
              </Text>
            </View>
          ) : (
            groupedWorkouts.map(({ month, workouts: monthWorkouts }) => (
              <View key={month}>
                <Text style={styles.monthHeader}>{month}</Text>

                {monthWorkouts.map((workout: WorkoutInstance) => (
                  <Pressable
                    key={workout.id}
                    style={styles.historyCard}
                    onPress={() => handleWorkoutPress(workout)}
                    onLongPress={() => handleDeleteWorkout(workout)}
                  >
                    <View style={styles.iconContainer}>
                      <Text style={styles.icon}>🏋️</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.workoutName}>{workout.name}</Text>
                      <Text style={styles.workoutDate}>
                        {formatDate(workout.date)}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  monthHeader: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  historyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  workoutDate: {
    color: '#8E8E93',
    fontSize: 14,
  },
  chevron: {
    color: '#8E8E93',
    fontSize: 24,
  },
});
