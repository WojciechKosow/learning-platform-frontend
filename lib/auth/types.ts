// Auth request/response shapes. They mirror the backend DTOs in learning-app
// (/api/auth/**) — see learning-app/docs/FRONTEND_INTEGRATION.md.

/** POST /api/auth/register */
export interface RegisterRequest {
  displayName: string;
  email: string;
  /** At least 8 characters (backend @Size(min = 8)). */
  password: string;
}

/** POST /api/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
  /** Access token lives 30 days instead of 15 minutes. */
  rememberMe: boolean;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  enabled: boolean;
  emailVerified: boolean;
}

export interface AuthResponse {
  token: string | null;
  refreshToken: null;
  user: User | null;
}

export interface RegisterResponse {
  message: string;
  /** true → show "check your email"; false (development mode) → go to login. */
  emailVerificationRequired: boolean;
  user: User;
}

export type OAuthProviderId = "google" | "github";

/** Field errors keyed by request field, the same shape as the backend's `errors`. */
export type FieldErrors<T extends string> = Partial<Record<T, string>>;
