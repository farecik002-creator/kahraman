import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

interface FloatingTextProps {
  text: string;
  color: string;
  x: number;
  y: number;
  containerWidth: number;
  containerHeight: number;
}

export function FloatingText({ text, color, x, y, containerWidth, containerHeight }: FloatingTextProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    translateY.value = withTiming(-55, { duration: 1100 });
    opacity.value = withTiming(0, { duration: 1100 });
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { left: x * containerWidth - 40, top: y * containerHeight },
        style,
      ]}
    >
      <Text style={[styles.text, { color }]}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
    zIndex: 50,
    pointerEvents: 'none',
  },
  text: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
});
