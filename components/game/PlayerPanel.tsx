import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PLAYER_MAX_HP, PLAYER_MAX_MANA } from '../../constants/gameData';

interface PlayerPanelProps {
  playerHP: number;
  playerMana: number;
  defense: number;
  combo: number;
  isProcessing: boolean;
  critActive: boolean;
  playerAttacked: boolean;
}

function StatBar({
  value,
  max,
  color,
  bgColor,
  borderColor,
}: {
  value: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <View style={[styles.barBg, { backgroundColor: bgColor, borderColor }]}>
      <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

export function PlayerPanel({
  playerHP,
  playerMana,
  defense,
  combo,
  isProcessing,
  critActive,
  playerAttacked,
}: PlayerPanelProps) {
  return (
    <View style={[styles.container, playerAttacked && styles.attacked]}>
      <View style={styles.heroRow}>
        <View style={styles.heroIcon}>
          <MaterialCommunityIcons name="shield-sword" size={26} color="#d4af37" />
        </View>
        <View style={styles.statsBlock}>
          <View style={styles.statRow}>
            <Ionicons name="heart" size={13} color="#cc3333" style={styles.statIcon} />
            <Text style={styles.statVal}>
              {playerHP}/{PLAYER_MAX_HP}
            </Text>
            <View style={styles.barWrap}>
              <StatBar
                value={playerHP}
                max={PLAYER_MAX_HP}
                color="#cc3333"
                bgColor="#200808"
                borderColor="#440000"
              />
            </View>
          </View>
          <View style={styles.statRow}>
            <Ionicons name="star" size={13} color="#3366cc" style={styles.statIcon} />
            <Text style={styles.statVal}>
              {playerMana}/{PLAYER_MAX_MANA}
            </Text>
            <View style={styles.barWrap}>
              <StatBar
                value={playerMana}
                max={PLAYER_MAX_MANA}
                color="#3366cc"
                bgColor="#080820"
                borderColor="#112244"
              />
            </View>
          </View>
        </View>
        <View style={styles.rightStats}>
          {defense > 0 && (
            <View style={styles.badge}>
              <Ionicons name="shield" size={12} color="#7799ff" />
              <Text style={styles.badgeText}>{defense}</Text>
            </View>
          )}
          {combo > 1 && (
            <View style={[styles.badge, styles.comboBadge]}>
              <Text style={styles.comboText}>x{combo}</Text>
            </View>
          )}
          {critActive && (
            <View style={[styles.badge, styles.critBadge]}>
              <MaterialCommunityIcons name="diamond" size={11} color="#88ffee" />
            </View>
          )}
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.turnPill, isProcessing && styles.turnPillProcessing]}>
          <View style={[styles.turnDot, { backgroundColor: isProcessing ? '#ff8800' : '#44ff88' }]} />
          <Text style={[styles.turnText, isProcessing && { color: '#ff8800' }]}>
            {isProcessing ? 'PROCESSING' : 'YOUR TURN'}
          </Text>
        </View>
        {combo > 1 && (
          <Text style={styles.comboLabel}>COMBO x{combo}</Text>
        )}
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
  attacked: {
    borderColor: '#cc3333',
    backgroundColor: '#150808',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0f1a0a',
    borderWidth: 1.5,
    borderColor: '#d4af37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBlock: {
    flex: 1,
    gap: 5,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statIcon: {
    width: 16,
  },
  statVal: {
    color: '#e8d5a3',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 48,
  },
  barWrap: {
    flex: 1,
  },
  barBg: {
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  rightStats: {
    flexDirection: 'column',
    gap: 4,
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2040',
    borderWidth: 1,
    borderColor: '#224499',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  badgeText: {
    color: '#7799ff',
    fontSize: 11,
    fontWeight: '700',
  },
  comboBadge: {
    backgroundColor: '#302008',
    borderColor: '#aa7722',
  },
  critBadge: {
    backgroundColor: '#083030',
    borderColor: '#229988',
  },
  comboText: {
    color: '#ffcc44',
    fontSize: 12,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  turnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#081a10',
    borderWidth: 1,
    borderColor: '#224433',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  turnPillProcessing: {
    backgroundColor: '#1a0e00',
    borderColor: '#443311',
  },
  turnDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  turnText: {
    color: '#44ff88',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  comboLabel: {
    color: '#ffcc44',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
