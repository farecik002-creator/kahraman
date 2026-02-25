import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { EnemyState } from '../../hooks/useGameLogic';

interface EnemyPanelProps {
  enemy: EnemyState;
  wave: number;
  enemyIndex: number;
}

export function EnemyPanel({ enemy, wave, enemyIndex }: EnemyPanelProps) {
  const hpPercent = enemy.hp / enemy.maxHP;
  const shakeX = useSharedValue(0);
  const prevHPRef = React.useRef(enemy.hp);

  useEffect(() => {
    if (enemy.hp < prevHPRef.current) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 55 }),
        withTiming(6, { duration: 55 }),
        withTiming(0, { duration: 50 })
      );
    }
    prevHPRef.current = enemy.hp;
  }, [enemy.hp]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const barColor =
    hpPercent > 0.5 ? '#cc3333' : hpPercent > 0.25 ? '#cc7700' : '#aa0000';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          {enemy.iconSet === 'ion' ? (
            <Ionicons name={enemy.iconName as any} size={28} color="#cc3333" />
          ) : (
            <MaterialCommunityIcons name={enemy.iconName as any} size={28} color="#cc3333" />
          )}
        </View>
        <Animated.View style={[styles.nameBlock, shakeStyle]}>
          <Text style={styles.enemyName}>{enemy.name}</Text>
          <Text style={styles.enemyTitle}>{enemy.title} — Lv.{enemy.level}</Text>
        </Animated.View>
        <View style={styles.waveBlock}>
          <Text style={styles.waveLabel}>WAVE</Text>
          <Text style={styles.waveNum}>{wave}</Text>
          <Text style={styles.enemyCount}>{enemyIndex + 1}/5</Text>
        </View>
      </View>
      <View style={styles.hpRow}>
        <Text style={styles.hpLabel}>HP</Text>
        <View style={styles.hpBarBg}>
          <Animated.View
            style={[
              styles.hpBarFill,
              { width: `${Math.max(0, hpPercent * 100)}%`, backgroundColor: barColor },
            ]}
          />
          <View style={styles.hpBarSegments}>
            {[0.25, 0.5, 0.75].map(seg => (
              <View key={seg} style={[styles.hpSegLine, { left: `${seg * 100}%` }]} />
            ))}
          </View>
        </View>
        <Text style={styles.hpText}>
          {enemy.hp}/{enemy.maxHP}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d1322',
    borderWidth: 1,
    borderColor: '#8b6914',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a0808',
    borderWidth: 1,
    borderColor: '#cc3333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBlock: {
    flex: 1,
  },
  enemyName: {
    color: '#e8d5a3',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  enemyTitle: {
    color: '#a09070',
    fontSize: 12,
    marginTop: 1,
  },
  waveBlock: {
    alignItems: 'center',
  },
  waveLabel: {
    color: '#8b6914',
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '700',
  },
  waveNum: {
    color: '#d4af37',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  enemyCount: {
    color: '#a09070',
    fontSize: 10,
  },
  hpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hpLabel: {
    color: '#cc3333',
    fontSize: 11,
    fontWeight: '700',
    width: 20,
    letterSpacing: 0.5,
  },
  hpBarBg: {
    flex: 1,
    height: 14,
    backgroundColor: '#200808',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#440000',
    overflow: 'hidden',
    position: 'relative',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 7,
  },
  hpBarSegments: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hpSegLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  hpText: {
    color: '#e8d5a3',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
});
