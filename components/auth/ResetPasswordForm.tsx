"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUi } from "@/components/ui/UiProvider";
import { ApiError, authApi, errorMessage } from "@/lib/auth/api";
import { MIN_PASSWORD } from "@/lib/auth/validation";
import { PasswordField, SubmitButton } from "./fields";

type Errors = { password?: string; confirm?: string };

/** Opened from the reset link: /reset-password?tokenId=…&token=… */
export function ResetPasswordForm() {
  const { toast } = useUi();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (password.length < MIN_PASSWORD) errs.password = `Use at least ${MIN_PASSWORD} characters.`;
    else if (password !== confirm) errs.confirm = "Passwords don’t match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const q = new URLSearchParams(window.location.search);
    const tokenId = q.get("tokenId");
    const token = q.get("token");
    if (!tokenId || !token) {
      setLinkError("This reset link is incomplete. Open the link from the email again, or ask for a new one.");
      return;
    }
    setPending(true);
    try {
      await authApi.resetPassword(tokenId, token, password);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        if (err.fieldErrors?.newPassword) setErrors({ password: err.fieldErrors.newPassword });
        // Invalid token / Token expired / Token already used
        else setLinkError(`${err.message.replace(/\.?$/, ".")} Ask for a new reset link.`);
      } else toast(errorMessage(err), "err");
    } finally {
      setPending(false);
    }
  };

  if (done || linkError)
    return (
      <div className="auth-form-in auth-done">
        <span className="ico" style={linkError ? { background: "var(--err-soft)", color: "var(--err)", borderColor: "transparent" } : undefined}>
          <Icon name={linkError ? "alertCircle" : "checkCircle"} className="lg" />
        </span>
        <h1>{linkError ? "This link doesn’t work" : "Password changed"}</h1>
        <p className="muted">{linkError ?? "Your new password is set and every other session was signed out. Log in to continue."}</p>
        <Link className="btn btn-primary btn-lg btn-block" href={linkError ? "/forgot-password" : "/login"}>
          {linkError ? "Get a new link" : "Log in"}
        </Link>
      </div>
    );

  return (
    <form className="auth-form-in" onSubmit={onSubmit} noValidate>
      <div>
        <h1>Choose a new password</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          You&apos;ll be signed out everywhere else once it&apos;s changed.
        </p>
      </div>
      <PasswordField
        id="rp-pass"
        label="New password"
        autoComplete="new-password"
        placeholder={`At least ${MIN_PASSWORD} characters`}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((s) => ({ ...s, password: undefined }));
        }}
        error={errors.password}
      />
      <PasswordField
        id="rp-pass2"
        label="Confirm new password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => {
          setConfirm(e.target.value);
          if (errors.confirm) setErrors((s) => ({ ...s, confirm: undefined }));
        }}
        error={errors.confirm}
      />
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Set new password
      </SubmitButton>
    </form>
  );
}
