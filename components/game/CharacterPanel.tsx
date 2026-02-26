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
  const breathScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const glowColor = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const skillFlash = useSharedValue(0);

  useEffect(() => {
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.028, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.974, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (combo >= 5) {
      glowOpacity.value = withTiming(0.85, { duration: 300 });
      shakeX.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 60 }),
          withTiming(4, { duration: 60 }),
          withTiming(-3, { duration: 60 }),
          withTiming(3, { duration: 60 }),
          withTiming(0, { duration: 60 })
        ),
        3,
        false
      );
    } else if (combo >= 3) {
      glowOpacity.value = withTiming(0.45, { duration: 400 });
      shakeX.value = 0;
    } else {
      glowOpacity.value = withTiming(0, { duration: 600 });
      shakeX.value = 0;
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

  const characterStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breathScale.value },
      { translateX: shakeX.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: Math.max(glowOpacity.value, skillFlash.value),
    };
  });

  const auraStyle = useAnimatedStyle(() => ({
    opacity: withTiming(combo >= 3 ? 0.3 : 0, { duration: 500 }),
    transform: [{ scale: withRepeat(withTiming(1.2, { duration: 2000 }), -1, true) }],
  }));

  const glowColorStyle = useAnimatedStyle(() => {
    if (glowColor.value === 1) {
      return { borderColor: '#44ff88' };
    } else if (glowColor.value === 2) {
      return { borderColor: '#ff4444' };
    } else if (combo >= 5) {
      return { borderColor: '#ffdd00' };
    } else if (combo >= 3) {
      return { borderColor: '#ffcc33' };
    }
    return { borderColor: '#8b6914' };
  });

  const borderGlowShadow = Platform.OS === 'web'
    ? (combo >= 3 ? { boxShadow: `0 0 30px ${combo >= 5 ? '#ffcc33' : '#ffcc3380'}` } : {})
    : {
        shadowColor: '#ffcc33',
        shadowRadius: combo >= 5 ? 20 : 10,
        shadowOpacity: combo >= 3 ? 0.6 : 0,
      };

  return (
    <Animated.View style={[styles.container, { width, height }, glowColorStyle, borderGlowShadow]}>
      <Animated.View style={[styles.aura, auraStyle]} />
      <Animated.View style={[styles.characterWrap, characterStyle]}>
        <View style={styles.fallbackIcon}>
          <MaterialCommunityIcons name="shield-sword" size={Math.floor(width * 0.55)} color="#ffcc33" />
        </View>
        <Image
          source={require('../../assets/images/knight.png')}
          style={[StyleSheet.absoluteFill, { width: width - 8, height: height - 8 }]}
          contentFit="cover"
          transition={400}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.glowOverlay,
          glowStyle,
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
    borderWidth: 1.5,
    borderColor: '#8b6914',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#05080f',
    position: 'relative',
  },
  characterWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
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
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  comboText: {
    color: '#ffcc33',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  comboTextHot: {
    color: '#ffdd00',
    fontSize: 16,
    textShadowColor: '#ffcc3388',
  },
  aura: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 1000,
    backgroundColor: '#ffcc33',
    zIndex: -1,
  },
});
