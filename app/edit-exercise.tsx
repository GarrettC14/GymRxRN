import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDatabaseOperations } from '../src/hooks/useDatabase';
import {
  ExerciseCategory,
  ExerciseCategoryLabels,
  BodyPart,
  BodyPartLabels,
} from '../src/types/enums';

const categories = Object.values(ExerciseCategory).filter(
  (c) => c !== ExerciseCategory.None
);
const bodyParts = Object.values(BodyPart).filter((b) => b !== BodyPart.None);

export default function EditExerciseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { getExerciseType, updateExerciseType } = useDatabaseOperations();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>(
    ExerciseCategory.Dumbbell
  );
  const [bodyPart, setBodyPart] = useState<BodyPart>(BodyPart.Chest);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalName, setOriginalName] = useState('');

  useEffect(() => {
    async function loadExercise() {
      if (!params.id) {
        router.back();
        return;
      }
      try {
        const exercise = await getExerciseType(params.id);
        setName(exercise.name);
        setOriginalName(exercise.name);
        setCategory(exercise.category);
        setBodyPart(exercise.bodyPart);
      } catch (error) {
        console.error('Failed to load exercise:', error);
        Alert.alert('Error', 'Failed to load exercise');
        router.back();
      } finally {
        setIsLoading(false);
      }
    }
    loadExercise();
  }, [params.id, getExerciseType, router]);

  const handleSave = async () => {
    if (!name.trim() || !params.id) return;

    setIsSubmitting(true);
    try {
      await updateExerciseType(params.id, {
        name: name.trim(),
        category,
        bodyPart,
      });
      router.back();
    } catch (error) {
      console.error('Failed to update exercise:', error);
      Alert.alert('Error', 'Failed to update exercise');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
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
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Exercise Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Romanian Deadlift"
                placeholderTextColor="#8E8E93"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.optionGrid}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.optionButton,
                      category === cat && styles.optionButtonSelected,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        category === cat && styles.optionTextSelected,
                      ]}
                    >
                      {ExerciseCategoryLabels[cat]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Body Part</Text>
              <View style={styles.optionGrid}>
                {bodyParts.map((part) => (
                  <Pressable
                    key={part}
                    style={[
                      styles.optionButton,
                      bodyPart === part && styles.optionButtonSelected,
                    ]}
                    onPress={() => setBodyPart(part)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        bodyPart === part && styles.optionTextSelected,
                      ]}
                    >
                      {BodyPartLabels[part]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[
              styles.saveButton,
              (!name.trim() || isSubmitting) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!name.trim() || isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Saving...' : 'Save'}
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderColor: '#007AFF',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
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
    flex: 1,
    backgroundColor: '#007AFF',
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
