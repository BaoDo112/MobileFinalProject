import * as Sentry from "@sentry/node";

const fallbackDsn = "https://7ee24f7b3d8d5297a7e861221fb28a6c@o4511458824486912.ingest.us.sentry.io/4511458824814592";

function resolveSampleRate(rawValue?: string) {
  const parsed = Number.parseFloat(rawValue ?? "0");
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return 0;
  }

  return parsed;
}

const sentryDsn = process.env.SENTRY_DSN?.trim() || fallbackDsn;
export const sentryEnabled = process.env.NODE_ENV !== "test" && Boolean(sentryDsn) && process.env.SENTRY_ENABLED !== "false";

if (sentryEnabled) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.SENTRY_ENVIRONMENT?.trim() || process.env.NODE_ENV || "development",
    tracesSampleRate: resolveSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE),
    attachStacktrace: true,
  });
}

export function captureServerException(exception: unknown) {
  if (!sentryEnabled) {
    return;
  }

  Sentry.captureException(exception);
}

export async function flushCapturedEvents(timeoutMs = 2_000) {
  if (!sentryEnabled) {
    return;
  }

  await Sentry.flush(timeoutMs);
}