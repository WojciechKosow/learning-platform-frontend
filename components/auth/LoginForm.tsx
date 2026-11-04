"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useUi } from "@/components/ui/UiProvider";
import { ApiError, errorMessage } from "@/lib/auth/api";
import { useAuth } from "@/lib/auth/auth-context";
import { nextFromUrl, useRedirectIfSignedIn } from "@/lib/auth/hooks";
import type { FieldErrors, LoginRequest } from "@/lib/auth/types";
import { validateLogin } from "@/lib/auth/validation";
import { Field, OAuthButtons, PasswordField, SubmitButton } from "./fields";

type LoginField = keyof LoginRequest;

export function LoginForm() {
  const { toast } = useUi();
  const { login } = useAuth();
  const router = useRouter();
  useRedirectIfSignedIn();
  const [values, setValues] = useState<LoginRequest>({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState<FieldErrors<LoginField>>({});
  const [pending, setPending] = useState(false);

  const set = (k: "email" | "password") => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateLogin(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setPending(true);
    try {
      await login(values.email.trim(), values.password, values.rememberMe);
      router.replace(nextFromUrl());
    } catch (err) {
      // 400: wrong credentials, locked account, unverified email — show it under the password.
      if (err instanceof ApiError && err.status === 400) {
        setErrors(err.fieldErrors ? (err.fieldErrors as FieldErrors<LoginField>) : { password: err.message });
      } else toast(errorMessage(err), "err");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="auth-form-in" onSubmit={onSubmit} noValidate>
      <div>
        <h1>Welcome back</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Pick up where you left off in your workspace.
        </p>
      </div>
      <OAuthButtons />
      <Field
        id="li-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={set("email")}
        error={errors.email}
      />
      <PasswordField
        id="li-pass"
        label="Password"
        autoComplete="current-password"
        value={values.password}
        onChange={set("password")}
        error={errors.password}
        aside={
          <Link className="link" href="/forgot-password">
            Forgot password?
          </Link>
        }
      />
      <label className="check">
        <input type="checkbox" checked={values.rememberMe} onChange={(e) => setValues((s) => ({ ...s, rememberMe: e.target.checked }))} />
        Keep me signed in for 30 days
      </label>
      <SubmitButton pending={pending} pendingLabel="Logging in…">
        Log in
      </SubmitButton>
      <p className="muted" style={{ fontSize: 13.5 }}>
        New here?{" "}
        <Link className="link" href="/register">
          Create an account
        </Link>
      </p>
    </form>
  );
}
