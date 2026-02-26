import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CharacterPanelProps {
  combo: number;
  lastSkillUsed: 'heal' | 'crit' | null;
  width: number;
  height: number;
}

export function CharacterPanel({ combo, lastSkillUsed, width, height }: CharacterPanelProps) {
  const glowOpacity = useSharedValue(0);
  const glowColor = useSharedValue(0);
  const skillFlash = useSharedValue(0);
  const mistOffset = useSharedValue(0);

  useEffect(() => {
    mistOffset.value = withRepeat(
      withTiming(width, { duration: 10000, easing: Easing.linear }),
      -1,
      false
    );
  }, [width]);

  useEffect(() => {
    if (combo >= 5) {
      glowOpacity.value = withTiming(0.85, { duration: 300 });
    } else if (combo >= 3) {
      glowOpacity.value = withTiming(0.45, { duration: 400 });
    } else {
      glowOpacity.value = withTiming(0, { duration: 600 });
    }
  }, [combo]);

  useEffect(() => {
    if (lastSkillUsed === 'heal') {
      skillFlash.value = withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(0.6, { duration: 200 }),
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 300 })
      );
      glowColor.value = 1;
    } else if (lastSkillUsed === 'crit') {
      skillFlash.value = withSequence(
        withTiming(1, { duration: 60 }),
        withTiming(0.7, { duration: 150 }),
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 250 })
      );
      glowColor.value = 2;
    } else {
      setTimeout(() => {
        glowColor.value = 0;
      }, 800);
    }
  }, [lastSkillUsed]);

  const auraStyle = useAnimatedStyle(() => ({
    opacity: withTiming(combo >= 3 ? 0.3 : 0, { duration: 500 }),
    transform: [{ scale: withRepeat(withTiming(1.4, { duration: 3000 }), -1, true) }],
  }));

  const glowColorStyle = useAnimatedStyle(() => {
    if (glowColor.value === 1) return { borderColor: '#44ff88' };
    if (glowColor.value === 2) return { borderColor: '#ff4444' };
    if (combo >= 5) return { borderColor: '#ffdd00' };
    if (combo >= 3) return { borderColor: '#ffcc33' };
    return { borderColor: '#8b6914' };
  });

  const mistStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: mistOffset.value }],
  }));

  const borderGlowShadow = Platform.OS === 'web'
    ? (combo >= 3 ? { boxShadow: `0 0 40px ${combo >= 5 ? '#ffcc33' : '#ffcc3380'}` } : {})
    : {
        shadowColor: '#ffcc33',
        shadowRadius: combo >= 5 ? 25 : 15,
        shadowOpacity: combo >= 3 ? 0.8 : 0,
      };

  return (
    <Animated.View style={[styles.container, { width, height }, glowColorStyle, borderGlowShadow]}>
      {/* Background Magical Atmosphere */}
      <LinearGradient
        colors={['#05080f', '#0a1018', '#05080f']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Animated Aura */}
      <Animated.View style={[styles.aura, auraStyle]} />
      
      {/* Magical Mist */}
      <Animated.View style={[styles.mist, mistStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.03)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Light Rays Effect */}
      <View style={styles.lightRays} pointerEvents="none">
        <LinearGradient
          colors={['rgba(255,204,51,0.05)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <Animated.View
        style={[
          styles.glowOverlay,
          { opacity: Math.max(glowOpacity.value, skillFlash.value) },
          lastSkillUsed === 'heal' && styles.glowGreen,
          lastSkillUsed === 'crit' && styles.glowRed,
          !lastSkillUsed && combo >= 5 && styles.glowGold,
          !lastSkillUsed && combo >= 3 && combo < 5 && styles.glowDimGold,
        ]}
        pointerEvents="none"
      />

      {combo >= 3 && (
        <View style={styles.comboBadge}>
          <Animated.Text style={[styles.comboText, combo >= 5 && styles.comboTextHot]}>
            {combo >= 5 ? `COMBO x${combo}` : `x${combo}`}
          </Animated.Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: '#8b6914',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#05080f',
    position: 'relative',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffcc33',
  },
  glowGreen: {
    backgroundColor: '#44ff88',
  },
  glowRed: {
    backgroundColor: '#ff4444',
  },
  glowGold: {
    backgroundColor: '#ffdd00',
  },
  glowDimGold: {
    backgroundColor: '#ffcc33',
  },
  comboBadge: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  comboText: {
    color: '#ffcc33',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  comboTextHot: {
    color: '#ffdd00',
    fontSize: 20,
    textShadowColor: '#ffcc33aa',
  },
  aura: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '20%',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 204, 51, 0.1)',
  },
  mist: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -200,
    width: 400,
    opacity: 0.5,
  },
  lightRays: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 400,
    transform: [{ rotate: '45deg' }],
  },
});
