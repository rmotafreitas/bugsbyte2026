import React from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";
import { THEME } from "../constants/theme";

interface SkeletonProps {
  width?: number | `${number}%` | "auto";
  height?: number | `${number}%` | "auto";
  style?: ViewStyle;
}

export function Skeleton({ width, height, style }: SkeletonProps) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[styles.skeleton, { width, height, opacity }, style]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: THEME.colors.muted,
    borderRadius: THEME.radius.default,
  },
});
