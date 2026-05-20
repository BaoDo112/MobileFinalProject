import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette, radii, spacing, typography } from "../theme/tokens";

type StickyActionBarProps = Readonly<{
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryDisabled?: boolean;
  primaryTestID?: string;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  secondaryTestID?: string;
  helperText?: string;
}>;

export function StickyActionBar({
  primaryLabel,
  onPrimaryPress,
  primaryDisabled,
  primaryTestID,
  secondaryLabel,
  onSecondaryPress,
  secondaryTestID,
  helperText,
}: StickyActionBarProps) {
  return (
    <View style={styles.shell}>
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
      <View style={styles.actions}>
        <Pressable
          style={[styles.primaryButton, primaryDisabled && styles.primaryButtonDisabled]}
          onPress={onPrimaryPress}
          disabled={primaryDisabled}
          testID={primaryTestID}
        >
          <Text style={styles.primaryText}>{primaryLabel}</Text>
        </Pressable>
        {secondaryLabel && onSecondaryPress ? (
          <Pressable style={styles.secondaryButton} onPress={onSecondaryPress} testID={secondaryTestID}>
            <Text style={styles.secondaryText}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: "rgba(250, 247, 242, 0.96)",
    borderRadius: radii.xl,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  helperText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.text,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryText: {
    color: palette.background,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.card,
    borderRadius: radii.pill,
    borderColor: palette.border,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  secondaryText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
});
