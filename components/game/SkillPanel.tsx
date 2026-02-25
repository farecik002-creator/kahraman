import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PLAYER_MAX_MANA } from '../../constants/gameData';

interface SkillPanelProps {
  playerMana: number;
  isProcessing: boolean;
  critActive: boolean;
  onHeal: () => void;
  onCritStrike: () => void;
}

interface SkillButtonProps {
  label: string;
  cost: number;
  mana: number;
  disabled: boolean;
  active?: boolean;
  onPress: () => void;
  iconName: string;
  iconSet: 'ion' | 'mci';
  accentColor: string;
}

function SkillButton({
  label,
  cost,
  mana,
  disabled,
  active,
  onPress,
  iconName,
  iconSet,
  accentColor,
}: SkillButtonProps) {
  const canAfford = mana >= cost;
  const isDisabled = disabled || !canAfford;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.skillBtn,
        {
          borderColor: active ? accentColor : isDisabled ? '#333344' : '#8b6914',
          backgroundColor: active
            ? `${accentColor}22`
            : isDisabled
            ? '#0a0a18'
            : '#0d1322',
          opacity: pressed ? 0.75 : 1,
          shadowColor: active ? accentColor : 'transparent',
          shadowOpacity: active ? 0.8 : 0,
          shadowRadius: active ? 8 : 0,
        },
      ]}
    >
      <View style={styles.skillIconWrap}>
        {iconSet === 'ion' ? (
          <Ionicons
            name={iconName as any}
            size={20}
            color={isDisabled ? '#555566' : accentColor}
          />
        ) : (
          <MaterialCommunityIcons
            name={iconName as any}
            size={20}
            color={isDisabled ? '#555566' : accentColor}
          />
        )}
      </View>
      <Text style={[styles.skillLabel, { color: isDisabled ? '#555566' : '#e8d5a3' }]}>
        {label}
      </Text>
      <View style={styles.costRow}>
        <Ionicons name="star" size={9} color={canAfford ? '#3366cc' : '#444455'} />
        <Text style={[styles.costText, { color: canAfford ? '#6699ff' : '#444455' }]}>
          {cost}
        </Text>
      </View>
      {active && (
        <View style={[styles.activeTag, { borderColor: accentColor }]}>
          <Text style={[styles.activeText, { color: accentColor }]}>RDY</Text>
        </View>
      )}
    </Pressable>
  );
}

export function SkillPanel({ playerMana, isProcessing, critActive, onHeal, onCritStrike }: SkillPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SKILLS</Text>
      <View style={styles.manaBar}>
        <View
          style={[
            styles.manaFill,
            { height: `${(playerMana / PLAYER_MAX_MANA) * 100}%` },
          ]}
        />
      </View>
      <SkillButton
        label="HEAL"
        cost={30}
        mana={playerMana}
        disabled={isProcessing}
        onPress={onHeal}
        iconName="heart"
        iconSet="ion"
        accentColor="#ff88bb"
      />
      <SkillButton
        label="CRIT"
        cost={40}
        mana={playerMana}
        disabled={isProcessing}
        active={critActive}
        onPress={onCritStrike}
        iconName="diamond"
        iconSet="mci"
        accentColor="#88ffee"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 66,
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  title: {
    color: '#8b6914',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  manaBar: {
    width: 6,
    height: 60,
    backgroundColor: '#080820',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#112244',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  manaFill: {
    width: '100%',
    backgroundColor: '#3366cc',
    borderRadius: 3,
  },
  skillBtn: {
    width: 60,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 3,
    position: 'relative',
  },
  skillIconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  costText: {
    fontSize: 9,
    fontWeight: '700',
  },
  activeTag: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: '#0a1a18',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  activeText: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
