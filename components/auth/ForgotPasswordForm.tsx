"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUi } from "@/components/ui/UiProvider";
import { authApi, errorMessage } from "@/lib/auth/api";
import { useAuthConfig } from "@/lib/auth/use-auth-config";
import { validateEmail } from "@/lib/auth/validation";
import { Field, SubmitButton } from "./fields";

export function ForgotPasswordForm() {
  const { toast } = useUi();
  const config = useAuthConfig();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    setError(err);
    if (err) return;
    setPending(true);
    try {
      // Always 200, whether or not the address exists (no account enumeration).
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (e2) {
      toast(errorMessage(e2), "err");
    } finally {
      setPending(false);
    }
  };

  if (sent)
    return (
      <div className="auth-form-in auth-done">
        <span className="ico">
          <Icon name="mail" className="lg" />
        </span>
        <h1>Check your email</h1>
        <p className="muted">
          If an account exists for <b style={{ color: "var(--text)" }}>{email.trim()}</b>, we sent a link to choose a new password. It expires
          soon, so use it today.
        </p>
        {config && !config.passwordResetByEmail && (
          <p className="form-note">Development mode: no email is sent. The reset link is printed in the backend log.</p>
        )}
        <Link className="btn btn-lg btn-block" href="/login">
          Back to log in
        </Link>
      </div>
    );

  return (
    <form className="auth-form-in" onSubmit={onSubmit} noValidate>
      <div>
        <h1>Reset your password</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Enter the email you signed up with. We&apos;ll send you a link to choose a new password.
        </p>
      </div>
      <Field
        id="fp-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError(undefined);
        }}
        error={error}
      />
      <SubmitButton pending={pending} pendingLabel="Sending link…">
        Send reset link
      </SubmitButton>
      <Link className="btn btn-ghost btn-sm" href="/login" style={{ alignSelf: "flex-start" }}>
        <Icon name="arrowLeft" className="sm" />
        Back to log in
      </Link>
    </form>
  );
}
