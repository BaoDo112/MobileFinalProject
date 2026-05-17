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
      <View pointerEvents="none" style={styles.topOrb} />
      <View pointerEvents="none" style={styles.bottomOrb} />
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md
  },
  headerCard: {
    gap: spacing.xs,
    padding: spacing.lg,
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
    fontSize: 34,
    lineHeight: 40,
    color: palette.text,
    fontFamily: typography.display,
    fontWeight: "700"
  },
  titleDark: {
    color: palette.background
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.textMuted,
    fontFamily: typography.body
  },
  subtitleDark: {
    color: palette.backgroundAlt
  },
  topOrb: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: palette.cardStrong,
    opacity: 0.55
  },
  bottomOrb: {
    position: "absolute",
    bottom: 80,
    left: -60,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: palette.backgroundAlt,
    opacity: 0.65
  }
});
