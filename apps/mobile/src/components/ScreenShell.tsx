import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { palette, radii, spacing, typography } from "../theme/tokens";

type ScreenShellProps = Readonly<
  PropsWithChildren<{
    title?: string;
    subtitle?: string;
    eyebrow?: string;
    hideHeader?: boolean;
    headerVariant?: "card" | "dark";
  }>
>;

export function ScreenShell({ title, subtitle, eyebrow, hideHeader, headerVariant = "card", children }: ScreenShellProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topOrb} />
      <View style={styles.bottomOrb} />
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, hideHeader && styles.contentWithoutHeader]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {hideHeader || (!title && !eyebrow && !subtitle) ? null : (
          <View style={[styles.headerCard, headerVariant === "dark" && styles.headerCardDark]}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            {title ? <Text style={[styles.title, headerVariant === "dark" && styles.titleDark]}>{title}</Text> : null}
            {subtitle ? <Text style={[styles.subtitle, headerVariant === "dark" && styles.subtitleDark]}>{subtitle}</Text> : null}
          </View>
        )}
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background
  },
  root: {
    flex: 1,
    backgroundColor: palette.background
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 120,
    gap: spacing.sm
  },
  contentWithoutHeader: {
    paddingTop: 0,
  },
  headerCard: {
    gap: 6,
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: "hidden"
  },
  headerCardDark: {
    backgroundColor: palette.text,
    borderWidth: 0
  },
  eyebrow: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    color: palette.text,
    fontFamily: typography.display,
    fontWeight: "700"
  },
  titleDark: {
    color: palette.background
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.textMuted,
    fontFamily: typography.body
  },
  subtitleDark: {
    color: palette.backgroundAlt
  },
  topOrb: {
    position: "absolute",
    top: -52,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: palette.cardStrong,
    opacity: 0.42,
    pointerEvents: "none"
  },
  bottomOrb: {
    position: "absolute",
    bottom: 80,
    left: -60,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: palette.backgroundAlt,
    opacity: 0.65,
    pointerEvents: "none"
  }
});
