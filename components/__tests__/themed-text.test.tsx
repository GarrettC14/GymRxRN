import React from 'react';
import { render } from '@testing-library/react-native';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn(() => '#FFFFFF'),
}));

import { ThemedText } from '../themed-text';

describe('ThemedText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders text content correctly', () => {
      const { getByText } = render(<ThemedText>Hello World</ThemedText>);
      expect(getByText('Hello World')).toBeTruthy();
    });

    it('renders without crashing', () => {
      const { toJSON } = render(<ThemedText>Test</ThemedText>);
      expect(toJSON()).toBeTruthy();
    });

    it('renders children correctly', () => {
      const { getByText } = render(
        <ThemedText>
          <ThemedText>Nested Text</ThemedText>
        </ThemedText>
      );
      expect(getByText('Nested Text')).toBeTruthy();
    });
  });

  describe('Type Prop', () => {
    it('applies default type styles', () => {
      const { getByText } = render(<ThemedText>Default</ThemedText>);
      const text = getByText('Default');
      // Default type should have fontSize 16 and lineHeight 24
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 16, lineHeight: 24 }),
        ])
      );
    });

    it('applies title type styles', () => {
      const { getByText } = render(<ThemedText type="title">Title</ThemedText>);
      const text = getByText('Title');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 32, fontWeight: 'bold' }),
        ])
      );
    });

    it('applies defaultSemiBold type styles', () => {
      const { getByText } = render(<ThemedText type="defaultSemiBold">SemiBold</ThemedText>);
      const text = getByText('SemiBold');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 16, fontWeight: '600' }),
        ])
      );
    });

    it('applies subtitle type styles', () => {
      const { getByText } = render(<ThemedText type="subtitle">Subtitle</ThemedText>);
      const text = getByText('Subtitle');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 20, fontWeight: 'bold' }),
        ])
      );
    });

    it('applies link type styles', () => {
      const { getByText } = render(<ThemedText type="link">Link</ThemedText>);
      const text = getByText('Link');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 16, color: '#0a7ea4' }),
        ])
      );
    });
  });

  describe('Theme Colors', () => {
    it('uses theme color from hook', () => {
      const mockUseThemeColor = require('@/hooks/use-theme-color').useThemeColor;
      mockUseThemeColor.mockReturnValue('#FF0000');

      const { getByText } = render(<ThemedText>Themed</ThemedText>);
      const text = getByText('Themed');

      expect(text.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#FF0000' })])
      );
    });

    it('passes lightColor and darkColor to useThemeColor', () => {
      const mockUseThemeColor = require('@/hooks/use-theme-color').useThemeColor;

      render(
        <ThemedText lightColor="#000000" darkColor="#FFFFFF">
          Test
        </ThemedText>
      );

      expect(mockUseThemeColor).toHaveBeenCalledWith(
        { light: '#000000', dark: '#FFFFFF' },
        'text'
      );
    });
  });

  describe('Custom Styles', () => {
    it('applies custom style prop', () => {
      const { getByText } = render(
        <ThemedText style={{ marginTop: 10 }}>Custom Style</ThemedText>
      );
      const text = getByText('Custom Style');
      expect(text.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ marginTop: 10 })])
      );
    });

    it('merges custom styles with type styles', () => {
      const { getByText } = render(
        <ThemedText type="title" style={{ marginBottom: 20 }}>
          Merged Styles
        </ThemedText>
      );
      const text = getByText('Merged Styles');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 32 }),
          expect.objectContaining({ marginBottom: 20 }),
        ])
      );
    });
  });

  describe('Props Forwarding', () => {
    it('forwards numberOfLines prop', () => {
      const { getByText } = render(
        <ThemedText numberOfLines={2}>Truncated Text</ThemedText>
      );
      const text = getByText('Truncated Text');
      expect(text.props.numberOfLines).toBe(2);
    });

    it('forwards testID prop', () => {
      const { getByTestId } = render(
        <ThemedText testID="themed-text-test">Test ID</ThemedText>
      );
      expect(getByTestId('themed-text-test')).toBeTruthy();
    });

    it('forwards accessible prop', () => {
      const { getByText } = render(
        <ThemedText accessible={true}>Accessible</ThemedText>
      );
      const text = getByText('Accessible');
      expect(text.props.accessible).toBe(true);
    });
  });
});
