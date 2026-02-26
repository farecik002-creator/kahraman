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

  const glowStrength = selected ? 24 : 10;
  const glowColor = selected ? '#ffcc33' : cfg.glow;

  const shadowStyle = Platform.OS === 'web'
    ? { 
        boxShadow: `0 6px 12px rgba(0,0,0,0.6), 0 0 ${glowStrength}px ${glowColor}${selected ? 'cc' : '66'}, inset 0 0 15px rgba(255,255,255,0.15)`,
      }
    : {
        shadowColor: glowColor,
        shadowRadius: glowStrength,
        shadowOpacity: selected ? 0.9 : 0.5,
        shadowOffset: { width: 0, height: 4 },
        elevation: selected ? 16 : 6,
      };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressScale.value = withTiming(0.9, { duration: 100 });
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
            width: size - 4,
            height: finalHeight - 4,
            borderRadius: 14,
            backgroundColor: cfg.bg,
            borderColor: selected ? '#ffcc33' : cfg.border,
            borderWidth: selected ? 3.5 : 2,
          },
          shadowStyle,
          animStyle,
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'rgba(0,0,0,0.5)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.innerGlow} />
        <View style={styles.glossyTop} />
        {cfg.iconSet === 'ion' ? (
          <Ionicons name={cfg.iconName as any} size={iconSize} color={cfg.iconColor} style={styles.iconShadow} />
        ) : (
          <MaterialCommunityIcons name={cfg.iconName as any} size={iconSize} color={cfg.iconColor} style={styles.iconShadow} />
        )}
        <View style={styles.glassEffect} />
        <View style={styles.rimLight} />
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
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.4)',
  },
  innerGlow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  glossyTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
  },
  rimLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 11,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  iconShadow: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  glassEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: '150%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ rotate: '45deg' }],
  },
});
