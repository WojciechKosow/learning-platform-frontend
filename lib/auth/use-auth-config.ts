"use client";

import { useEffect, useState } from "react";
import { authApi } from "./api";
import type { AuthConfig } from "./types";

let cached: Promise<AuthConfig | null> | null = null;

/** GET /api/auth/config, fetched once per page load. null until it arrives (or if it fails). */
export function useAuthConfig(): AuthConfig | null {
  const [config, setConfig] = useState<AuthConfig | null>(null);
  useEffect(() => {
    let alive = true;
    cached ??= authApi.config().catch(() => {
      cached = null; // retry on the next mount
      return null;
    });
    cached.then((c) => alive && setConfig(c));
    return () => {
      alive = false;
    };
  }, []);
  return config;
}
