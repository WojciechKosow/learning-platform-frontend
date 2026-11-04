"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { GoogleG, Icon } from "@/components/ui/Icon";
import { useUi } from "@/components/ui/UiProvider";
import type { OAuthProviderId } from "@/lib/auth/types";
import { useAuthConfig } from "@/lib/auth/use-auth-config";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  /** Rendered on the label row, right-aligned (e.g. "Forgot password?"). */
  aside?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

/** Label + input + an error line that always keeps its height. */
export function Field({ id, label, error, aside, className, ...input }: FieldProps) {
  const errId = `${id}-err`;
  return (
    <div className="field">
      <div className="field-row">
        <label htmlFor={id}>{label}</label>
        {aside}
      </div>
      <input
        id={id}
        className={`input ${error ? "invalid" : ""} ${className ?? ""}`}
        aria-invalid={!!error}
        aria-describedby={errId}
        {...input}
      />
      <div className="field-err" id={errId} role="alert">
        {error}
      </div>
    </div>
  );
}

/** Password field with a show/hide toggle. */
export function PasswordField(props: Omit<FieldProps, "type">) {
  const [shown, setShown] = useState(false);
  const { id, label, error, aside, ...input } = props;
  const errId = `${id}-err`;
  return (
    <div className="field">
      <div className="field-row">
        <label htmlFor={id}>{label}</label>
        {aside}
      </div>
      <div className="pw-wrap">
        <input
          id={id}
          type={shown ? "text" : "password"}
          className={`input ${error ? "invalid" : ""}`}
          aria-invalid={!!error}
          aria-describedby={errId}
          {...input}
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
        >
          <Icon name={shown ? "eyeOff" : "eye"} />
        </button>
      </div>
      <div className="field-err" id={errId} role="alert">
        {error}
      </div>
    </div>
  );
}

export function SubmitButton({ pending, children, pendingLabel }: { pending: boolean; children: ReactNode; pendingLabel: string }) {
  return (
    <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={pending} aria-busy={pending}>
      {/* Both labels share one cell, so the button never changes size. */}
      <span className="swap" style={{ justifyItems: "center" }}>
        <span className={pending ? undefined : "on"}>{children}</span>
        <span className={pending ? "on" : undefined} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span className="spinner" aria-hidden="true" />
          {pendingLabel}
        </span>
      </span>
    </button>
  );
}

const PROVIDERS: Record<OAuthProviderId, { label: string; icon: ReactNode }> = {
  google: { label: "Continue with Google", icon: <GoogleG /> },
  github: { label: "Continue with GitHub", icon: <Icon name="github" /> },
};

/**
 * "Continue with …" buttons plus the "or with email" divider, shown only for
 * the providers the backend reports in GET /api/auth/config (`oauthProviders`;
 * none while PRODUCTION_AUTH_SYSTEM=false). The OAuth redirect itself is not
 * wired up yet.
 */
export function OAuthButtons() {
  const { toast } = useUi();
  const providers = useAuthConfig()?.oauthProviders ?? [];
  if (!providers.length) return null;
  return (
    <>
      <div className="oauth-row">
        {providers.map((p) => (
          <button
            key={p}
            type="button"
            className="btn btn-google btn-lg btn-block"
            onClick={() => toast(`${PROVIDERS[p].label.replace("Continue with ", "")} sign-in is coming soon. Use your email for now.`, "info")}
          >
            {PROVIDERS[p].icon}
            {PROVIDERS[p].label}
          </button>
        ))}
      </div>
      <div className="auth-or">or with email</div>
    </>
  );
}
