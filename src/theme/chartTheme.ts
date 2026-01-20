// iOS-inspired chart theme
// Based on Apple's Swift Charts design language

export const iOSColors = {
  // Primary iOS system colors
  blue: '#007AFF',
  green: '#34C759',
  orange: '#FF9500',
  red: '#FF3B30',
  purple: '#5856D6',
  pink: '#FF2D55',
  teal: '#5AC8FA',
  indigo: '#5856D6',

  // Chart-specific colors (ordered for multi-series)
  chartPalette: [
    '#007AFF', // Blue
    '#34C759', // Green
    '#FF9500', // Orange
    '#FF2D55', // Pink
    '#5856D6', // Purple
    '#5AC8FA', // Teal
    '#FF3B30', // Red
    '#FFCC00', // Yellow
  ],

  // Grayscale for axes and grid
  axisLine: '#3A3A3C',
  gridLine: '#2C2C2E',
  labelPrimary: '#FFFFFF',
  labelSecondary: '#8E8E93',
  labelTertiary: '#636366',

  // Background
  cardBackground: '#1C1C1E',
  chartBackground: 'transparent',
};

export const iOSChartConfig = {
  // Animation config for smooth iOS-like transitions
  animation: {
    duration: 300,
    type: 'timing' as const,
  },

  // Axis styling
  axis: {
    lineWidth: 0.5,
    tickCount: 5,
    labelOffset: 8,
  },

  // Grid styling (subtle like iOS)
  grid: {
    lineWidth: 0.5,
    dashArray: [4, 4],
  },

  // Bar chart specific
  bar: {
    roundedCorners: {
      topLeft: 6,
      topRight: 6,
      bottomLeft: 0,
      bottomRight: 0,
    },
    barWidth: 24,
  },

  // Line chart specific
  line: {
    strokeWidth: 2.5,
    curveType: 'natural' as const,
  },

  // Padding
  domainPadding: {
    left: 16,
    right: 16,
    top: 24,
    bottom: 8,
  },
};

// Helper to get chart color by index
export const getChartColor = (index: number): string => {
  return iOSColors.chartPalette[index % iOSColors.chartPalette.length];
};

// Body part to color mapping for consistency
export const bodyPartColors: Record<string, string> = {
  Chest: '#007AFF',
  Back: '#34C759',
  Shoulders: '#FF9500',
  Biceps: '#FF2D55',
  Triceps: '#5856D6',
  Legs: '#5AC8FA',
  Quadriceps: '#5AC8FA',
  Hamstrings: '#30B0C7',
  Glutes: '#64D2FF',
  Calves: '#00C7BE',
  Abs: '#FFCC00',
  Forearm: '#BF5AF2',
  'Full Body': '#FF3B30',
  Other: '#8E8E93',
};

export const getBodyPartColor = (bodyPart: string): string => {
  return bodyPartColors[bodyPart] || iOSColors.blue;
};
