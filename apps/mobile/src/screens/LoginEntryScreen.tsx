import { useState } from "react";
import { Controller, type Control, type FieldErrors, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authApi } from "../api/auth";
import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { useSessionStore } from "../state/session";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { ApiError } from "../api/client";
import type { UserRole } from "../types/models";

const authSchema = z.object({
  email: z
    .string()
    .trim()
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;
type AuthMode = "signin" | "signup";
type SupportPanel = "forgot" | "help" | "legal" | null;
type WorkspaceLane = {
  role: UserRole;
  eyebrow: string;
  title: string;
  copy: string;
  features: readonly string[];
};
type WorkspaceLaneGridProps = Readonly<{
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}>;
type AuthFormFieldsProps = Readonly<{
  control: Control<AuthFormValues>;
  errors: FieldErrors<AuthFormValues>;
  mode: AuthMode;
}>;
type LoginSupportPanelsProps = Readonly<{
  panel: SupportPanel;
  onClose: () => void;
}>;
type AuthActionButtonsProps = Readonly<{
  primaryLabel: string;
  isSubmitting: boolean;
  onPrimaryPress: () => void;
  onGooglePress: () => void;
}>;

const DEMO_GOOGLE_EMAIL = "demo.google@arthera.local";

const WORKSPACE_LANES: readonly WorkspaceLane[] = [
  {
    role: "VISITOR",
    eyebrow: "Visitor",
    title: "Explore and collect moments.",
    copy: "Find exhibitions, reserve a slot, and leave a quick review.",
    features: [
      "Discover",
      "Reserve",
      "Stamps",
    ],
  },
  {
    role: "ORGANIZER",
    eyebrow: "Organizer",
    title: "Run the exhibition day.",
    copy: "Publish, manage the queue, and confirm attendance in one flow.",
    features: [
      "Publish",
      "Queue",
      "Check-in",
    ],
  },
];

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as ApiError).message);
  }

  return "The auth request could not be completed.";
}

function WorkspaceLaneGrid({ selectedRole, onSelectRole }: WorkspaceLaneGridProps) {
  const { width } = useWindowDimensions();
  const useStackedCards = width < 640;

  return (
    <View style={[styles.roleGrid, useStackedCards && styles.roleGridStacked]}>
      {WORKSPACE_LANES.map((lane) => {
        const isActive = selectedRole === lane.role;
        const isOrganizer = lane.role === "ORGANIZER";

        return (
          <Pressable
            key={lane.role}
            style={[
              styles.roleCard,
              useStackedCards && styles.roleCardStacked,
              isOrganizer && styles.roleCardOrganizer,
              isActive && styles.roleCardActive,
              isActive && isOrganizer && styles.roleCardOrganizerActive,
            ]}
            onPress={() => onSelectRole(lane.role)}
            testID={lane.role === "VISITOR" ? "login-role-visitor" : "login-role-organizer"}
          >
            <View style={styles.roleCardHeader}>
              <Text style={[styles.roleEyebrow, isOrganizer && styles.roleEyebrowOrganizer]}>{lane.eyebrow}</Text>
              {isActive ? (
                <View style={[styles.roleStateChip, isOrganizer && styles.roleStateChipOrganizer]}>
                  <Text style={[styles.roleStateText, isOrganizer && styles.roleStateTextOrganizer]}>Active</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.roleCardTitle}>{lane.title}</Text>
            <Text style={styles.roleCopy}>{lane.copy}</Text>
            <View style={styles.featureRow}>
              {lane.features.map((feature) => (
                <View
                  key={feature}
                  style={[
                    styles.featureChip,
                    isActive && styles.featureChipActive,
                    isActive && isOrganizer && styles.featureChipOrganizerActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.featureText,
                      isActive && styles.featureTextActive,
                      isActive && isOrganizer && styles.featureTextOrganizerActive,
                    ]}
                  >
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function AuthFormFields({ control, errors, mode }: AuthFormFieldsProps) {
  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="you@example.com"
              placeholderTextColor={palette.textMuted}
              style={styles.input}
              value={value}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete={mode === "signin" ? "password" : "new-password"}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="At least 8 characters"
              placeholderTextColor={palette.textMuted}
              secureTextEntry
              style={styles.input}
              value={value}
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password.message}</Text> : null}
          </View>
        )}
      />

      {mode === "signup" ? (
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Display name</Text>
              <TextInput
                autoCapitalize="words"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="How should the workspace identify you?"
                placeholderTextColor={palette.textMuted}
                style={styles.input}
                value={value}
              />
            </View>
          )}
        />
      ) : null}
    </>
  );
}

function LoginSupportPanels({ panel, onClose }: LoginSupportPanelsProps) {
  if (panel === "forgot") {
    return (
      <EmptyStateBanner
        title="Password reset is not live yet"
        description="Use a seeded local account or continue with Google."
        actionLabel="Close"
        onAction={onClose}
      />
    );
  }

  if (panel === "help") {
    return (
      <EmptyStateBanner
        title="Quick support"
        description="Check the API URL first, then retry."
        actionLabel="Close"
        onAction={onClose}
      />
    );
  }

  if (panel === "legal") {
    return (
      <EmptyStateBanner
        title="Access terms"
        description="The session stores one shared identity and restores the selected workspace."
        actionLabel="Close"
        onAction={onClose}
      />
    );
  }

  return null;
}

function LoginHero() {
  return (
    <View style={styles.heroStage}>
      <View style={styles.heroOrbLarge} />
      <View style={styles.heroOrbSmall} />
      <View style={styles.heroRibbon} />
      <Text style={styles.heroEyebrow}>ARTHERA</Text>
      <Text style={styles.heroTitle}>Welcome back</Text>
      <Text style={styles.heroSubtitle}>Choose a lane, then sign in.</Text>
    </View>
  );
}

function AuthActionButtons({ primaryLabel, isSubmitting, onPrimaryPress, onGooglePress }: AuthActionButtonsProps) {
  return (
    <View style={styles.authActions}>
      <Pressable
        style={[styles.primaryActionButton, isSubmitting && styles.actionButtonDisabled]}
        onPress={onPrimaryPress}
        disabled={isSubmitting}
        testID="login-submit"
      >
        <Text style={[styles.primaryActionButtonText, isSubmitting && styles.actionButtonTextDisabled]}>{primaryLabel}</Text>
      </Pressable>

      <Pressable
        style={[styles.googleActionButton, isSubmitting && styles.actionButtonDisabled]}
        onPress={onGooglePress}
        disabled={isSubmitting}
        testID="login-google"
      >
        <Ionicons name="logo-google" size={16} color="#4285F4" />
        <Text style={[styles.googleActionButtonText, isSubmitting && styles.actionButtonTextDisabled]}>Continue with Google</Text>
      </Pressable>
    </View>
  );
}

export function LoginEntryScreen() {
  const setSessionEnvelope = useSessionStore((state) => state.setSessionEnvelope);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [selectedRole, setSelectedRole] = useState<UserRole>("VISITOR");
  const [panel, setPanel] = useState<SupportPanel>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  let primaryLabel = "Create account";
  if (isSubmitting) {
    primaryLabel = "Submitting...";
  } else if (mode === "signin") {
    primaryLabel = "Sign in";
  }

  const submitAuth = handleSubmit(async (values) => {
    setAuthError(null);
    const displayName = values.name?.trim();
    const registrationName = displayName ?? "";

    if (mode === "signup" && !displayName) {
      setAuthError("Create account requires a display name.");
      return;
    }

    try {
      const session =
        mode === "signup"
          ? await authApi.register({
              email: values.email,
              password: values.password,
              provider: "LOCAL",
              role: selectedRole,
              name: registrationName,
            })
          : await authApi.login({
              email: values.email,
              password: values.password,
              provider: "LOCAL",
              role: selectedRole,
            });

      await setSessionEnvelope(session);
    } catch (error) {
      setAuthError(getErrorMessage(error));
    }
  });

  const continueWithGoogle = async () => {
    const values = getValues();
    const normalizedEmail = values.email.trim().toLowerCase();
    const email = normalizedEmail || DEMO_GOOGLE_EMAIL;
    const fallbackName =
      values.name?.trim() ||
      normalizedEmail.split("@")[0] ||
      (selectedRole === "ORGANIZER" ? "Demo Organizer" : "Demo Visitor");
    setAuthError(null);

    try {
      const session = await authApi.continueWithGoogle({
        email,
        name: fallbackName,
        role: selectedRole,
        providerId: email,
      });
      await setSessionEnvelope(session);
    } catch (error) {
      setAuthError(getErrorMessage(error));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScreenShell hideHeader>
        <LoginHero />
        <WorkspaceLaneGrid selectedRole={selectedRole} onSelectRole={(role) => setSelectedRole(role)} />

        <View style={styles.card}>
          <View style={styles.authIntro}>
            <Text style={styles.sectionTitle}>{mode === "signin" ? "Sign in" : "Create account"}</Text>
            <Text style={styles.helperCopy}>One account. Two lanes.</Text>
          </View>

          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeButton, mode === "signin" && styles.modeButtonActive]}
              onPress={() => setMode("signin")}
              testID="login-mode-signin"
            >
              <Text style={[styles.modeText, mode === "signin" && styles.modeTextActive]}>Sign in</Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, mode === "signup" && styles.modeButtonActive]}
              onPress={() => setMode("signup")}
              testID="login-mode-signup"
            >
              <Text style={[styles.modeText, mode === "signup" && styles.modeTextActive]}>Create account</Text>
            </Pressable>
          </View>

          <AuthFormFields control={control} errors={errors} mode={mode} />
          <AuthActionButtons
            primaryLabel={primaryLabel}
            isSubmitting={isSubmitting}
            onPrimaryPress={() => {
              void submitAuth();
            }}
            onGooglePress={() => {
              void continueWithGoogle();
            }}
          />
        </View>

        {authError ? (
          <ErrorRecoveryPanel description={authError} onRetry={() => setAuthError(null)} retryLabel="Clear error" />
        ) : null}

        <View style={styles.supportRow}>
          <Pressable onPress={() => setPanel("forgot")}>
            <Text style={styles.supportLink}>Forgot</Text>
          </Pressable>
          <Pressable onPress={() => setPanel("help")}>
            <Text style={styles.supportLink}>Help</Text>
          </Pressable>
          <Pressable onPress={() => setPanel("legal")}>
            <Text style={styles.supportLink}>Legal</Text>
          </Pressable>
        </View>

        <LoginSupportPanels panel={panel} onClose={() => setPanel(null)} />
      </ScreenShell>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  heroStage: {
    marginHorizontal: -spacing.lg,
    marginTop: 0,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    minHeight: 180,
    backgroundColor: palette.text,
    overflow: "hidden",
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
  },
  heroOrbLarge: {
    position: "absolute",
    top: -48,
    right: -72,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(214, 107, 85, 0.24)",
  },
  heroOrbSmall: {
    position: "absolute",
    top: 40,
    left: -64,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(247, 233, 211, 0.12)",
  },
  heroRibbon: {
    position: "absolute",
    right: -28,
    bottom: -54,
    width: 180,
    height: 180,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: "rgba(247, 233, 211, 0.16)",
    transform: [{ rotate: "16deg" }],
  },
  heroEyebrow: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  heroTitle: {
    marginTop: spacing.xs,
    color: palette.background,
    fontFamily: typography.display,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "700",
    maxWidth: 260,
  },
  heroSubtitle: {
    marginTop: spacing.xs,
    color: palette.backgroundAlt,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 240,
  },
  roleGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  roleGridStacked: {
    flexDirection: "column",
  },
  roleCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  roleCardStacked: {
    flex: undefined,
    minHeight: 0,
  },
  roleCardOrganizer: {
    backgroundColor: palette.backgroundAlt,
  },
  roleCardActive: {
    borderColor: palette.accent,
    backgroundColor: palette.cardStrong,
  },
  roleCardOrganizerActive: {
    borderColor: palette.text,
    backgroundColor: palette.backgroundAlt,
  },
  roleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  roleEyebrow: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  roleEyebrowOrganizer: {
    color: palette.accentStrong,
  },
  roleStateChip: {
    borderRadius: radii.pill,
    backgroundColor: palette.accent,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  roleStateChipOrganizer: {
    backgroundColor: palette.text,
  },
  roleStateText: {
    color: palette.white,
    fontFamily: typography.body,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  roleStateTextOrganizer: {
    color: palette.background,
  },
  roleCardTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
  },
  roleCopy: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  featureChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  featureChipActive: {
    borderColor: palette.accent,
    backgroundColor: palette.card,
  },
  featureChipOrganizerActive: {
    borderColor: palette.text,
    backgroundColor: palette.card,
  },
  featureText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  featureTextActive: {
    color: palette.text,
  },
  featureTextOrganizerActive: {
    color: palette.text,
  },
  modeRow: {
    flexDirection: "row",
    backgroundColor: palette.card,
    borderRadius: radii.pill,
    borderColor: palette.border,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: palette.text,
  },
  modeText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  modeTextActive: {
    color: palette.background,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 16,
    fontWeight: "700",
  },
  authIntro: {
    gap: spacing.xs,
  },
  helperCopy: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  authActions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  primaryActionButton: {
    height: 50,
    borderRadius: radii.pill,
    backgroundColor: palette.text,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionButtonText: {
    color: palette.background,
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: "700",
  },
  googleActionButton: {
    height: 50,
    borderRadius: radii.pill,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  googleActionButtonText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: "700",
  },
  actionButtonDisabled: {
    opacity: 0.65,
  },
  actionButtonTextDisabled: {
    opacity: 0.85,
  },
  fieldBlock: {
    gap: spacing.xs,
  },
  label: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  input: {
    borderRadius: radii.md,
    borderColor: palette.border,
    borderWidth: 1,
    backgroundColor: palette.background,
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: {
    color: "#b91c1c",
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  supportRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  supportLink: {
    color: palette.accentStrong,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700",
  },
});
