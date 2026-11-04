"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useUi } from "@/components/ui/UiProvider";
import { LegalLink } from "@/components/landing/LegalLinks";
import { authApi, BackendNotConnectedError } from "@/lib/auth/api";
import type { FieldErrors } from "@/lib/auth/types";
import { MIN_PASSWORD, validateRegister, type RegisterField } from "@/lib/auth/validation";
import { Field, OAuthButtons, PasswordField, SubmitButton } from "./fields";

export function RegisterForm() {
  const { toast } = useUi();
  const [values, setValues] = useState({ displayName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FieldErrors<RegisterField>>({});
  const [pending, setPending] = useState(false);

  const set = (k: RegisterField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValues((s) => ({ ...s, [k]: v }));
    // Clear a field's error as soon as it is edited.
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateRegister(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setPending(true);
    try {
      // Same body as the backend's RegisterRequest. On success:
      // emailVerificationRequired ? "/check-email" : log in / go to "/login".
      await authApi.register({ displayName: values.displayName.trim(), email: values.email.trim(), password: values.password });
    } catch (err) {
      if (err instanceof BackendNotConnectedError) toast("Looks good! Accounts open as soon as the backend is connected.", "info");
      else throw err;
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="auth-form-in" onSubmit={onSubmit} noValidate>
      <div>
        <h1>Create your account</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Start with a short assessment. You&apos;ll be coding in about ten minutes.
        </p>
      </div>
      <OAuthButtons />
      <div className="auth-or">or with email</div>
      <Field
        id="su-name"
        label="Name"
        autoComplete="name"
        placeholder="How should we call you?"
        value={values.displayName}
        onChange={set("displayName")}
        error={errors.displayName}
      />
      <Field
        id="su-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={set("email")}
        error={errors.email}
      />
      <PasswordField
        id="su-pass"
        label="Password"
        autoComplete="new-password"
        placeholder={`At least ${MIN_PASSWORD} characters`}
        value={values.password}
        onChange={set("password")}
        error={errors.password}
      />
      <PasswordField
        id="su-pass2"
        label="Confirm password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={set("confirmPassword")}
        error={errors.confirmPassword}
      />
      <SubmitButton pending={pending} pendingLabel="Creating account…">
        Create account
      </SubmitButton>
      <p className="dim" style={{ fontSize: 12.5 }}>
        By creating an account you agree to the{" "}
        <LegalLink kind="Terms" className="link">
          Terms of Service
        </LegalLink>{" "}
        and{" "}
        <LegalLink kind="Privacy" className="link">
          Privacy Policy
        </LegalLink>
        .
      </p>
      <p className="muted" style={{ fontSize: 13.5 }}>
        Already have an account?{" "}
        <Link className="link" href="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
