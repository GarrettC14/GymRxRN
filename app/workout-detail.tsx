import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useWorkoutInstanceExercises,
  useDatabaseOperations,
} from '../src/hooks/useDatabase';
import {
  ExerciseCategoryLabels,
  BodyPartLabels,
  WeightTypeLabels,
} from '../src/types/enums';
import { formatDate } from '../src/utils';
import ExerciseInstance from '../src/database/models/ExerciseInstance';
import ExerciseType from '../src/database/models/ExerciseType';

export default function WorkoutDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    date: string;
  }>();
  const router = useRouter();
  const { exercises, loading } = useWorkoutInstanceExercises(params.id || null);
  const { getExerciseType } = useDatabaseOperations();

  const handleViewAnalytics = () => {
    router.push({
      pathname: '/workout-analytics' as const,
      params: {
        id: params.id,
        name: params.name,
        date: params.date,
      },
    } as any);
  };
  const [exerciseDetails, setExerciseDetails] = useState<
    Map<string, ExerciseType>
  >(new Map());

  useEffect(() => {
    async function fetchDetails() {
      const details = new Map<string, ExerciseType>();
      for (const ex of exercises) {
        try {
          const exerciseType = await getExerciseType(ex.exerciseTypeId);
          details.set(ex.id, exerciseType);
        } catch (error) {
          console.error('Failed to fetch exercise type:', error);
        }
      }
      setExerciseDetails(details);
    }
    if (exercises.length > 0) {
      fetchDetails();
    }
  }, [exercises, getExerciseType]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.workoutName}>{params.name}</Text>
          <Text style={styles.dateText}>
            {params.date ? formatDate(new Date(params.date)) : ''}
          </Text>

          {/* Analytics Button */}
          <Pressable style={styles.analyticsButton} onPress={handleViewAnalytics}>
            <Ionicons name="bar-chart-outline" size={20} color="#007AFF" />
            <Text style={styles.analyticsButtonText}>View Analytics</Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </Pressable>

          {exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No exercises recorded</Text>
            </View>
          ) : (
            exercises.map((exercise: ExerciseInstance) => {
              const exerciseType = exerciseDetails.get(exercise.id);
              if (!exerciseType) return null;

              return (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exerciseType.name}</Text>
                    <Text style={styles.exerciseDetail}>
                      {ExerciseCategoryLabels[exerciseType.category]} •{' '}
                      {BodyPartLabels[exerciseType.bodyPart]}
                    </Text>
                  </View>

                  {/* Sets header */}
                  <View style={styles.setsHeader}>
                    <Text style={[styles.headerText, styles.setColumn]}>
                      Set
                    </Text>
                    <Text style={[styles.headerText, styles.dataColumn]}>
                      {WeightTypeLabels[exercise.weightType]}
                    </Text>
                    <Text style={[styles.headerText, styles.dataColumn]}>
                      Reps
                    </Text>
                  </View>

                  {/* Sets data */}
                  {exercise.repsPerSet.map((reps, index) => (
                    <View key={index} style={styles.setRow}>
                      <Text style={[styles.setText, styles.setColumn]}>
                        {index + 1}
                      </Text>
                      <Text style={[styles.setText, styles.dataColumn]}>
                        {exercise.weightsPerSet[index] || 0}
                      </Text>
                      <Text style={[styles.setText, styles.dataColumn]}>
                        {reps}
                      </Text>
                    </View>
                  ))}

                  {exercise.note ? (
                    <View style={styles.noteContainer}>
                      <Text style={styles.noteLabel}>Note:</Text>
                      <Text style={styles.noteText}>{exercise.note}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    color: '#8E8E93',
    fontSize: 16,
    marginBottom: 16,
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  analyticsButtonText: {
    flex: 1,
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  exerciseCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    marginBottom: 16,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseDetail: {
    color: '#8E8E93',
    fontSize: 14,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  headerText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  setColumn: {
    width: 40,
  },
  dataColumn: {
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2C2C2E',
  },
  setText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  noteContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#2C2C2E',
  },
  noteLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
});
