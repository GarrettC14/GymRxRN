// Theme colors matching iOS app's Assets
// Dark theme by default (matching iOS app's userInterfaceStyle)

export const colors = {
  // Backgrounds
  background: '#0A0A0A',
  backgroundAccent: '#1A1A1A',
  backgroundElevated: '#2C2C2E',

  // Primary colors
  primary: '#007AFF',
  primaryLight: '#5AC8FA',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',

  // Semantic colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  // Border colors
  border: '#38383A',
  borderLight: '#48484A',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

// Typography scale
export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,

  // Font weights
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Spacing scale
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Shadows (for iOS)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
} as const;

// Animation durations
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;
