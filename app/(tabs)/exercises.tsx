import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useExerciseTypes } from '../../src/hooks/useDatabase';
import {
  ExerciseCategoryLabels,
  BodyPartLabels,
} from '../../src/types/enums';
import { groupBy, sortAlphabetically } from '../../src/utils';
import ExerciseType from '../../src/database/models/ExerciseType';

export default function ExercisesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { exercises, loading } = useExerciseTypes(searchQuery);

  // Group exercises by first letter
  const groupedExercises = useMemo(() => {
    const sorted = sortAlphabetically(exercises, (ex) => ex.name);
    const groups = groupBy(sorted, (ex) =>
      ex.name.charAt(0).toUpperCase()
    );

    // Sort the keys alphabetically
    const sortedKeys = Object.keys(groups).sort();
    return sortedKeys.map((letter) => ({
      letter,
      exercises: groups[letter as keyof typeof groups],
    }));
  }, [exercises]);

  const handleCreateExercise = () => {
    router.push('/create-exercise');
  };

  const handleEditExercise = (exercise: ExerciseType) => {
    router.push({
      pathname: '/edit-exercise' as const,
      params: { id: exercise.id },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : exercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery
              ? `No exercises found for "${searchQuery}"`
              : 'No exercises available'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {groupedExercises.map(({ letter, exercises: groupExercises }) => (
              <View key={letter}>
                <Text style={styles.sectionHeader}>{letter}</Text>
                <View style={styles.exerciseGroup}>
                  {groupExercises.map(
                    (exercise: ExerciseType, index: number) => (
                      <Pressable
                        key={exercise.id}
                        style={[
                          styles.exerciseRow,
                          index < groupExercises.length - 1 &&
                            styles.borderBottom,
                        ]}
                        onPress={() => handleEditExercise(exercise)}
                      >
                        <View style={styles.exerciseContent}>
                          <View style={styles.exerciseInfo}>
                            <Text style={styles.exerciseName}>{exercise.name}</Text>
                            <Text style={styles.exerciseDetail}>
                              {ExerciseCategoryLabels[exercise.category]} •{' '}
                              {BodyPartLabels[exercise.bodyPart]}
                            </Text>
                          </View>
                          <Text style={styles.chevron}>›</Text>
                        </View>
                      </Pressable>
                    )
                  )}
                </View>
              </View>
            ))}
          </View>
          {/* Bottom padding for FAB */}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Floating action button */}
      <Pressable style={styles.fab} onPress={handleCreateExercise}>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearButton: {
    color: '#8E8E93',
    fontSize: 16,
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
  sectionHeader: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  exerciseGroup: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 16,
  },
  exerciseRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#2C2C2E',
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 2,
  },
  exerciseDetail: {
    color: '#8E8E93',
    fontSize: 14,
  },
  chevron: {
    color: '#8E8E93',
    fontSize: 20,
    marginLeft: 8,
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
