import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GlassContainer,
  GlassView,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { useTheme } from '@/app/context/theme';

export default function BlurTabBarBackground() {
  const { themeMode } = useTheme();
  const glassAvailable = isLiquidGlassAvailable();

  if (glassAvailable) {
    return (
      <GlassContainer pointerEvents="none" style={StyleSheet.absoluteFill}>
        <GlassView
          style={StyleSheet.absoluteFill}
          isInteractive={false}
          glassEffectStyle="regular"
        />
      </GlassContainer>
    );
  }

  return (
    <BlurView
      tint={
        themeMode === 'system'
          ? 'systemChromeMaterial'
          : themeMode === 'dark'
            ? 'dark'
            : 'light'
      }
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}
