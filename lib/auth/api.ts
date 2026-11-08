// Client for the backend's /api/auth/** endpoints.
//
// Paths are relative: the browser talks to this app's own origin and Next.js
// proxies /api/* to the backend (next.config.ts → rewrites). The httpOnly
// refresh-token cookie is therefore first-party and is sent automatically.

import type { AuthConfig, AuthResponse, LoginRequest, RegisterRequest, RegisterResponse, User } from "./types";

/** Error carrying the backend's message and (optional) per-field validation errors. */
export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  body?: unknown;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.body = body;
  }
}

/** The request never reached the backend (offline, backend down, proxy error). */
export class NetworkError extends Error {
  constructor() {
    super("We can't reach the server right now. Check your connection and try again.");
    this.name = "NetworkError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  token?: string | null;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new NetworkError();
  }

  const raw = await res.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw; // plain-text responses (verify / reset / forgot …)
    }
  }

  if (!res.ok) {
    // The proxy answers 5xx with an HTML page when the backend is down.
    if (res.status >= 502 && res.status <= 504) throw new NetworkError();
    const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
    const message =
      (obj && typeof obj.message === "string" && obj.message) ||
      (typeof data === "string" && data.length < 300 && !data.trimStart().startsWith("<") && data) ||
      `Request failed (${res.status})`;
    const fieldErrors = obj && obj.errors && typeof obj.errors === "object" ? (obj.errors as Record<string, string>) : undefined;
    throw new ApiError(message, res.status, fieldErrors, data);
  }

  return data as T;
}

export const authApi = {
  config: () => request<AuthConfig>("/api/auth/config"),
  register: (input: RegisterRequest) => request<RegisterResponse>("/api/auth/register", { method: "POST", body: input }),
  login: (input: LoginRequest) => request<AuthResponse>("/api/auth/login", { method: "POST", body: input }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  /** New access token + the user. 401 (and a cleared cookie) when there is no valid session. */
  refresh: () => request<AuthResponse>("/api/auth/refresh", { method: "POST" }),
  me: (token: string) => request<User>("/api/auth/me", { token }),
  forgotPassword: (email: string) => request<string>("/api/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (tokenId: string, token: string, newPassword: string) =>
    request<string>(`/api/auth/reset-password?tokenId=${encodeURIComponent(tokenId)}&token=${encodeURIComponent(token)}`, {
      method: "POST",
      body: { newPassword },
    }),
};

/** A message to show for any error thrown by the API client. */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError || e instanceof NetworkError) return e.message;
  return "Something went wrong. Please try again.";
}
