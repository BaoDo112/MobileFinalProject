import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette, radii, spacing, typography } from "../theme/tokens";

type EmptyStateBannerProps = Readonly<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}>;

export function EmptyStateBanner({ title, description, actionLabel, onAction }: EmptyStateBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: "700",
  },
  description: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: spacing.xs,
    alignSelf: "flex-start",
    backgroundColor: palette.text,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionText: {
    color: palette.background,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700",
  },
});
