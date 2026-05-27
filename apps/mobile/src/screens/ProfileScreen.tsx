import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { assetsApi } from "../api/assets";
import { profileApi } from "../api/profile";
import { ApiError } from "../api/client";
import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { StickyActionBar } from "../components/StickyActionBar";
import { useSessionStore } from "../state/session";
import { OrganizerProfileSections } from "./profile/OrganizerProfileSections";
import { VisitorProfileSections } from "./profile/VisitorProfileSections";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { UserProfile, UserRole } from "../types/models";

type ProfileScreenProps = Readonly<{
  role: UserRole;
  profile: UserProfile | null;
  onSwitchRole: () => void | Promise<void>;
  onLogout: () => void | Promise<void>;
}>;

type FeedbackState = Readonly<{
  tone: "error" | "success";
  message: string;
}>;

function getUploadErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Profile photo upload failed.";
}

export function ProfileScreen({ role, profile, onSwitchRole, onLogout }: ProfileScreenProps) {
  const setSessionEnvelope = useSessionStore((state) => state.setSessionEnvelope);
  const [showUploadBox, setShowUploadBox] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatarUrl ?? null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setAvatarUri(profile?.avatarUrl ?? null);
  }, [profile?.avatarUrl, profile?.id]);

  const openImagePicker = async () => {
    setFeedback(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFeedback({ tone: "error", message: "Photo library permission is required to upload an avatar." });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    const selectedAsset = result.canceled ? undefined : result.assets[0];
    if (!selectedAsset?.uri) {
      return;
    }

    setIsUploading(true);
    try {
      const uploadedAsset = await assetsApi.uploadImage({
        uri: selectedAsset.uri,
        mimeType: selectedAsset.mimeType,
        fileName: selectedAsset.fileName,
        scope: "profile-avatar",
        targetId: profile?.userId,
      });
      const nextSession = await profileApi.updateAvatar(uploadedAsset.url);
      await setSessionEnvelope(nextSession);
      setAvatarUri(uploadedAsset.url);
      setShowUploadBox(false);
      setFeedback({ tone: "success", message: "Profile photo saved to Cloudflare R2." });
    } catch (error) {
      setFeedback({ tone: "error", message: getUploadErrorMessage(error) });
    } finally {
      setIsUploading(false);
    }
  };

  const nextRoleLabel = role === "VISITOR" ? "Organizer" : "Visitor";
  const resolvedAvatarUri = assetsApi.resolveAssetUrl(avatarUri ?? profile?.avatarUrl ?? null);

  if (!profile) {
    return (
      <ScreenShell title="Profile" subtitle="The workspace bootstrap is missing the current profile payload.">
        <StatusChip label={`${role.toLowerCase()} workspace`} tone="warning" />
        <EmptyStateBanner
          title="Profile data is not ready"
          description="Refresh the session bootstrap or sign in again so the current role can hydrate its profile shell."
          actionLabel="Sign out"
          onAction={() => {
            void onLogout();
          }}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>

      <View style={styles.profileCard}>
        <Text style={styles.cardLabel}>Name</Text>
        <Text style={styles.profileName}>{profile.name}</Text>

        <View style={styles.bioRow}>
          <Pressable style={styles.avatarFrame} onPress={() => setShowUploadBox((current) => !current)} accessibilityRole="button">
            {resolvedAvatarUri ? (
              <Image source={{ uri: resolvedAvatarUri }} style={styles.avatarImage} />
            ) : (
              <>
                <Text style={styles.avatarPlus}>+</Text>
                <Text style={styles.avatarText}>Upload</Text>
              </>
            )}
          </Pressable>

          <View style={styles.bioStack}>
            <Text style={styles.cardLabel}>Bio</Text>
            <Text style={styles.bioText}>{profile.tagline ?? "No bio available."}</Text>
          </View>
        </View>

        {showUploadBox ? (
          <View style={styles.uploadBox}>
            <Text style={styles.uploadTitle}>Upload profile photo</Text>
            <Text style={styles.uploadText}>Choose an image from your photo library to upload to Cloudflare R2 and use as your avatar.</Text>
            <View style={styles.uploadActions}>
              <Pressable style={[styles.uploadPrimaryButton, isUploading && styles.buttonDisabled]} onPress={openImagePicker} disabled={isUploading}>
                <Text style={styles.uploadPrimaryButtonText}>{isUploading ? "Uploading..." : "Choose photo"}</Text>
              </Pressable>
              <Pressable style={styles.uploadSecondaryButton} onPress={() => setShowUploadBox(false)} disabled={isUploading}>
                <Text style={styles.uploadSecondaryButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {feedback ? <Text style={feedback.tone === "error" ? styles.errorText : styles.successText}>{feedback.message}</Text> : null}

        {profile.highlights.length > 0 ? (
          <>
            <Text style={styles.cardLabel}>Highlights</Text>
            <View style={styles.interestRow}>
              {profile.highlights.map((highlight) => (
                <View key={highlight} style={styles.interestChip}>
                  <Text style={styles.interestText}>{highlight}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <EmptyStateBanner
            title="No highlights yet"
            description="This workspace will fill out highlights and profile preferences as later feature slices start consuming the shared bootstrap data."
          />
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardLabel}>Personal information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Full name</Text>
          <Text style={styles.infoValue}>{profile.fullName ?? profile.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gender</Text>
          <Text style={styles.infoValue}>{profile.gender ?? "Not specified"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date of birth</Text>
          <Text style={styles.infoValue}>{profile.dateOfBirth ?? "Not specified"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{profile.email ?? "Not specified"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone number</Text>
          <Text style={styles.infoValue}>{profile.phoneNumber ?? "Not specified"}</Text>
        </View>
      </View>

      {role === "VISITOR" ? <VisitorProfileSections profile={profile} /> : null}
      {role === "ORGANIZER" ? <OrganizerProfileSections profile={profile} /> : null}

      <StickyActionBar
        primaryLabel={`Switch to ${nextRoleLabel}`}
        onPrimaryPress={() => {
          void onSwitchRole();
        }}
        secondaryLabel="Log out"
        onSecondaryPress={() => {
          void onLogout();
        }}
        helperText="The active workspace is restored from the shared session bootstrap instead of a local-only role toggle."
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({

  profileCard: {
    backgroundColor: palette.cardStrong,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardLabel: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  profileName: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  bioText: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: typography.body,
  },
  bioRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  avatarFrame: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: palette.accent,
    backgroundColor: palette.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    flexShrink: 0,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 43,
  },
  avatarPlus: {
    color: palette.accent,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "700",
  },
  avatarText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  bioStack: {
    flex: 1,
    gap: spacing.xs,
  },
  uploadBox: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  uploadTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  uploadText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  uploadActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  uploadPrimaryButton: {
    backgroundColor: palette.text,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  uploadPrimaryButtonText: {
    color: palette.background,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700",
  },
  uploadSecondaryButton: {
    backgroundColor: palette.cardStrong,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    flex: 1,
  },
  uploadSecondaryButtonText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700",
  },
  successText: {
    color: palette.success,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: palette.accentStrong,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  interestRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  interestChip: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  interestText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  infoValue: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  statValue: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "700",
  },
  statLabel: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
