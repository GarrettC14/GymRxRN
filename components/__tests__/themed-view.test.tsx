import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn(() => '#FFFFFF'),
}));

import { ThemedView } from '../themed-view';

describe('ThemedView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <ThemedView>
          <Text>Child Content</Text>
        </ThemedView>
      );
      expect(getByText('Child Content')).toBeTruthy();
    });

    it('renders without crashing', () => {
      const { toJSON } = render(<ThemedView />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders nested ThemedViews', () => {
      const { getByText } = render(
        <ThemedView>
          <ThemedView>
            <Text>Nested</Text>
          </ThemedView>
        </ThemedView>
      );
      expect(getByText('Nested')).toBeTruthy();
    });
  });

  describe('Theme Colors', () => {
    it('uses theme color from hook for background', () => {
      const mockUseThemeColor = require('@/hooks/use-theme-color').useThemeColor;
      mockUseThemeColor.mockReturnValue('#0A0A0A');

      const { toJSON } = render(<ThemedView />);
      const viewStyle = toJSON()?.props?.style;

      expect(viewStyle).toEqual(
        expect.arrayContaining([expect.objectContaining({ backgroundColor: '#0A0A0A' })])
      );
    });

    it('passes lightColor and darkColor to useThemeColor', () => {
      const mockUseThemeColor = require('@/hooks/use-theme-color').useThemeColor;

      render(<ThemedView lightColor="#FFFFFF" darkColor="#000000" />);

      expect(mockUseThemeColor).toHaveBeenCalledWith(
        { light: '#FFFFFF', dark: '#000000' },
        'background'
      );
    });

    it('requests background color type from useThemeColor', () => {
      const mockUseThemeColor = require('@/hooks/use-theme-color').useThemeColor;

      render(<ThemedView />);

      expect(mockUseThemeColor).toHaveBeenCalledWith(
        expect.any(Object),
        'background'
      );
    });
  });

  describe('Custom Styles', () => {
    it('applies custom style prop', () => {
      const { toJSON } = render(
        <ThemedView style={{ padding: 16, margin: 8 }} />
      );
      const viewStyle = toJSON()?.props?.style;

      expect(viewStyle).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ padding: 16, margin: 8 }),
        ])
      );
    });

    it('merges background color with custom styles', () => {
      const mockUseThemeColor = require('@/hooks/use-theme-color').useThemeColor;
      mockUseThemeColor.mockReturnValue('#1A1A1A');

      const { toJSON } = render(
        <ThemedView style={{ flex: 1 }} />
      );
      const viewStyle = toJSON()?.props?.style;

      expect(viewStyle).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ backgroundColor: '#1A1A1A' }),
          expect.objectContaining({ flex: 1 }),
        ])
      );
    });

    it('allows custom background color override via style', () => {
      // Custom style should be applied after theme background
      const { toJSON } = render(
        <ThemedView style={{ backgroundColor: '#FF0000' }} />
      );
      const viewStyle = toJSON()?.props?.style;

      // The last style should override
      expect(viewStyle).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ backgroundColor: '#FF0000' }),
        ])
      );
    });
  });

  describe('Props Forwarding', () => {
    it('forwards testID prop', () => {
      const { getByTestId } = render(
        <ThemedView testID="themed-view-test">
          <Text>Content</Text>
        </ThemedView>
      );
      expect(getByTestId('themed-view-test')).toBeTruthy();
    });

    it('forwards accessible prop', () => {
      const { toJSON } = render(
        <ThemedView accessible={true} />
      );
      expect(toJSON()?.props?.accessible).toBe(true);
    });

    it('forwards pointerEvents prop', () => {
      const { toJSON } = render(
        <ThemedView pointerEvents="none" />
      );
      expect(toJSON()?.props?.pointerEvents).toBe('none');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined lightColor and darkColor', () => {
      const mockUseThemeColor = require('@/hooks/use-theme-color').useThemeColor;

      render(<ThemedView />);

      expect(mockUseThemeColor).toHaveBeenCalledWith(
        { light: undefined, dark: undefined },
        'background'
      );
    });

    it('handles empty children', () => {
      const { toJSON } = render(<ThemedView />);
      expect(toJSON()).toBeTruthy();
      expect(toJSON()?.children).toBeNull();
    });

    it('handles multiple children', () => {
      const { getByText } = render(
        <ThemedView>
          <Text>First</Text>
          <Text>Second</Text>
          <Text>Third</Text>
        </ThemedView>
      );
      expect(getByText('First')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
      expect(getByText('Third')).toBeTruthy();
    });
  });
});
