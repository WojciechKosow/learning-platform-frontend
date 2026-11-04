"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUi } from "@/components/ui/UiProvider";
import { LegalLink } from "@/components/landing/LegalLinks";
import { ApiError, errorMessage } from "@/lib/auth/api";
import { useAuth } from "@/lib/auth/auth-context";
import { nextFromUrl, useRedirectIfSignedIn } from "@/lib/auth/hooks";
import type { FieldErrors } from "@/lib/auth/types";
import { MIN_PASSWORD, validateRegister, type RegisterField } from "@/lib/auth/validation";
import { Field, OAuthButtons, PasswordField, SubmitButton } from "./fields";

export function RegisterForm() {
  const { toast } = useUi();
  const { register, login } = useAuth();
  const router = useRouter();
  useRedirectIfSignedIn();
  const [values, setValues] = useState({ displayName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FieldErrors<RegisterField>>({});
  const [pending, setPending] = useState(false);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);

  const set = (k: RegisterField) => (e: ChangeEvent<HTMLInputElement>) => {
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
    const email = values.email.trim();
    try {
      const res = await register({ displayName: values.displayName.trim(), email, password: values.password });
      if (res.emailVerificationRequired) {
        // Production mode: the account activates from the emailed link.
        setCheckEmail(email);
        return;
      }
      // Development mode: the account is active, so sign straight in.
      await login(email, values.password, false);
      router.replace(nextFromUrl());
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        if (err.fieldErrors) setErrors(err.fieldErrors as FieldErrors<RegisterField>);
        else if (/email/i.test(err.message)) setErrors({ email: err.message });
        else toast(err.message, "err");
      } else toast(errorMessage(err), "err");
    } finally {
      setPending(false);
    }
  };

  if (checkEmail)
    return (
      <div className="auth-form-in auth-done">
        <span className="ico">
          <Icon name="mail" className="lg" />
        </span>
        <h1>Check your email</h1>
        <p className="muted">
          We sent a link to <b style={{ color: "var(--text)" }}>{checkEmail}</b>. Open it to activate your account, then log in.
        </p>
        <Link className="btn btn-primary btn-lg btn-block" href="/login">
          Go to log in
        </Link>
      </div>
    );

  return (
    <form className="auth-form-in" onSubmit={onSubmit} noValidate>
      <div>
        <h1>Create your account</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Start with a short assessment. You&apos;ll be coding in about ten minutes.
        </p>
      </div>
      <OAuthButtons />
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
