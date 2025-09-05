import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
  style: ViewStyle;
}

export const SkeletonLoader = ({ style }: SkeletonLoaderProps) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withDelay(Math.random() * 500, withTiming(0.7, { duration: 1000 })),
        withTiming(0.3, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        animatedStyle,
        { backgroundColor: 'rgba(120, 120, 128, 0.2)' },
      ]}
    />
  );
};
