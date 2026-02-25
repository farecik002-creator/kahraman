import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { TileType, TILE_CONFIG, GRID_SIZE } from '../../constants/gameData';

interface TileProps {
  type: TileType;
  selected: boolean;
  matched: boolean;
  isNew: boolean;
  size: number;
  row: number;
  col: number;
  onPress: () => void;
  critActive?: boolean;
}

export function Tile({ type, selected, matched, isNew, size, row, col, onPress, critActive }: TileProps) {
  const scale = useSharedValue(isNew ? 0.3 : 1);
  const opacity = useSharedValue(isNew ? 0 : 1);
  const floatY = useSharedValue(0);

  const floatDelay = ((row * GRID_SIZE + col) % 4) * 280;
  const floatAmp = 1.8;

  useEffect(() => {
    floatY.value = withDelay(
      floatDelay,
      withRepeat(
        withSequence(
          withTiming(-floatAmp, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(floatAmp, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, []);

  useEffect(() => {
    if (isNew) {
      scale.value = withSpring(1, { damping: 12, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 220 });
    }
  }, [isNew]);

  useEffect(() => {
    if (matched) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 80 }),
        withTiming(0, { duration: 230 })
      );
      opacity.value = withTiming(0, { duration: 310 });
    }
  }, [matched]);

  useEffect(() => {
    if (!matched && !isNew) {
      scale.value = withSpring(selected ? 1.14 : 1, { damping: 10, stiffness: 220 });
    }
  }, [selected, matched, isNew]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: floatY.value },
    ],
    opacity: opacity.value,
  }));

  const cfg = TILE_CONFIG[type];
  const iconSize = Math.floor(size * 0.46);

  const glowStrength = selected ? 14 : 5;
  const glowColor = selected ? '#d4af37' : cfg.glow;

  const shadowStyle = Platform.OS === 'web'
    ? { boxShadow: `0 0 ${glowStrength}px ${glowColor}` }
    : {
        shadowColor: glowColor,
        shadowRadius: glowStrength,
        shadowOpacity: selected ? 1 : 0.6,
        shadowOffset: { width: 0, height: 0 },
        elevation: selected ? 10 : 4,
      };

  return (
    <Pressable
      onPress={onPress}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        style={[
          styles.tile,
          {
            width: size - 2,
            height: size - 2,
            borderRadius: 9,
            backgroundColor: cfg.bg,
            borderColor: selected ? '#d4af37' : cfg.border,
            borderWidth: selected ? 2.5 : 1.5,
          },
          shadowStyle,
          animStyle,
        ]}
      >
        <Animated.View style={styles.shineTop} />
        {cfg.iconSet === 'ion' ? (
          <Ionicons name={cfg.iconName as any} size={iconSize} color={cfg.iconColor} />
        ) : (
          <MaterialCommunityIcons name={cfg.iconName as any} size={iconSize} color={cfg.iconColor} />
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  shineTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});
