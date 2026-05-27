import { ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import type { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

import { AppModule } from "./app.module";
import { captureServerException, flushCapturedEvents } from "./instrument";
import { SentryExceptionFilter } from "./sentry/sentry.filter";

function parseAllowedOrigins(rawOrigins?: string) {
  return new Set(
    (rawOrigins ?? "")
      .split(",")
      .map((origin) => origin.trim().replace(/^"|"$/g, ""))
      .filter(Boolean),
  );
}

function isLocalDevelopmentOrigin(origin: string) {
  try {
    const url = new URL(origin);
    const isKnownScheme = url.protocol === "http:" || url.protocol === "https:" || url.protocol === "exp:";
    if (!isKnownScheme) {
      return false;
    }

    const { hostname } = url;
    return hostname === "localhost"
      || hostname === "127.0.0.1"
      || /^192\.168\.\d+\.\d+$/.test(hostname)
      || /^10\.\d+\.\d+\.\d+$/.test(hostname)
      || /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname);
  } catch {
    return false;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);
  const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
  const isProduction = process.env.NODE_ENV === "production";

  const corsOptions: CorsOptions = {
    origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin) || (!isProduction && isLocalDevelopmentOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`), false);
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  app.enableCors(corsOptions);

  app.setGlobalPrefix("api");
  app.useGlobalFilters(new SentryExceptionFilter(httpAdapter));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, "0.0.0.0");
  console.log(`🚀 API listening on http://0.0.0.0:${port}`);
}

void bootstrap().catch(async (error: unknown) => {
  captureServerException(error);
  await flushCapturedEvents();
  console.error("API bootstrap failed", error);
  process.exit(1);
});
