import { Platform } from "react-native";

export const palette = {
  background: "#f7eadf",
  backgroundAlt: "#f2ddd1",
  card: "#fff8f1",
  cardStrong: "#efd1c3",
  muted: "#f2e4d8",
  accent: "#9f2f2f",
  accentStrong: "#65161d",
  accentSoft: "#d87363",
  gold: "#c38d3a",
  moss: "#627553",
  plum: "#6d4154",
  success: "#2f7d5a",
  warning: "#b96c2a",
  text: "#251713",
  textMuted: "#6b5a54",
  border: "#ddc3b3",
  white: "#ffffff"
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  xxl: 44
} as const;

export const radii = {
  sm: 14,
  md: 24,
  lg: 34,
  xl: 42,
  pill: 999
} as const;

export const typography = {
  display: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }) ?? "serif",
  body: Platform.select({ ios: "Avenir Next", android: "sans-serif-medium", default: "sans-serif" }) ?? "sans-serif",
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }) ?? "monospace",
  h3: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }) ?? "serif"
} as const;
