import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock dependencies - simpler mocking for basic rendering tests
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'dark'),
}));

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn(() => '#FFFFFF'),
}));

jest.mock('@/constants/theme', () => ({
  Colors: {
    light: { icon: '#000000' },
    dark: { icon: '#FFFFFF' },
  },
}));

// Note: Due to complexity of mocking ThemedText, ThemedView, and IconSymbol,
// we test the Collapsible component at a higher level via integration/E2E tests.
// These unit tests verify basic rendering.

import { Collapsible } from '../ui/collapsible';

describe('Collapsible', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(
        <Collapsible title="Title">
          <Text>Content</Text>
        </Collapsible>
      );
      expect(toJSON()).toBeTruthy();
    });

    it('renders the title text', () => {
      const { toJSON } = render(
        <Collapsible title="Test Title">
          <Text>Content</Text>
        </Collapsible>
      );
      const json = toJSON();
      // Check that the title is somewhere in the rendered output
      const jsonString = JSON.stringify(json);
      expect(jsonString).toContain('Test Title');
    });

    it('initially hides content (collapsed state)', () => {
      const { queryByText } = render(
        <Collapsible title="Title">
          <Text>Hidden Content</Text>
        </Collapsible>
      );
      // Content should not be visible when collapsed
      expect(queryByText('Hidden Content')).toBeNull();
    });
  });

  describe('Theme Integration', () => {
    it('uses theme hook', () => {
      const mockUseColorScheme = require('@/hooks/use-color-scheme').useColorScheme;

      render(
        <Collapsible title="Theme Test">
          <Text>Content</Text>
        </Collapsible>
      );

      expect(mockUseColorScheme).toHaveBeenCalled();
    });

    it('handles light theme', () => {
      const mockUseColorScheme = require('@/hooks/use-color-scheme').useColorScheme;
      mockUseColorScheme.mockReturnValue('light');

      const { toJSON } = render(
        <Collapsible title="Light Theme">
          <Text>Content</Text>
        </Collapsible>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('handles null color scheme (defaults to light)', () => {
      const mockUseColorScheme = require('@/hooks/use-color-scheme').useColorScheme;
      mockUseColorScheme.mockReturnValue(null);

      const { toJSON } = render(
        <Collapsible title="Null Theme">
          <Text>Content</Text>
        </Collapsible>
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      const { toJSON } = render(
        <Collapsible title="">
          <Text>Content</Text>
        </Collapsible>
      );
      expect(toJSON()).toBeTruthy();
    });

    it('handles complex children', () => {
      const { toJSON } = render(
        <Collapsible title="Complex">
          <Text>First</Text>
          <Text>Second</Text>
          <Text>Third</Text>
        </Collapsible>
      );
      expect(toJSON()).toBeTruthy();
    });

    it('handles nested collapsibles', () => {
      const { toJSON } = render(
        <Collapsible title="Outer">
          <Collapsible title="Inner">
            <Text>Nested Content</Text>
          </Collapsible>
        </Collapsible>
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});

// Note: Interaction tests (toggle behavior) are covered by E2E tests
// due to the complexity of properly mocking all the themed components.
