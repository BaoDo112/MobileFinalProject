import * as SecureStore from "expo-secure-store";

import { apiClient } from "./client";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: null },
}));

function createJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe("apiClient", () => {
  const getItemAsync = jest.mocked(SecureStore.getItemAsync);
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    getItemAsync.mockResolvedValue("session-token");
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it("attaches bearer and JSON headers", async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue(createJsonResponse({ ok: true }));

    await apiClient.post("/auth/login", { email: "visitor@example.com" });

    const [url, options] = jest.mocked(globalThis.fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(url).toMatch(/\/api\/auth\/login$/);
    expect(options?.method).toBe("POST");
    expect(options?.body).toBe(JSON.stringify({ email: "visitor@example.com" }));
    expect(headers.get("Authorization")).toBe("Bearer session-token");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("normalizes API errors", async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue(
      createJsonResponse({ message: ["Invalid email", "Password too short"] }, 400)
    );

    await expect(apiClient.get("/auth/session")).rejects.toEqual(
      expect.objectContaining({
        status: 400,
        message: "Invalid email\nPassword too short",
      })
    );
  });

  it("maps network failures to ApiError", async () => {
    jest.mocked(globalThis.fetch).mockRejectedValue(new Error("offline"));

    await expect(apiClient.get("/auth/session")).rejects.toEqual(
      expect.objectContaining({
        status: 0,
        code: "NETWORK_ERROR",
      })
    );
  });
});
