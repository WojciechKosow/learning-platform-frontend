import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark, Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function AuthSide() {
  return (
    <aside className="auth-side">
      <div style={{ maxWidth: 440 }}>
        <p style={{ fontSize: 22, lineHeight: 1.4, letterSpacing: "-.015em", fontWeight: 600 }}>
          &ldquo;I finished four courses and still couldn&apos;t start a project alone. Here I built one, and the mentor never just handed me the
          answer.&rdquo;
        </p>
        <p className="muted" style={{ marginTop: 14 }}>
          Beta tester, now building a booking app for a local gym
        </p>
      </div>
      <div className="card" style={{ maxWidth: 440 }}>
        <div className="card-head">
          <h3 style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Icon name="route" className="sm" />
            What happens next
          </h3>
        </div>
        <div className="session-list">
          <div className="session-item">
            <span className="chk cur" />
            <div>
              <b>Short assessment</b>
              <span>About 8 minutes. &ldquo;Not sure&rdquo; is a valid answer.</span>
            </div>
          </div>
          <div className="session-item">
            <span className="chk" />
            <div>
              <b>Learning profile</b>
              <span>Your goal, daily time and preferred style.</span>
            </div>
          </div>
          <div className="session-item">
            <span className="chk" />
            <div>
              <b>Personal roadmap</b>
              <span>Generated from both, with projects attached.</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Two-column auth layout: the form on the left, context on the right (hidden on small screens). */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <div className="auth-form">
        <div className="auth-form-top">
          <Link href="/" className="brand">
            <BrandMark />
            Codetta
          </Link>
          <ThemeToggle />
        </div>
        {children}
      </div>
      <AuthSide />
    </div>
  );
}
