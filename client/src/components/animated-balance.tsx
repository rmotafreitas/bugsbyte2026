// components/animated-balance.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, Easing } from "react-native";
import { THEME } from "../constants/theme";

interface AnimatedBalanceProps {
  value: number;
  currency?: string;
  fontSize?: number;
  color?: string;
  duration?: number;
}

export function AnimatedBalance({
  value,
  currency = "€",
  fontSize = 48,
  color = THEME.colors.foreground,
  duration = 1000,
}: AnimatedBalanceProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);
  const [displayText, setDisplayText] = React.useState("0.00");

  useEffect(() => {
    const startValue = displayValue.current;
    const endValue = value;

    // Reset animated value
    animatedValue.setValue(startValue);

    // Animate to new value with smoother easing
    Animated.timing(animatedValue, {
      toValue: endValue,
      duration: duration,
      useNativeDriver: false,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth cubic bezier
    }).start();

    // Listen to animation updates
    const listenerId = animatedValue.addListener(({ value: newValue }) => {
      displayValue.current = newValue;
      setDisplayText(newValue.toFixed(2));
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value]);

  return (
    <View style={styles.container}>
      <Text style={[styles.currency, { fontSize: fontSize * 0.6, color }]}>
        {currency}
      </Text>
      <Text style={[styles.value, { fontSize, color }]}>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  currency: {
    fontWeight: "600",
    marginTop: 8,
    marginRight: 4,
  },
  value: {
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
