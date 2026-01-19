import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  useWorkoutExercises,
  useDatabaseOperations,
} from '../src/hooks/useDatabase';
import { useWorkoutStore } from '../src/stores/workoutStore';
import {
  ExerciseCategoryLabels,
  BodyPartLabels,
  WeightTypeLabels,
} from '../src/types/enums';
import ExerciseInstance from '../src/database/models/ExerciseInstance';
import ExerciseType from '../src/database/models/ExerciseType';

interface SetData {
  reps: string;
  weight: string;
}

interface ExerciseLogState {
  sets: SetData[];
  note: string;
}

export default function LogWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    workoutTypeId: string;
    workoutName: string;
  }>();
  const { exercises, loading } = useWorkoutExercises(
    params.workoutTypeId || null
  );
  const {
    createWorkoutInstance,
    addExerciseToWorkoutInstance,
    getExerciseType,
  } = useDatabaseOperations();
  const preferredWeightType = useWorkoutStore(
    (state) => state.preferredWeightType
  );

  const [exerciseDetails, setExerciseDetails] = useState<
    Map<string, ExerciseType>
  >(new Map());
  const [exerciseLogs, setExerciseLogs] = useState<Map<string, ExerciseLogState>>(
    new Map()
  );
  const [isSaving, setIsSaving] = useState(false);

  // Fetch exercise type details and initialize log state
  useEffect(() => {
    async function initialize() {
      const details = new Map<string, ExerciseType>();
      const logs = new Map<string, ExerciseLogState>();

      for (const ex of exercises) {
        try {
          const exerciseType = await getExerciseType(ex.exerciseTypeId);
          details.set(ex.id, exerciseType);

          // Initialize sets based on the template
          const initialSets: SetData[] = Array(ex.sets)
            .fill(null)
            .map(() => ({
              reps: ex.reps.toString(),
              weight: ex.weight > 0 ? ex.weight.toString() : '',
            }));

          logs.set(ex.id, {
            sets: initialSets,
            note: '',
          });
        } catch (error) {
          console.error('Failed to fetch exercise type:', error);
        }
      }

      setExerciseDetails(details);
      setExerciseLogs(logs);
    }

    if (exercises.length > 0) {
      initialize();
    }
  }, [exercises, getExerciseType]);

  const updateSet = (
    exerciseId: string,
    setIndex: number,
    field: 'reps' | 'weight',
    value: string
  ) => {
    setExerciseLogs((prev) => {
      const newLogs = new Map(prev);
      const log = newLogs.get(exerciseId);
      if (log) {
        const newSets = [...log.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        newLogs.set(exerciseId, { ...log, sets: newSets });
      }
      return newLogs;
    });
  };

  const addSet = (exerciseId: string) => {
    setExerciseLogs((prev) => {
      const newLogs = new Map(prev);
      const log = newLogs.get(exerciseId);
      if (log) {
        const lastSet = log.sets[log.sets.length - 1] || { reps: '10', weight: '' };
        newLogs.set(exerciseId, {
          ...log,
          sets: [...log.sets, { ...lastSet }],
        });
      }
      return newLogs;
    });
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExerciseLogs((prev) => {
      const newLogs = new Map(prev);
      const log = newLogs.get(exerciseId);
      if (log && log.sets.length > 1) {
        const newSets = log.sets.filter((_, i) => i !== setIndex);
        newLogs.set(exerciseId, { ...log, sets: newSets });
      }
      return newLogs;
    });
  };

  const saveWorkout = async () => {
    setIsSaving(true);
    try {
      // Create the workout instance
      const workoutInstance = await createWorkoutInstance(
        params.workoutName || 'Workout',
        '',
        new Date()
      );

      // Add each exercise with logged data
      let position = 0;
      for (const exercise of exercises) {
        const log = exerciseLogs.get(exercise.id);
        if (!log) continue;

        // Filter out sets where reps or weight is 0 (empty/incomplete sets)
        const validSets = log.sets.filter((s) => {
          const reps = parseInt(s.reps) || 0;
          const weight = parseFloat(s.weight) || 0;
          return reps > 0 && weight > 0;
        });

        // Skip this exercise entirely if no valid sets
        if (validSets.length === 0) continue;

        const repsPerSet = validSets.map((s) => parseInt(s.reps) || 0);
        const weightsPerSet = validSets.map((s) => parseFloat(s.weight) || 0);

        await addExerciseToWorkoutInstance(
          workoutInstance.id,
          exercise.exerciseTypeId,
          position,
          {
            sets: validSets.length,
            reps: repsPerSet[0] || 10,
            weight: weightsPerSet[0] || 0,
            weightType: preferredWeightType,
            repsPerSet,
            weightsPerSet,
            note: log.note,
          }
        );
        position++;
      }

      Alert.alert('Workout Saved', 'Great job completing your workout!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Failed to save workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
      setIsSaving(false);
    }
  };

  const handleSaveWorkout = () => {
    Alert.alert(
      'Complete Workout?',
      'Are you sure you want to finish and save this workout?',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Complete',
          style: 'default',
          onPress: saveWorkout,
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Workout?',
      'Are you sure you want to cancel this workout? Your progress will be lost.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.workoutName}>{params.workoutName}</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>

            {exercises.map((exercise: ExerciseInstance) => {
              const exerciseType = exerciseDetails.get(exercise.id);
              const log = exerciseLogs.get(exercise.id);

              if (!exerciseType || !log) return null;

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
                    <Text style={[styles.headerText, styles.inputColumn]}>
                      {WeightTypeLabels[preferredWeightType]}
                    </Text>
                    <Text style={[styles.headerText, styles.inputColumn]}>
                      Reps
                    </Text>
                    <View style={styles.actionColumn} />
                  </View>

                  {/* Sets */}
                  {log.sets.map((set, index) => (
                    <View key={index} style={styles.setRow}>
                      <Text style={[styles.setText, styles.setColumn]}>
                        {index + 1}
                      </Text>
                      <TextInput
                        style={[styles.setInput, styles.inputColumn]}
                        value={set.weight}
                        onChangeText={(v) =>
                          updateSet(exercise.id, index, 'weight', v)
                        }
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor="#8E8E93"
                      />
                      <TextInput
                        style={[styles.setInput, styles.inputColumn]}
                        value={set.reps}
                        onChangeText={(v) =>
                          updateSet(exercise.id, index, 'reps', v)
                        }
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor="#8E8E93"
                      />
                      <Pressable
                        style={styles.actionColumn}
                        onPress={() => removeSet(exercise.id, index)}
                      >
                        {log.sets.length > 1 && (
                          <Text style={styles.removeButton}>−</Text>
                        )}
                      </Pressable>
                    </View>
                  ))}

                  <Pressable
                    style={styles.addSetButton}
                    onPress={() => addSet(exercise.id)}
                  >
                    <Text style={styles.addSetText}>+ Add Set</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveWorkout}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Complete Workout'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  inputColumn: {
    flex: 1,
    textAlign: 'center',
  },
  actionColumn: {
    width: 32,
    alignItems: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  setInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  removeButton: {
    color: '#FF3B30',
    fontSize: 24,
    fontWeight: '300',
  },
  addSetButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addSetText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#2C2C2E',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
