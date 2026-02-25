import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { EnemyState } from '../../hooks/useGameLogic';

interface EnemyPanelProps {
  enemy: EnemyState;
  wave: number;
  enemyIndex: number;
}

export function EnemyPanel({ enemy, wave, enemyIndex }: EnemyPanelProps) {
  const hpPercent = Math.max(0, enemy.hp / enemy.maxHP);
  const animatedHP = useSharedValue(hpPercent);
  const shakeX = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const prevHPRef = React.useRef(enemy.hp);

  useEffect(() => {
    animatedHP.value = withTiming(hpPercent, { duration: 300, easing: Easing.out(Easing.ease) });
    if (enemy.hp < prevHPRef.current) {
      flashOpacity.value = withSequence(withTiming(1, { duration: 50 }), withTiming(0, { duration: 250 }));
      shakeX.value = withSequence(
        withTiming(-10, { duration: 55 }),
        withTiming(10, { duration: 55 }),
        withTiming(-7, { duration: 50 }),
        withTiming(7, { duration: 50 }),
        withTiming(-4, { duration: 45 }),
        withTiming(0, { duration: 45 })
      );
    }
    prevHPRef.current = enemy.hp;
  }, [enemy.hp, hpPercent]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const hpBarStyle = useAnimatedStyle(() => ({
    width: `${animatedHP.value * 100}%`,
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const hpColor =
    hpPercent > 0.5 ? '#cc2222' : hpPercent > 0.25 ? '#cc6600' : '#ff1100';

  const barShadow = Platform.OS === 'web'
    ? { boxShadow: `0 0 8px ${hpColor}` }
    : {};

  return (
    <View style={styles.container}>
      <View style={styles.bgOverlay} />
      <View style={styles.innerRow}>
        <Animated.View style={[styles.iconSection, shakeStyle]}>
          <View style={styles.iconRing}>
            {enemy.iconSet === 'ion' ? (
              <Ionicons name={enemy.iconName as any} size={32} color={hpColor} />
            ) : (
              <MaterialCommunityIcons name={enemy.iconName as any} size={32} color={hpColor} />
            )}
          </View>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>LV.{enemy.level}</Text>
          </View>
        </Animated.View>

        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.enemyTitle}>{enemy.title.toUpperCase()}</Text>
            <Text style={styles.enemyName}>{enemy.name}</Text>
          </View>

          <View style={styles.hpRow}>
            <View style={styles.hpBarBg}>
              <LinearGradient
                colors={['#400', '#100']}
                style={StyleSheet.absoluteFill}
              />
              <Animated.View style={[styles.hpBarFill, { backgroundColor: hpColor }, hpBarStyle, barShadow]} />
              <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff' }, flashStyle]} />
              <View style={styles.hpBarGlass} />
            </View>
            <Text style={styles.hpText}>
              {enemy.hp}
              <Text style={styles.hpMax}>/{enemy.maxHP}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.waveSection}>
          <Text style={styles.waveLbl}>WAVE</Text>
          <Text style={styles.waveNum}>{wave}</Text>
          <View style={styles.enemyDots}>
            {[0, 1, 2, 3, 4].map(i => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i < enemyIndex ? '#333333' : i === enemyIndex ? '#d4af37' : '#8b6914',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5a1010',
    overflow: 'hidden',
    backgroundColor: '#080810',
    position: 'relative',
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(80,0,0,0.12)',
  },
  innerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },
  iconSection: {
    alignItems: 'center',
    gap: 4,
  },
  iconRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#160808',
    borderWidth: 1.5,
    borderColor: '#5a1010',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelPill: {
    backgroundColor: '#2a0808',
    borderWidth: 1,
    borderColor: '#5a1010',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: -4,
  },
  levelText: {
    color: '#cc4444',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  infoSection: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    gap: 1,
  },
  enemyTitle: {
    color: '#664422',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2,
  },
  enemyName: {
    color: '#e8c8a0',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hpBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#1a0505',
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: '#330000',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  hpBarGlass: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  hpText: {
    color: '#e8c8a0',
    fontSize: 10,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
  hpMax: {
    color: '#664433',
    fontSize: 9,
  },
  waveSection: {
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  waveLbl: {
    color: '#664422',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  waveNum: {
    color: '#d4af37',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 28,
  },
  enemyDots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
