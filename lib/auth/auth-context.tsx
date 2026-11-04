"use client";

// Session state for the whole app (the model from learning-app's
// docs/frontend/auth-context.tsx): the access token lives in memory and in
// localStorage; the refresh token only ever lives in the httpOnly cookie.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ApiError, authApi } from "./api";
import type { RegisterRequest, RegisterResponse, User } from "./types";

const TOKEN_KEY = "codetta.accessToken";
/**
 * Set while this browser holds a session. Without it there is no refresh
 * cookie worth trying, so anonymous visitors don't call /refresh (and get a
 * 401) on every page view.
 */
const SESSION_KEY = "codetta.hasSession";

const store = {
  get: (k: string) => {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string | null) => {
    try {
      if (v === null) window.localStorage.removeItem(k);
      else window.localStorage.setItem(k, v);
    } catch {
      /* storage blocked: the session still works for this tab */
    }
  },
};

interface AuthState {
  user: User | null;
  /** True until the initial session check has finished. */
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<User>;
  register: (req: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  /**
   * Call a protected endpoint with the current access token; on 401 it
   * refreshes once (rotating the cookie) and retries. Use it for every
   * protected /api/** call.
   */
  authorized: <T>(call: (token: string) => Promise<T>) => Promise<T>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);
  // Refresh tokens are single-use: concurrent 401s must share ONE refresh call,
  // or the second would replay a rotated token and end every session.
  const refreshing = useRef<Promise<string | null> | null>(null);

  const applySession = useCallback((token: string | null, nextUser: User | null) => {
    tokenRef.current = token;
    store.set(TOKEN_KEY, token);
    store.set(SESSION_KEY, token ? "1" : null);
    setUser(nextUser);
  }, []);

  const refreshOnce = useCallback((): Promise<string | null> => {
    if (!refreshing.current) {
      refreshing.current = authApi
        .refresh()
        .then((res) => {
          applySession(res.token, res.user);
          return res.token;
        })
        .catch((e) => {
          // Only a definite "no session" ends it; a network blip keeps the flag.
          if (e instanceof ApiError && e.status === 401) applySession(null, null);
          return null;
        })
        .finally(() => {
          refreshing.current = null;
        });
    }
    return refreshing.current;
  }, [applySession]);

  // Bootstrap: stored access token → /me; expired → one silent refresh.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = store.get(TOKEN_KEY);
      if (stored) {
        try {
          const me = await authApi.me(stored);
          if (!cancelled) {
            tokenRef.current = stored;
            setUser(me);
          }
          return;
        } catch {
          // expired → fall through to refresh
        }
      }
      if (stored || store.get(SESSION_KEY)) await refreshOnce();
    })().finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [refreshOnce]);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const res = await authApi.login({ email, password, rememberMe });
      if (!res.token || !res.user) throw new ApiError("Login failed. Please try again.", 500);
      applySession(res.token, res.user);
      return res.user;
    },
    [applySession],
  );

  const register = useCallback((req: RegisterRequest) => authApi.register(req), []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // clear locally regardless
    }
    applySession(null, null);
  }, [applySession]);

  const authorized = useCallback(
    async <T,>(call: (token: string) => Promise<T>): Promise<T> => {
      const current = tokenRef.current ?? (await refreshOnce());
      if (!current) throw new ApiError("Not signed in", 401);
      try {
        return await call(current);
      } catch (e) {
        if (!(e instanceof ApiError) || e.status !== 401) throw e;
        const next = await refreshOnce();
        if (!next) throw e;
        return call(next);
      }
    },
    [refreshOnce],
  );

  const value = useMemo<AuthState>(
    () => ({ user, loading, login, register, logout, authorized }),
    [user, loading, login, register, logout, authorized],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

/** Only same-origin absolute paths — never an open redirect. */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
