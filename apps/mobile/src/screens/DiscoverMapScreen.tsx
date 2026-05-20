import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCallback, useState } from "react";

import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { StatusChip } from "../components/StatusChip";
import { useDiscover } from "../query/useDiscover";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { ExhibitionSummaryDto } from "../types/api";

// Map Platform Specifics
import MapView, { Marker } from "./MapComponent";

export function DiscoverMapScreen({
  onOpenGallery
}: Readonly<{
  onOpenGallery: (id: string) => void;
}>) {
  const discoverQuery = useDiscover();
  const galleries = discoverQuery.data ?? [];
  const [selectedGallery, setSelectedGallery] = useState<ExhibitionSummaryDto | null>(null);

  const handleMarkerPress = useCallback((gallery: ExhibitionSummaryDto) => {
    setSelectedGallery(gallery);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedGallery(null);
  }, []);

  if (Platform.OS === "web" || !MapView) {
    return (
      <View style={styles.webFallbackContainer}>
        <Ionicons name="map-outline" size={64} color={palette.text} />
        <Text style={styles.webFallbackText}>Interactive Map is available on iOS and Android devices</Text>
        <Text style={styles.webFallbackSub}>Please test via Expo Go on a real device.</Text>
      </View>
    );
  }

  if (discoverQuery.isLoading && !discoverQuery.data) {
    return (
      <View style={styles.webFallbackContainer}>
        <StatusChip label="Loading map exhibitions" tone="neutral" />
      </View>
    );
  }

  if (discoverQuery.isError && !discoverQuery.data) {
    return (
      <View style={styles.webFallbackContainer}>
        <ErrorRecoveryPanel
          title="Map data needs another try"
          description={discoverQuery.error instanceof Error ? discoverQuery.error.message : "Map discover query failed."}
          onRetry={() => discoverQuery.refetch()}
        />
      </View>
    );
  }

  const initialRegion = galleries.length > 0 ? {
    latitude: 10.776889,
    longitude: 106.700806,
    latitudeDelta: 0.08,
    longitudeDelta: 0.06,
  } : undefined;

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={initialRegion}
        onPress={clearSelection}
      >
        {galleries.map((gallery, index) => {
          const lat = initialRegion ? initialRegion.latitude + (index * 0.01) - 0.005 : 0;
          const lng = initialRegion ? initialRegion.longitude + (index * 0.01) - 0.005 : 0;
          
          const isSelected = selectedGallery?.id === gallery.id;
          let markerStyle: typeof styles.markerBodyPast | typeof styles.markerBodyLive | typeof styles.markerBodyUpcoming = styles.markerBodyPast;

          if (gallery.timelineStatus === "PRESENT") {
            markerStyle = styles.markerBodyLive;
          } else if (gallery.timelineStatus === "FUTURE") {
            markerStyle = styles.markerBodyUpcoming;
          }
          
          return (
            <Marker
              key={gallery.id}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={(e: any) => {
                e.stopPropagation();
                handleMarkerPress(gallery);
              }}
            >
              <View style={[styles.markerBody, markerStyle, isSelected && styles.markerBodySelected]}>
                <Ionicons name="location" size={24} color={palette.background} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {selectedGallery && (
        <View style={styles.detailCardContainer} pointerEvents="box-none">
          <View style={styles.detailCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardImagePlaceholder}>
                <Ionicons name="image-outline" size={24} color={palette.textMuted} />
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.cardTitle} numberOfLines={1}>{selectedGallery.title}</Text>
                  <Text style={styles.cardSub} numberOfLines={1}>{selectedGallery.dateLabel} • {selectedGallery.district}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.viewDetailBtn} 
              onPress={() => onOpenGallery(selectedGallery.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewDetailBtnText}>View Detail</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
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
  markerBody: {
    backgroundColor: palette.text,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: palette.background,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  markerBodyLive: {
    backgroundColor: palette.success
  },
  markerBodyUpcoming: {
    backgroundColor: palette.warning
  },
  markerBodyPast: {
    backgroundColor: palette.textMuted
  },
  markerBodySelected: {
    backgroundColor: palette.accent,
    transform: [{ scale: 1.1 }]
  },
  detailCardContainer: {
    position: "absolute",
    bottom: 156, // Avoid bottom tab
    left: spacing.md,
    right: spacing.md,
    alignItems: "center",
  },
  detailCard: {
    width: "100%",
    backgroundColor: palette.background,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  cardHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  cardImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: palette.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMeta: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: typography.h3,
    fontWeight: "800",
    fontSize: 18,
    color: palette.text,
  },
  cardSub: {
    fontFamily: typography.body,
    fontWeight: "600",
    fontSize: 13,
    color: palette.textMuted,
  },
  viewDetailBtn: {
    height: 48,
    backgroundColor: palette.text,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  viewDetailBtnText: {
    fontFamily: typography.body,
    fontWeight: "700",
    fontSize: 14,
    color: palette.background,
  }
});