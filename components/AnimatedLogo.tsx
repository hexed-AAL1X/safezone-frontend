import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing, interpolate } from 'react-native-reanimated';

const AnimatedImage = Animated.createAnimatedComponent(Image);

type Props = { size?: number };

export default function AnimatedLogo({ size = 280 }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) });
  }, []);

  const appearStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 1], [0, 1]),
    transform: [
      { scale: interpolate(t.value, [0, 1], [0.96, 1]) },
      { translateY: interpolate(t.value, [0, 1], [8, 0]) },
    ],
  }));

  const source = require('../assets/images/logo.png');

  return (
    <View style={[styles.container, { width: size }]}>
      <AnimatedImage source={source} style={[styles.image, appearStyle]} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { aspectRatio: 1024 / 682, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  image: { position: 'absolute', width: '100%', height: '100%' },
});
