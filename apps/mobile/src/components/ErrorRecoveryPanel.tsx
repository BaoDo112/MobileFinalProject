import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette, radii, spacing, typography } from "../theme/tokens";

type ErrorRecoveryPanelProps = Readonly<{
  title?: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
}>;

export function ErrorRecoveryPanel({
  title = "Something needs attention",
  description,
  retryLabel = "Try again",
  onRetry,
  secondaryLabel,
  onSecondaryAction,
}: ErrorRecoveryPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.actions}>
        {onRetry ? (
          <Pressable style={styles.primaryButton} onPress={onRetry}>
            <Text style={styles.primaryText}>{retryLabel}</Text>
          </Pressable>
        ) : null}
        {secondaryLabel && onSecondaryAction ? (
          <Pressable style={styles.secondaryButton} onPress={onSecondaryAction}>
            <Text style={styles.secondaryText}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(220, 38, 38, 0.08)",
    borderRadius: radii.lg,
    borderColor: "rgba(220, 38, 38, 0.2)",
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: "#991b1b",
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: "700",
  },
  description: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: palette.text,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryText: {
    color: palette.background,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryButton: {
    borderColor: palette.text,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700",
  },
});
