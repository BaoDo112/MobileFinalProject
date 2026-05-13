import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { palette, spacing, typography } from "../theme/tokens";

// Fallback for Web and unsupported platforms
export default function MapView(props: any) {
  return (
    <View style={styles.webFallbackContainer}>
      <Ionicons name="map-outline" size={64} color={palette.text} />
      <Text style={styles.webFallbackText}>Interactive Map is not available on this platform (Web)</Text>
      <Text style={styles.webFallbackSub}>Please test via Expo Go on Android/iOS.</Text>
    </View>
  );
}

export function Marker(props: any) {
  return null;
}

const styles = StyleSheet.create({
  webFallbackContainer: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  webFallbackText: {
    fontFamily: typography.h3,
    fontSize: 18,
    color: palette.text,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  webFallbackSub: {
    fontFamily: typography.body,
    fontSize: 14,
    color: palette.textMuted,
    textAlign: "center",
  },
});