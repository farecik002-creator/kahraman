import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  scaleVal: number;
}

const PARTICLE_COLORS = [
  '#ffcc33', // Gold
  '#ffffff', // White bloom
  '#9955ff', // Magic
  '#44ff88', // Heal
  '#ff4444', // Crit
  '#ffdd66', // Warm light
];

function Particle({ x, y, size, color, delay, duration, scaleVal }: Omit<ParticleConfig, 'id'>) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(scaleVal);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(withTiming(-200, { duration, easing: Easing.bezier(0.4, 0, 0.2, 1) }), -1, false)
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 600 }),
          withTiming(0.4, { duration: duration - 1200 }),
          withTiming(0, { duration: 600 })
        ),
        -1,
        false
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(scaleVal * 1.5, { duration: duration / 2 }),
          withTiming(scaleVal, { duration: duration / 2 })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const shadowStyle = Platform.OS === 'web'
    ? { boxShadow: `0 0 ${size * 3}px ${color}` }
    : {
        shadowColor: color,
        shadowRadius: size * 2,
        shadowOpacity: 0.8,
      };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          bottom: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        shadowStyle,
        style,
      ]}
    />
  );
}

interface ParticleSystemProps {
  width: number;
  height: number;
}

export function ParticleSystem({ width, height }: ParticleSystemProps) {
  const particles = useMemo<ParticleConfig[]>(() => {
    const arr: ParticleConfig[] = [];
    const seeds = [
      { x: 0.05, y: 0.1, size: 3, colorIdx: 0, delay: 0 },
      { x: 0.15, y: 0.35, size: 2, colorIdx: 1, delay: 600 },
      { x: 0.25, y: 0.6, size: 4, colorIdx: 2, delay: 1200 },
      { x: 0.08, y: 0.75, size: 2, colorIdx: 3, delay: 300 },
      { x: 0.3, y: 0.15, size: 3, colorIdx: 4, delay: 900 },
      { x: 0.45, y: 0.45, size: 2, colorIdx: 0, delay: 1500 },
      { x: 0.6, y: 0.2, size: 4, colorIdx: 1, delay: 400 },
      { x: 0.7, y: 0.55, size: 2, colorIdx: 2, delay: 700 },
      { x: 0.8, y: 0.1, size: 3, colorIdx: 5, delay: 200 },
      { x: 0.88, y: 0.4, size: 2, colorIdx: 0, delay: 1100 },
      { x: 0.93, y: 0.7, size: 4, colorIdx: 3, delay: 500 },
      { x: 0.55, y: 0.8, size: 2, colorIdx: 4, delay: 800 },
    ];
    seeds.forEach((s, i) => {
      arr.push({
        id: i,
        x: s.x * width,
        y: s.y * height,
        size: s.size,
        color: PARTICLE_COLORS[s.colorIdx],
        delay: s.delay,
        duration: 3000 + i * 200,
        scaleVal: 0.8 + (i % 3) * 0.15,
      });
    });
    return arr;
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(p => (
        <Particle key={p.id} {...p} />
      ))}
    </View>
  );
}
