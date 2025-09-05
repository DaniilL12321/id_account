import React, { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, Platform } from 'react-native';
import { useTheme } from '@/app/context/theme';

interface ThemedTextInputProps extends TextInputProps {
  style?: any;
}

export const ThemedTextInput = forwardRef<TextInput, ThemedTextInputProps>(
  ({ style, ...props }, ref) => {
    const { isDarkMode } = useTheme();

    const theme = {
      background: isDarkMode ? '#1D1D1D' : '#FFFFFF',
      textColor: isDarkMode ? '#FFFFFF' : '#000000',
      placeholderColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.6)'
        : 'rgba(0, 0, 0, 0.6)',
      borderColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)',
    };

    return (
      <TextInput
        ref={ref}
        style={[
          styles.input,
          {
            backgroundColor: theme.background,
            color: theme.textColor,
            borderColor: theme.borderColor,
          },
          style,
        ]}
        placeholderTextColor={theme.placeholderColor}
        selectionColor={theme.textColor}
        {...props}
      />
    );
  },
);

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
});
