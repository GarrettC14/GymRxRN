import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CartesianChart, Bar, Line } from 'victory-native';
import {
  useWorkoutInstanceExercises,
  useDatabaseOperations,
} from '../src/hooks/useDatabase';
import {
  ExerciseCategoryLabels,
  BodyPartLabels,
  WeightTypeLabels,
  BodyPart,
} from '../src/types/enums';
import { formatDate, findMaxWeight, calculateBestOneRepMax } from '../src/utils';
import ExerciseInstance from '../src/database/models/ExerciseInstance';
import ExerciseType from '../src/database/models/ExerciseType';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WorkoutAnalyticsScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    date: string;
  }>();
  const router = useRouter();
  const { exercises, loading } = useWorkoutInstanceExercises(params.id || null);
  const { getExerciseType } = useDatabaseOperations();
  const [exerciseDetails, setExerciseDetails] = useState<Map<string, ExerciseType>>(
    new Map()
  );
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

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

  // Get unique exercise types for chart navigation
  const uniqueExerciseTypes = useMemo(() => {
    const seen = new Set<string>();
    const unique: ExerciseType[] = [];
    exercises.forEach((ex) => {
      const type = exerciseDetails.get(ex.id);
      if (type && !seen.has(type.id)) {
        seen.add(type.id);
        unique.push(type);
      }
    });
    return unique.sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, exerciseDetails]);

  // Calculate sets by body part
  const setsByBodyPart = useMemo(() => {
    const counts: Record<string, number> = {};
    exercises.forEach((ex) => {
      const type = exerciseDetails.get(ex.id);
      if (type) {
        const bodyPart = BodyPartLabels[type.bodyPart] || 'Other';
        counts[bodyPart] = (counts[bodyPart] || 0) + ex.repsPerSet.length;
      }
    });
    return Object.entries(counts).map(([bodyPart, sets]) => ({
      bodyPart,
      sets,
    }));
  }, [exercises, exerciseDetails]);

  const handleExercisePress = (exerciseTypeId: string) => {
    router.push({
      pathname: '/exercise-analytics' as const,
      params: { exerciseTypeId },
    } as any);
  };

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

          {/* Sets by Body Part Chart */}
          {setsByBodyPart.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Sets by Body Part</Text>
              <View style={styles.chartContainer}>
                <CartesianChart
                  data={setsByBodyPart}
                  xKey="bodyPart"
                  yKeys={['sets']}
                  domainPadding={{ left: 40, right: 40, top: 20 }}
                >
                  {({ points, chartBounds }) => (
                    <Bar
                      points={points.sets}
                      chartBounds={chartBounds}
                      color="#007AFF"
                      roundedCorners={{ topLeft: 4, topRight: 4 }}
                    />
                  )}
                </CartesianChart>
              </View>
            </View>
          )}

          {/* Exercise Summary Cards */}
          <Text style={styles.sectionTitle}>Exercise Details</Text>
          {exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No exercises recorded</Text>
            </View>
          ) : (
            exercises.map((exercise: ExerciseInstance) => {
              const exerciseType = exerciseDetails.get(exercise.id);
              if (!exerciseType) return null;

              const maxWeight = findMaxWeight(exercise.weightsPerSet);
              const estimated1RM = calculateBestOneRepMax(
                exercise.repsPerSet,
                exercise.weightsPerSet
              );

              return (
                <Pressable
                  key={exercise.id}
                  style={styles.exerciseCard}
                  onPress={() => handleExercisePress(exerciseType.id)}
                >
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exerciseType.name}</Text>
                    <Text style={styles.exerciseDetail}>
                      {ExerciseCategoryLabels[exerciseType.category]} •{' '}
                      {BodyPartLabels[exerciseType.bodyPart]}
                    </Text>
                  </View>

                  {/* Summary Stats */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {exercise.repsPerSet.length}
                      </Text>
                      <Text style={styles.statLabel}>Sets</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{maxWeight}</Text>
                      <Text style={styles.statLabel}>
                        Max {WeightTypeLabels[exercise.weightType]}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {estimated1RM > 0 ? Math.round(estimated1RM) : '-'}
                      </Text>
                      <Text style={styles.statLabel}>Est. 1RM</Text>
                    </View>
                  </View>

                  {/* Sets Table */}
                  <View style={styles.setsHeader}>
                    <Text style={[styles.headerText, styles.setColumn]}>Set</Text>
                    <Text style={[styles.headerText, styles.dataColumn]}>
                      {WeightTypeLabels[exercise.weightType]}
                    </Text>
                    <Text style={[styles.headerText, styles.dataColumn]}>Reps</Text>
                  </View>
                  {exercise.repsPerSet.map((reps, index) => (
                    <View key={index} style={styles.setRow}>
                      <Text style={[styles.setText, styles.setColumn]}>
                        {index + 1}
                      </Text>
                      <Text style={[styles.setText, styles.dataColumn]}>
                        {exercise.weightsPerSet[index] || 0}
                      </Text>
                      <Text style={[styles.setText, styles.dataColumn]}>{reps}</Text>
                    </View>
                  ))}

                  {exercise.note ? (
                    <View style={styles.noteContainer}>
                      <Text style={styles.noteLabel}>Note:</Text>
                      <Text style={styles.noteText}>{exercise.note}</Text>
                    </View>
                  ) : null}

                  <Text style={styles.tapHint}>Tap to view exercise history</Text>
                </Pressable>
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
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  chartTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    height: 200,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
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
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2C2C2E',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#007AFF',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
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
  tapHint: {
    color: '#007AFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
