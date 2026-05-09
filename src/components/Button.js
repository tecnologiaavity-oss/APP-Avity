import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { theme } from "../theme";

export default function Button({
  title,
  onPress,
  loading = false,
  variant = "primary",
  disabled = false,
  style,
}) {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    if (variant === "primary") return theme.colors.primary;
    if (variant === "outline") return "transparent";
    return theme.colors.accent;
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    if (variant === "outline") return theme.colors.primary;
    return "#FFF";
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === "outline" && styles.outline,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  text: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
  },
});