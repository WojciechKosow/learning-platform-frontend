"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUi } from "@/components/ui/UiProvider";
import { authApi, BackendNotConnectedError } from "@/lib/auth/api";
import { validateEmail } from "@/lib/auth/validation";
import { Field, SubmitButton } from "./fields";

export function ForgotPasswordForm() {
  const { toast } = useUi();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    setError(err);
    if (err) return;
    setPending(true);
    try {
      // The backend always answers 200 here, whether or not the address exists.
      await authApi.forgotPassword(email.trim());
    } catch (e2) {
      if (e2 instanceof BackendNotConnectedError) toast("Password reset arrives as soon as the backend is connected.", "info");
      else throw e2;
    } finally {
      setPending(false);
    }
  };

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
