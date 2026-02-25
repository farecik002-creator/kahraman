import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PLAYER_MAX_HP, PLAYER_MAX_MANA } from '../../constants/gameData';

interface PlayerStatsProps {
  playerHP: number;
  playerMana: number;
  defense: number;
  critActive: boolean;
  playerAttacked: boolean;
}

function Bar({ value, max, fillColor, bgColor, glowColor }: {
  value: number;
  max: number;
  fillColor: string;
  bgColor: string;
  glowColor: string;
}) {
  const animatedWidth = useSharedValue(value / max);

  useEffect(() => {
    animatedWidth.value = withSpring(value / max, { damping: 15, stiffness: 100 });
  }, [value, max]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  const barGlow = Platform.OS === 'web'
    ? { boxShadow: `0 0 12px ${glowColor}88` }
    : {};
  return (
    <View style={[styles.barBg, { backgroundColor: bgColor }]}>
      <Animated.View style={[styles.barFill, { backgroundColor: fillColor }, fillStyle, barGlow]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={styles.barSegments}>
        {[0.25, 0.5, 0.75].map(s => (
          <View key={s} style={[styles.barSeg, { left: `${s * 100}%` }]} />
        ))}
      </View>
    </View>
  );
}

export function PlayerStats({ playerHP, playerMana, defense, critActive, playerAttacked }: PlayerStatsProps) {
  const hpPct = playerHP / PLAYER_MAX_HP;
  const hpColor = hpPct > 0.5 ? '#cc3333' : hpPct > 0.25 ? '#cc6622' : '#ff2200';

  return (
    <View style={[styles.container, playerAttacked && styles.attacked]}>
      <View style={styles.statRow}>
        <View style={styles.iconLabel}>
          <Ionicons name="heart" size={14} color={hpColor} />
          <Text style={[styles.valText, { color: hpColor }]}>{playerHP}</Text>
        </View>
        <View style={styles.barWrap}>
          <Bar value={playerHP} max={PLAYER_MAX_HP} fillColor={hpColor} bgColor="#1a0808" glowColor={hpColor} />
        </View>
        <Text style={styles.maxText}>/{PLAYER_MAX_HP}</Text>
        {defense > 0 && (
          <View style={styles.defBadge}>
            <Ionicons name="shield" size={10} color="#7799ff" />
            <Text style={styles.defText}>{defense}</Text>
          </View>
        )}
      </View>

      <View style={styles.statRow}>
        <View style={styles.iconLabel}>
          <Ionicons name="star" size={14} color="#4488ff" />
          <Text style={[styles.valText, { color: '#4488ff' }]}>{playerMana}</Text>
        </View>
        <View style={styles.barWrap}>
          <Bar value={playerMana} max={PLAYER_MAX_MANA} fillColor="#2255cc" bgColor="#080818" glowColor="#4488ff" />
        </View>
        <Text style={styles.maxText}>/{PLAYER_MAX_MANA}</Text>
        {critActive && (
          <View style={styles.critBadge}>
            <MaterialCommunityIcons name="diamond" size={10} color="#88ffee" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#080d18',
    borderTopWidth: 1,
    borderColor: '#1a1a30',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  attacked: {
    backgroundColor: '#120808',
    borderTopColor: '#441111',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 44,
  },
  valText: {
    fontSize: 12,
    fontWeight: '700',
  },
  barWrap: {
    flex: 1,
  },
  barBg: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barSegments: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  barSeg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  maxText: {
    color: '#555566',
    fontSize: 10,
    width: 34,
    textAlign: 'right',
  },
  defBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#0a1030',
    borderWidth: 1,
    borderColor: '#224499',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  defText: {
    color: '#7799ff',
    fontSize: 9,
    fontWeight: '700',
  },
  critBadge: {
    backgroundColor: '#082820',
    borderWidth: 1,
    borderColor: '#229988',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
});
