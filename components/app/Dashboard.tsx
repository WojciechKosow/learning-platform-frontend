"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark, Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useRequireAuth } from "@/lib/auth/hooks";

/**
 * First signed-in screen. A placeholder until the real app (assessment,
 * roadmap, workspace) lands — it proves the session works end to end.
 */
export function Dashboard() {
  const { user, loading, logout } = useRequireAuth();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const onLogout = async () => {
    setLeaving(true);
    await logout();
    router.replace("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-top">
        <Link href="/" className="brand">
          <BrandMark />
          Codetta
        </Link>
        <div className="app-top-r">
          <ThemeToggle />
          <button className="btn btn-ghost" onClick={onLogout} disabled={!user || leaving}>
            <Icon name="arrowLeft" className="sm" />
            Log out
          </button>
        </div>
      </header>
      <main className="app-main">
        {/* Same card for loading and loaded states, so nothing jumps when the session resolves. */}
        <div className="card app-card" aria-busy={loading || !user}>
          <div className="app-card-in">
            <span className="badge badge-act">
              <span className="status-dot live" />
              Signed in
            </span>
            <h1>{user ? `Welcome, ${user.displayName}` : "Loading your account…"}</h1>
            <p className="muted">
              {user ? (
                <>
                  You&apos;re signed in as <b style={{ color: "var(--text)" }}>{user.email}</b>. Your assessment, roadmap and workspace will
                  live here.
                </>
              ) : (
                "Checking your session."
              )}
            </p>
            <div className="app-facts">
              <div>
                <span>Email</span>
                <b>{user ? (user.emailVerified ? "Verified" : "Not verified yet") : "—"}</b>
              </div>
              <div>
                <span>Account</span>
                <b>{user ? (user.enabled ? "Active" : "Inactive") : "—"}</b>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
