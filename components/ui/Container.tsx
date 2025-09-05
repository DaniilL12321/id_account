import React from 'react';
import { View, StyleSheet, ViewProps, Platform } from 'react-native';

interface ContainerProps extends ViewProps {
  children: React.ReactNode;
}

export function Container({ children, style, ...props }: ContainerProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      web: {
        overflow: 'auto',
        height: '100vh',
      },
    }),
  },
  content: {
    width: '100%',
    maxWidth: 768,
    flex: 1,
    ...Platform.select({
      web: {
        paddingHorizontal: 16,
        paddingBottom: 50,
      },
    }),
  },
});
