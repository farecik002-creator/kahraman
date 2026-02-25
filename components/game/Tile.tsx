import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { TileType, TILE_CONFIG } from '../../constants/gameData';

interface TileProps {
  type: TileType;
  selected: boolean;
  matched: boolean;
  isNew: boolean;
  size: number;
  onPress: () => void;
  critActive?: boolean;
}

export function Tile({ type, selected, matched, isNew, size, onPress, critActive }: TileProps) {
  const scale = useSharedValue(isNew ? 0.4 : 1);
  const opacity = useSharedValue(isNew ? 0 : 1);

  useEffect(() => {
    if (isNew) {
      scale.value = withSpring(1, { damping: 14, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 220 });
    }
  }, [isNew]);

  useEffect(() => {
    if (matched) {
      scale.value = withSequence(
        withTiming(1.25, { duration: 90 }),
        withTiming(0, { duration: 220 })
      );
      opacity.value = withTiming(0, { duration: 310 });
    }
  }, [matched]);

  useEffect(() => {
    if (!matched && !isNew) {
      scale.value = withSpring(selected ? 1.12 : 1, { damping: 12, stiffness: 200 });
    }
  }, [selected, matched, isNew]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const cfg = TILE_CONFIG[type];
  const iconSize = Math.floor(size * 0.48);
  const isDiamond = type === 'diamond';
  const glowActive = selected || (isDiamond && critActive);

  return (
    <Pressable onPress={onPress} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          styles.tile,
          {
            width: size - 3,
            height: size - 3,
            borderRadius: 8,
            backgroundColor: cfg.bg,
            borderColor: selected ? '#d4af37' : cfg.border,
            borderWidth: selected ? 2.5 : 1,
            shadowColor: glowActive ? '#d4af37' : cfg.glow,
            shadowOpacity: selected ? 0.95 : 0.4,
            shadowRadius: selected ? 10 : 4,
            shadowOffset: { width: 0, height: 0 },
            elevation: selected ? 10 : 3,
          },
          animStyle,
        ]}
      >
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
  },
});
