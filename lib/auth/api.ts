// Auth API — NOT CONNECTED YET.
//
// The forms already build the exact request bodies the backend expects. To wire
// it up, replace these stubs with real calls (ready-made client:
// learning-app/docs/frontend/api.ts) — remember `credentials: "include"` for
// login/refresh/logout, because the refresh token is an httpOnly cookie.

import type { AuthResponse, LoginRequest, OAuthProviderId, RegisterRequest, RegisterResponse } from "./types";

export class BackendNotConnectedError extends Error {
  constructor() {
    super("The backend is not connected yet.");
    this.name = "BackendNotConnectedError";
  }
}

const notConnected = async (): Promise<never> => {
  throw new BackendNotConnectedError();
};

type AuthApi = {
  /** POST /api/auth/register */
  register(req: RegisterRequest): Promise<RegisterResponse>;
  /** POST /api/auth/login */
  login(req: LoginRequest): Promise<AuthResponse>;
  /** POST /api/auth/forgot-password */
  forgotPassword(email: string): Promise<string>;
};

export const authApi: AuthApi = {
  register: notConnected,
  login: notConnected,
  forgotPassword: notConnected,
};

/** Full-page redirect to GET /api/auth/oauth2/{provider} (see docs/frontend/oauth.ts). */
export const startOAuthLogin: (provider: OAuthProviderId, opts?: { rememberMe?: boolean; next?: string }) => Promise<void> = notConnected;
