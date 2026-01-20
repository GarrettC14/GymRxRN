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
import { useLocalSearchParams } from 'expo-router';
import { CartesianChart, Line, Bar, useChartPressState } from 'victory-native';
import { Circle, LinearGradient, vec } from '@shopify/react-native-skia';
import {
  useExerciseHistory,
  useDatabaseOperations,
} from '../src/hooks/useDatabase';
import {
  ExerciseCategoryLabels,
  BodyPartLabels,
  WeightTypeLabels,
} from '../src/types/enums';
import {
  formatDate,
  findMaxWeight,
  findMaxReps,
  calculateBestOneRepMax,
} from '../src/utils';
import ExerciseType from '../src/database/models/ExerciseType';
import ExerciseInstance from '../src/database/models/ExerciseInstance';
import { Ionicons } from '@expo/vector-icons';
import { iOSColors, iOSChartConfig } from '../src/theme/chartTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ExerciseAnalyticsScreen() {
  const params = useLocalSearchParams<{ exerciseTypeId: string }>();
  const { exercises, loading } = useExerciseHistory(params.exerciseTypeId || null);
  const { getExerciseType } = useDatabaseOperations();
  const [exerciseType, setExerciseType] = useState<ExerciseType | null>(null);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  useEffect(() => {
    async function fetchType() {
      if (params.exerciseTypeId) {
        try {
          const type = await getExerciseType(params.exerciseTypeId);
          setExerciseType(type);
        } catch (error) {
          console.error('Failed to fetch exercise type:', error);
        }
      }
    }
    fetchType();
  }, [params.exerciseTypeId, getExerciseType]);

  // Calculate personal records
  const personalRecords = useMemo(() => {
    if (exercises.length === 0) {
      return { maxWeight: 0, maxReps: 0, best1RM: 0, totalSets: 0, totalVolume: 0 };
    }

    let maxWeight = 0;
    let maxReps = 0;
    let best1RM = 0;
    let totalSets = 0;
    let totalVolume = 0;

    exercises.forEach((ex) => {
      const weight = findMaxWeight(ex.weightsPerSet);
      const reps = findMaxReps(ex.repsPerSet);
      const oneRM = calculateBestOneRepMax(ex.repsPerSet, ex.weightsPerSet);

      if (weight > maxWeight) maxWeight = weight;
      if (reps > maxReps) maxReps = reps;
      if (oneRM > best1RM) best1RM = oneRM;

      totalSets += ex.repsPerSet.length;
      ex.repsPerSet.forEach((r, i) => {
        totalVolume += r * (ex.weightsPerSet[i] || 0);
      });
    });

    return { maxWeight, maxReps, best1RM: Math.round(best1RM), totalSets, totalVolume };
  }, [exercises]);

  // Prepare weight progression data for chart
  const weightProgressionData = useMemo(() => {
    return exercises
      .slice()
      .reverse()
      .map((ex, index) => ({
        index,
        date: formatDate(ex.date),
        maxWeight: findMaxWeight(ex.weightsPerSet),
      }));
  }, [exercises]);

  // Prepare sets data for chart
  const setsData = useMemo(() => {
    return exercises
      .slice()
      .reverse()
      .map((ex, index) => ({
        index,
        date: formatDate(ex.date),
        sets: ex.repsPerSet.length,
      }));
  }, [exercises]);

  const currentExercise = exercises[currentLogIndex];

  const handlePrevious = () => {
    if (currentLogIndex < exercises.length - 1) {
      setCurrentLogIndex(currentLogIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentLogIndex > 0) {
      setCurrentLogIndex(currentLogIndex - 1);
    }
  };

  if (loading || !exerciseType) {
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.exerciseName}>{exerciseType.name}</Text>
            <Text style={styles.exerciseDetail}>
              {ExerciseCategoryLabels[exerciseType.category]} •{' '}
              {BodyPartLabels[exerciseType.bodyPart]}
            </Text>
          </View>

          {/* Personal Records */}
          <View style={styles.prCard}>
            <Text style={styles.cardTitle}>Personal Records</Text>
            <View style={styles.prGrid}>
              <View style={styles.prItem}>
                <Text style={styles.prValue}>{personalRecords.maxWeight}</Text>
                <Text style={styles.prLabel}>Max Weight (lbs)</Text>
              </View>
              <View style={styles.prItem}>
                <Text style={styles.prValue}>{personalRecords.maxReps}</Text>
                <Text style={styles.prLabel}>Max Reps</Text>
              </View>
              <View style={styles.prItem}>
                <Text style={styles.prValue}>{personalRecords.best1RM}</Text>
                <Text style={styles.prLabel}>Est. 1RM</Text>
              </View>
              <View style={styles.prItem}>
                <Text style={styles.prValue}>{personalRecords.totalSets}</Text>
                <Text style={styles.prLabel}>Total Sets</Text>
              </View>
            </View>
          </View>

          {/* Exercise Log Navigator */}
          {currentExercise && (
            <View style={styles.logCard}>
              <Text style={styles.cardTitle}>Exercise Log</Text>
              <View style={styles.logNavigator}>
                <Pressable
                  style={[
                    styles.navButton,
                    currentLogIndex >= exercises.length - 1 && styles.navButtonDisabled,
                  ]}
                  onPress={handlePrevious}
                  disabled={currentLogIndex >= exercises.length - 1}
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={
                      currentLogIndex >= exercises.length - 1 ? '#3A3A3C' : '#007AFF'
                    }
                  />
                </Pressable>
                <View style={styles.logDateContainer}>
                  <Text style={styles.logDate}>{formatDate(currentExercise.date)}</Text>
                  <Text style={styles.logCount}>
                    {exercises.length - currentLogIndex} of {exercises.length}
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.navButton,
                    currentLogIndex <= 0 && styles.navButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={currentLogIndex <= 0}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={currentLogIndex <= 0 ? '#3A3A3C' : '#007AFF'}
                  />
                </Pressable>
              </View>

              {/* Sets Table */}
              <View style={styles.setsHeader}>
                <Text style={[styles.headerText, styles.setColumn]}>Set</Text>
                <Text style={[styles.headerText, styles.dataColumn]}>
                  {WeightTypeLabels[currentExercise.weightType]}
                </Text>
                <Text style={[styles.headerText, styles.dataColumn]}>Reps</Text>
              </View>
              {currentExercise.repsPerSet.map((reps, index) => (
                <View key={index} style={styles.setRow}>
                  <Text style={[styles.setText, styles.setColumn]}>{index + 1}</Text>
                  <Text style={[styles.setText, styles.dataColumn]}>
                    {currentExercise.weightsPerSet[index] || 0}
                  </Text>
                  <Text style={[styles.setText, styles.dataColumn]}>{reps}</Text>
                </View>
              ))}

              {currentExercise.note ? (
                <View style={styles.noteContainer}>
                  <Text style={styles.noteLabel}>Note:</Text>
                  <Text style={styles.noteText}>{currentExercise.note}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Weight Progression Chart */}
          {weightProgressionData.length > 1 && (
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Weight Progression</Text>
              <View style={styles.chartContainer}>
                <CartesianChart
                  data={weightProgressionData}
                  xKey="index"
                  yKeys={['maxWeight']}
                  domainPadding={{ left: 24, right: 24, top: 24, bottom: 16 }}
                  axisOptions={{
                    lineColor: iOSColors.axisLine,
                    lineWidth: 0.5,
                    labelColor: iOSColors.labelSecondary,
                    labelOffset: 8,
                  }}
                >
                  {({ points, chartBounds }) => (
                    <>
                      <Line
                        points={points.maxWeight}
                        color={iOSColors.blue}
                        strokeWidth={iOSChartConfig.line.strokeWidth}
                        curveType={iOSChartConfig.line.curveType}
                        animate={{ type: 'timing', duration: 400 }}
                      >
                        <LinearGradient
                          start={vec(0, chartBounds.top)}
                          end={vec(0, chartBounds.bottom)}
                          colors={[`${iOSColors.blue}40`, `${iOSColors.blue}05`]}
                        />
                      </Line>
                      {points.maxWeight.map((point, index) =>
                        point.y != null ? (
                          <Circle
                            key={index}
                            cx={point.x}
                            cy={point.y as number}
                            r={5}
                            color={iOSColors.blue}
                          />
                        ) : null
                      )}
                    </>
                  )}
                </CartesianChart>
              </View>
              <Text style={styles.chartLabel}>Max Weight per Session</Text>
            </View>
          )}

          {/* Sets Per Session Chart */}
          {setsData.length > 1 && (
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Working Sets</Text>
              <View style={styles.chartContainer}>
                <CartesianChart
                  data={setsData}
                  xKey="index"
                  yKeys={['sets']}
                  domainPadding={{ left: 48, right: 48, top: 24, bottom: 8 }}
                  axisOptions={{
                    lineColor: iOSColors.axisLine,
                    lineWidth: 0.5,
                    labelColor: iOSColors.labelSecondary,
                    labelOffset: 8,
                  }}
                >
                  {({ points, chartBounds }) => (
                    <Bar
                      points={points.sets}
                      chartBounds={chartBounds}
                      color={iOSColors.green}
                      roundedCorners={iOSChartConfig.bar.roundedCorners}
                      animate={{ type: 'timing', duration: 350 }}
                    />
                  )}
                </CartesianChart>
              </View>
              <Text style={styles.chartLabel}>Sets per Session</Text>
            </View>
          )}

          {exercises.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No exercise history yet.{'\n'}Complete a workout to see your progress.
              </Text>
            </View>
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
  header: {
    marginBottom: 24,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exerciseDetail: {
    color: '#8E8E93',
    fontSize: 16,
  },
  prCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  prGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  prItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  prValue: {
    color: '#007AFF',
    fontSize: 28,
    fontWeight: '700',
  },
  prLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
  },
  logCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#2C2C2E',
  },
  navButtonDisabled: {
    backgroundColor: '#1A1A1A',
  },
  logDateContainer: {
    alignItems: 'center',
  },
  logDate: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logCount: {
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
  chartCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  chartContainer: {
    height: 220,
  },
  chartLabel: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: -0.2,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
