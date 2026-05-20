import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authApi } from "../api/auth";
import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { StickyActionBar } from "../components/StickyActionBar";
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

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as ApiError).message);
  }

  return "The auth request could not be completed.";
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
    const fallbackName = values.name?.trim() || values.email.split("@")[0] || "Arthera User";
    setAuthError(null);

    if (!values.email.trim()) {
      setAuthError("Enter an email before continuing with Google.");
      return;
    }

    try {
      const session = await authApi.continueWithGoogle({
        email: values.email,
        name: fallbackName,
        role: selectedRole,
        providerId: values.email.toLowerCase(),
      });
      await setSessionEnvelope(session);
    } catch (error) {
      setAuthError(getErrorMessage(error));
    }
  };

  return (
    <ScreenShell
      eyebrow="Screen 1"
      title="Access the right workspace without losing the shared account."
      subtitle="Use email and password for local access, or continue with Google into the same bootstrap contract. Visitor and Organizer stay as workspaces, not duplicate identities."
    >
      <View style={styles.statusRow}>
        <StatusChip label={mode === "signin" ? "Sign in" : "Create account"} tone="neutral" />
        <StatusChip label={`${selectedRole.toLowerCase()} workspace`} tone={selectedRole === "VISITOR" ? "success" : "warning"} />
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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account details</Text>
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
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Workspace preview</Text>
        <Text style={styles.helperCopy}>Choose the role you want restored after app launch. You can switch later without creating another account row.</Text>
        <View style={styles.roleRow}>
          {(["VISITOR", "ORGANIZER"] as const).map((role) => (
            <Pressable
              key={role}
              style={[styles.roleButton, selectedRole === role && styles.roleButtonActive]}
              onPress={() => setSelectedRole(role)}
              testID={role === "VISITOR" ? "login-role-visitor" : "login-role-organizer"}
            >
              <Text style={[styles.roleTitle, selectedRole === role && styles.roleTitleActive]}>{role === "VISITOR" ? "Visitor" : "Organizer"}</Text>
              <Text style={[styles.roleDescription, selectedRole === role && styles.roleDescriptionActive]}>
                {role === "VISITOR"
                  ? "Discover, reserve, review, and collect stamps."
                  : "Publish, review submissions, and manage attendance."}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {authError ? (
        <ErrorRecoveryPanel description={authError} onRetry={() => setAuthError(null)} retryLabel="Clear error" />
      ) : null}

      <StickyActionBar
        primaryLabel={primaryLabel}
        onPrimaryPress={() => {
          void submitAuth();
        }}
        primaryDisabled={isSubmitting}
        primaryTestID="login-submit"
        secondaryLabel={isSubmitting ? undefined : "Continue with Google"}
        onSecondaryPress={() => {
          void continueWithGoogle();
        }}
        secondaryTestID="login-google"
        helperText="Local sign-up is enabled in dev. If you want pre-seeded demo accounts, set ARTHERA_DEMO_VISITOR_PASSWORD and ARTHERA_DEMO_ORGANIZER_PASSWORD in the API env."
      />

      <View style={styles.supportRow}>
        <Pressable onPress={() => setPanel("forgot")}>
          <Text style={styles.supportLink}>Forgot password</Text>
        </Pressable>
        <Pressable onPress={() => setPanel("help")}>
          <Text style={styles.supportLink}>Need help?</Text>
        </Pressable>
        <Pressable onPress={() => setPanel("legal")}>
          <Text style={styles.supportLink}>Help & legal</Text>
        </Pressable>
      </View>

      {panel === "forgot" ? (
        <EmptyStateBanner
          title="Password reset path is staged next"
          description="For the current demo slice, use one of the seeded local accounts above or continue with Google using the same email to bootstrap the workspace."
          actionLabel="Close"
          onAction={() => setPanel(null)}
        />
      ) : null}
      {panel === "help" ? (
        <EmptyStateBanner
          title="Support checklist"
          description="Confirm the API base URL points to the Nest app, then retry sign-in. If Google credentials are not configured yet, the continuation button still uses the shared backend bootstrap contract for local development."
          actionLabel="Close"
          onAction={() => setPanel(null)}
        />
      ) : null}
      {panel === "legal" ? (
        <EmptyStateBanner
          title="Access terms"
          description="The auth flow stores only the session bootstrap needed for the active workspace and keeps role switching inside the same identity. Later phases will expand privacy copy and preference controls in the profile settings surface."
          actionLabel="Close"
          onAction={() => setPanel(null)}
        />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
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
  helperCopy: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
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
  roleRow: {
    gap: spacing.sm,
  },
  roleButton: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.background,
    padding: spacing.md,
    gap: spacing.xs,
  },
  roleButtonActive: {
    borderColor: palette.accent,
    backgroundColor: palette.backgroundAlt,
  },
  roleTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: "700",
  },
  roleTitleActive: {
    color: palette.accentStrong,
  },
  roleDescription: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  roleDescriptionActive: {
    color: palette.text,
  },
  supportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
