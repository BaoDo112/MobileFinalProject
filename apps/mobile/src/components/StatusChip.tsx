import { StyleSheet, Text, View } from "react-native";

import { palette, radii, spacing, typography } from "../theme/tokens";

type StatusChipTone = "neutral" | "success" | "warning" | "danger";

type StatusChipProps = Readonly<{
  label: string;
  tone?: StatusChipTone;
}>;

const toneMap: Record<StatusChipTone, { backgroundColor: string; color: string; borderColor: string }> = {
  neutral: {
    backgroundColor: palette.card,
    color: palette.text,
    borderColor: palette.border,
  },
  success: {
    backgroundColor: "rgba(22, 163, 74, 0.12)",
    color: "#166534",
    borderColor: "rgba(22, 163, 74, 0.28)",
  },
  warning: {
    backgroundColor: "rgba(217, 119, 6, 0.12)",
    color: "#92400e",
    borderColor: "rgba(217, 119, 6, 0.28)",
  },
  danger: {
    backgroundColor: "rgba(220, 38, 38, 0.12)",
    color: "#991b1b",
    borderColor: "rgba(220, 38, 38, 0.28)",
  },
};

export function StatusChip({ label, tone = "neutral" }: StatusChipProps) {
  const colors = toneMap[tone];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundColor, borderColor: colors.borderColor }]}>
      <Text style={[styles.label, { color: colors.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  label: {
    fontFamily: typography.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
});
