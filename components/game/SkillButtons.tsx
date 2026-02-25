import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
  glowColor: string;
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
  glowColor,
}: SkillButtonProps) {
  const canAfford = mana >= cost;
  const isDisabled = disabled || !canAfford;
  const scale = useSharedValue(1);
  const glow = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    glow.value = withTiming(active ? 1 : 0, { duration: 300 });
  }, [active]);

  const handlePress = () => {
    if (isDisabled) return;
    scale.value = withSequence(withSpring(0.92), withSpring(1));
    onPress();
  };

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowShadow = Platform.OS === 'web'
    ? (active ? { boxShadow: `0 0 18px ${glowColor}` } : {})
    : {};

  return (
    <Pressable onPress={handlePress} disabled={isDisabled} style={{ flex: 1 }}>
      <Animated.View
        style={[
          styles.btn,
          {
            borderColor: active
              ? accentColor
              : isDisabled
              ? '#252535'
              : '#5a4a1a',
            opacity: isDisabled ? 0.5 : 1,
          },
          glowShadow,
          btnStyle,
        ]}
      >
        <View style={[styles.btnInner, { backgroundColor: isDisabled ? '#0a0a18' : '#0d1020' }]}>
          <View style={[styles.iconCircle, { borderColor: isDisabled ? '#252535' : accentColor }]}>
            {iconSet === 'ion' ? (
              <Ionicons
                name={iconName as any}
                size={22}
                color={isDisabled ? '#444455' : accentColor}
              />
            ) : (
              <MaterialCommunityIcons
                name={iconName as any}
                size={22}
                color={isDisabled ? '#444455' : accentColor}
              />
            )}
          </View>
          <View style={styles.labelBlock}>
            <Text style={[styles.btnLabel, { color: isDisabled ? '#444455' : '#e8d5a3' }]}>
              {label}
            </Text>
            <View style={styles.costRow}>
              <Ionicons name="star" size={9} color={canAfford ? '#4488ff' : '#333355'} />
              <Text style={[styles.costText, { color: canAfford ? '#6699ff' : '#333355' }]}>
                {cost} MP
              </Text>
            </View>
          </View>
          {active && (
            <View style={[styles.readyPill, { backgroundColor: accentColor + '22', borderColor: accentColor }]}>
              <Text style={[styles.readyText, { color: accentColor }]}>READY</Text>
            </View>
          )}
        </View>
        <View style={[styles.btnShine, { backgroundColor: accentColor }]} />
      </Animated.View>
    </Pressable>
  );
}

interface SkillButtonsProps {
  playerMana: number;
  isProcessing: boolean;
  critActive: boolean;
  onHeal: () => void;
  onCritStrike: () => void;
}

export function SkillButtons({ playerMana, isProcessing, critActive, onHeal, onCritStrike }: SkillButtonsProps) {
  return (
    <View style={styles.container}>
      <SkillButton
        label="HEAL"
        cost={30}
        mana={playerMana}
        disabled={isProcessing}
        onPress={onHeal}
        iconName="heart"
        iconSet="ion"
        accentColor="#44ff88"
        glowColor="#44ff8888"
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
        accentColor="#ff6644"
        glowColor="#ff664488"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: '#050810',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBlock: {
    flex: 1,
    gap: 2,
  },
  btnLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  costText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  readyPill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  readyText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  btnShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.35,
  },
});
