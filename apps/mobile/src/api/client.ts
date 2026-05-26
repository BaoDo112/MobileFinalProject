import { Platform } from "react-native";
import Constants from "expo-constants";
import { persistentStorage } from "../state/persistent-storage";

/**
 * Resolve the API base URL with multiple fallback layers:
 *
 * 1. `process.env.EXPO_PUBLIC_API_URL` — set in .env, inlined by Metro babel
 * 2. `Constants.expoConfig.extra.apiUrl` — set in app.json for Expo Go / fallbacks
 * 3. Hardcoded default `http://localhost:3100`
 *
 * On **native** devices, if the resolved URL still points at localhost,
 * we auto-replace it with the dev-machine's LAN IP extracted from Expo's
 * `debuggerHost` (the IP Metro is already using to serve the JS bundle).
 *
 * Tunnel domains (e.g. `xxx.exp.direct`) are NOT substituted since the
 * API backend is not served through the Expo tunnel.
 */
const API_PORT = "3100";

function isLocalOrPrivateHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || isPrivateIpv4Host(hostname);
}

function isPrivateIpv4Host(hostname: string) {
  const octets = hostname.split(".").map(Number);

  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  const [first, second] = octets;
  if (first === 10) {
    return true;
  }

  if (first === 192 && second === 168) {
    return true;
  }

  return first === 172 && second >= 16 && second <= 31;
}

function replaceUrlHostname(rawUrl: string, nextHostname: string) {
  try {
    const url = new URL(rawUrl);
    url.hostname = nextHostname;
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function resolveBaseUrl(): string {
  // Layer 1: .env (Metro inline)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  // Layer 2: app.json extra
  const extraUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  // Pick the first defined value
  const configuredUrl = envUrl ?? extraUrl ?? `http://localhost:${API_PORT}`;

  if (__DEV__) {
    console.log("[api/client] env sources →", {
      "expoConfig.extra.apiUrl": extraUrl ?? "(not set)",
      "process.env.EXPO_PUBLIC_API_URL": envUrl ?? "(not set)",
      "resolved": configuredUrl,
      "platform": Platform.OS,
    });
  }

  if (Platform.OS === "web") {
    return configuredUrl;
  }

  let configuredHostname: string | undefined;
  try {
    configuredHostname = new URL(configuredUrl).hostname;
  } catch {
    configuredHostname = undefined;
  }

  if (!configuredHostname || !isLocalOrPrivateHost(configuredHostname)) {
    return configuredUrl;
  }

  // Extract dev machine IP from Expo's debuggerHost (e.g. "192.168.1.98:8082")
  const debuggerHost =
    Constants.expoConfig?.hostUri ??
    (Constants as Record<string, unknown>).debuggerHost as string | undefined;

  if (__DEV__) {
    console.log("[api/client] debuggerHost →", debuggerHost ?? "(not available)");
  }

  if (debuggerHost) {
    const hostIp = debuggerHost.split(":")[0];
    if (hostIp && isPrivateIpv4Host(hostIp)) {
      return replaceUrlHostname(configuredUrl, hostIp);
    }
  }

  return configuredUrl;
}

const rawApiUrl = resolveBaseUrl();
const API_URL = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;
const API_ORIGIN = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;
const TOKEN_KEY = "auth_token";

if (__DEV__) {
  console.log("[api/client] ✅ FINAL API_URL →", API_URL);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & {
  token?: string | null;
};

function isFormDataBody(body: RequestInit["body"]): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token ?? (await persistentStorage.getItem(TOKEN_KEY));
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body !== undefined && !isFormDataBody(options.body)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(0, "Network request failed", "NETWORK_ERROR");
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message ?? payload?.error ?? "Request failed";
    const details = Array.isArray(message) ? message.join("\n") : message;
    throw new ApiError(response.status, details, payload?.code, payload);
  }

  return payload as T;
}

export const apiClient = {
  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, {
      ...options,
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  postForm<T>(path: string, body: FormData, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, {
      ...options,
      method: "POST",
      body,
    });
  },
};

export function resolveApiAssetUrl(assetUrl: string | null | undefined) {
  if (!assetUrl) {
    return undefined;
  }

  if (/^https?:\/\//i.test(assetUrl)) {
    return assetUrl;
  }

  const normalizedAssetPath = assetUrl.startsWith("/") ? assetUrl : `/${assetUrl}`;
  return `${API_ORIGIN}${normalizedAssetPath}`;
}
