import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  tileHeight?: number;
  row: number;
  col: number;
  onPress: () => void;
  critActive?: boolean;
}

export function Tile({ type, selected, matched, isNew, size, tileHeight, row, col, onPress, critActive }: TileProps) {
  const finalHeight = tileHeight || size;
  const scale = useSharedValue(isNew ? 0.3 : 1);
  const opacity = useSharedValue(isNew ? 0 : 1);
  const pressScale = useSharedValue(1);
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
      // Drop animation
      floatY.value = -100;
      floatY.value = withTiming(0, { 
        duration: 300, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      }, () => {
        floatY.value = withSequence(
          withTiming(2, { duration: 50 }),
          withTiming(0, { duration: 100 })
        );
      });
    }
  }, [isNew]);

  useEffect(() => {
    if (matched) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 60 }),
        withTiming(1.1, { duration: 40 }),
        withTiming(0, { duration: 120 })
      );
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [matched]);

  useEffect(() => {
    if (!matched && !isNew) {
      scale.value = withSpring(selected ? 1.14 : 1, { damping: 10, stiffness: 220 });
    }
  }, [selected, matched, isNew]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pressScale.value },
      { translateY: floatY.value },
    ],
    opacity: opacity.value,
  }));

  const cfg = TILE_CONFIG[type];
  const iconSize = Math.floor(size * 0.48);

  const glowStrength = selected ? 18 : 6;
  const glowColor = selected ? '#d4af37' : cfg.glow;

  const shadowStyle = Platform.OS === 'web'
    ? { 
        boxShadow: `0 4px 8px rgba(0,0,0,0.5), 0 0 ${glowStrength}px ${glowColor}${selected ? 'aa' : '44'}, inset 0 0 10px rgba(255,255,255,0.1)`,
      }
    : {
        shadowColor: glowColor,
        shadowRadius: glowStrength,
        shadowOpacity: selected ? 0.8 : 0.4,
        shadowOffset: { width: 0, height: 2 },
        elevation: selected ? 12 : 4,
      };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressScale.value = withTiming(0.95, { duration: 100 });
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1);
      }}
      style={{ width: size, height: finalHeight, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        style={[
          styles.tile,
          {
            width: size - 3,
            height: finalHeight - 3,
            borderRadius: 14,
            backgroundColor: cfg.bg,
            borderColor: selected ? '#d4af37' : cfg.border,
            borderWidth: selected ? 2.5 : 1.5,
          },
          shadowStyle,
          animStyle,
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'rgba(0,0,0,0.2)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.innerGlow} />
        {cfg.iconSet === 'ion' ? (
          <Ionicons name={cfg.iconName as any} size={iconSize} color={cfg.iconColor} />
        ) : (
          <MaterialCommunityIcons name={cfg.iconName as any} size={iconSize} color={cfg.iconColor} />
        )}
        <View style={styles.topBevel} />
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
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.3)',
  },
  innerGlow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  topBevel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
