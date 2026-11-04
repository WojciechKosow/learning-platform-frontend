// Client-side checks that match the backend's bean validation, so most mistakes
// are caught before a request. The backend stays the source of truth.

import type { FieldErrors, LoginRequest, RegisterRequest } from "./types";

export const MIN_PASSWORD = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterField = keyof RegisterRequest | "confirmPassword";

export function validateRegister(v: RegisterRequest & { confirmPassword: string }): FieldErrors<RegisterField> {
  const e: FieldErrors<RegisterField> = {};
  if (!v.displayName.trim()) e.displayName = "Tell us what to call you.";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email, like name@example.com.";
  if (v.password.length < MIN_PASSWORD) e.password = `Use at least ${MIN_PASSWORD} characters.`;
  else if (v.password !== v.confirmPassword) e.confirmPassword = "Passwords don’t match.";
  return e;
}

export function validateLogin(v: LoginRequest): FieldErrors<keyof LoginRequest> {
  const e: FieldErrors<keyof LoginRequest> = {};
  if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter the email you signed up with.";
  if (!v.password) e.password = "Enter your password.";
  return e;
}

export function validateEmail(email: string): string | undefined {
  return EMAIL_RE.test(email.trim()) ? undefined : "Enter a valid email, like name@example.com.";
}
