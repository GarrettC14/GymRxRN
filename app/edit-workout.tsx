import { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  useWorkoutExercises,
  useDatabaseOperations,
} from '../src/hooks/useDatabase';
import {
  ExerciseCategoryLabels,
  BodyPartLabels,
} from '../src/types/enums';
import ExerciseInstance from '../src/database/models/ExerciseInstance';
import ExerciseType from '../src/database/models/ExerciseType';

export default function EditWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; name: string }>();
  const { exercises, loading } = useWorkoutExercises(params.id || null);
  const { deleteExerciseInstance, getExerciseType } = useDatabaseOperations();
  const [exerciseDetails, setExerciseDetails] = useState<
    Map<string, ExerciseType>
  >(new Map());

  // Fetch exercise type details for each exercise instance
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

  const handleAddExercise = () => {
    router.push({
      pathname: '/add-exercise',
      params: { workoutTypeId: params.id },
    });
  };

  const handleDeleteExercise = (exercise: ExerciseInstance) => {
    const exerciseType = exerciseDetails.get(exercise.id);
    const name = exerciseType?.name || 'this exercise';

    Alert.alert(
      'Remove Exercise',
      `Remove ${name} from this workout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExerciseInstance(exercise.id);
            } catch (error) {
              console.error('Failed to delete exercise:', error);
            }
          },
        },
      ]
    );
  };

  const handleDone = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.workoutName}>{params.name}</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No exercises added yet.{'\n'}Tap the button below to add
                exercises.
              </Text>
            </View>
          ) : (
            <View style={styles.exerciseList}>
              {exercises.map((exercise: ExerciseInstance, index: number) => {
                const exerciseType = exerciseDetails.get(exercise.id);
                return (
                  <Pressable
                    key={exercise.id}
                    style={[
                      styles.exerciseRow,
                      index < exercises.length - 1 && styles.borderBottom,
                    ]}
                    onLongPress={() => handleDeleteExercise(exercise)}
                  >
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>
                        {exerciseType?.name || 'Loading...'}
                      </Text>
                      <Text style={styles.exerciseDetail}>
                        {exerciseType
                          ? `${ExerciseCategoryLabels[exerciseType.category]} • ${BodyPartLabels[exerciseType.bodyPart]}`
                          : ''}
                      </Text>
                    </View>
                    <View style={styles.exerciseMeta}>
                      <Text style={styles.setsReps}>
                        {exercise.sets} × {exercise.reps}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable style={styles.addButton} onPress={handleAddExercise}>
            <Text style={styles.addButtonText}>+ Add Exercise</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>
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
  },
  content: {
    padding: 16,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  loadingContainer: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  exerciseList: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 16,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#2C2C2E',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  exerciseDetail: {
    color: '#8E8E93',
    fontSize: 14,
  },
  exerciseMeta: {
    alignItems: 'flex-end',
  },
  setsReps: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#2C2C2E',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
