import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface MessageBannerProps {
  message: string;
}

export function MessageBanner({ message }: MessageBannerProps) {
  const scale = useSharedValue(1);
  const prevMsg = useRef(message);

  useEffect(() => {
    if (message !== prevMsg.current) {
      prevMsg.current = message;
      scale.value = 1.06;
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    }
  }, [message]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, style]}>
      <Text style={styles.text} numberOfLines={1}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0f1a',
    borderWidth: 1,
    borderColor: '#2a2a40',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  text: {
    color: '#c8b890',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
