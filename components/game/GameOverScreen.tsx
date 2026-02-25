import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface GameOverScreenProps {
  onRestart: () => void;
  wave: number;
  enemyIndex: number;
}

export function GameOverScreen({ onRestart, wave, enemyIndex }: GameOverScreenProps) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const btnScale = useSharedValue(0.8);
  const btnOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 400 });
    btnScale.value = withDelay(500, withSpring(1, { damping: 10 }));
    btnOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
    opacity: btnOpacity.value,
  }));

  const totalEnemies = (wave - 1) * 5 + enemyIndex;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.panel, containerStyle]}>
        <View style={styles.skullWrap}>
          <MaterialCommunityIcons name="skull" size={56} color="#cc3333" />
        </View>
        <Text style={styles.title}>DEFEATED</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>Your soul fades into darkness...</Text>
        <View style={styles.statsBlock}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>WAVE REACHED</Text>
            <Text style={styles.statValue}>{wave}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>ENEMIES SLAIN</Text>
            <Text style={styles.statValue}>{totalEnemies}</Text>
          </View>
        </View>
        <Animated.View style={btnStyle}>
          <Pressable
            onPress={onRestart}
            style={({ pressed }) => [styles.restartBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
          >
            <MaterialCommunityIcons name="sword" size={18} color="#0a0a14" />
            <Text style={styles.restartText}>RISE AGAIN</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  panel: {
    width: '80%',
    maxWidth: 340,
    backgroundColor: '#0d1020',
    borderWidth: 2,
    borderColor: '#8b1010',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 16,
  },
  skullWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1a0808',
    borderWidth: 2,
    borderColor: '#cc3333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#cc3333',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
  },
  divider: {
    width: '70%',
    height: 1,
    backgroundColor: '#8b1010',
  },
  subtitle: {
    color: '#a09070',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statsBlock: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statLabel: {
    color: '#8b6914',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  statValue: {
    color: '#d4af37',
    fontSize: 28,
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#8b6914',
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#d4af37',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 10,
  },
  restartText: {
    color: '#0a0a14',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
