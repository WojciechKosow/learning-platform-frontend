"use client";

import type { ReactNode } from "react";
import { useUi } from "@/components/ui/UiProvider";

export type LegalKind = "Terms" | "Privacy" | "Cookies";

const LEGAL: Record<LegalKind, { title: string; body: string }> = {
  Terms: {
    title: "Terms of Service",
    body: "Codetta is in beta. You own the code you write. Credits are non-refundable once spent, except when a step fails. Pro renews monthly or yearly until cancelled. Full terms will be published before the public launch.",
  },
  Privacy: {
    title: "Privacy Policy",
    body: "We store your account, your projects and your learning progress to run the service. Your code is never used to train AI models. You can export or delete everything from Settings.",
  },
  Cookies: {
    title: "Cookies",
    body: "We use only essential cookies to keep you signed in and remember your theme. No advertising trackers.",
  },
};

/** Opens a short legal summary in a modal (full documents come before launch). */
export function LegalLink({ kind, className, children }: { kind: LegalKind; className?: string; children?: ReactNode }) {
  const { openModal } = useUi();
  return (
    <a
      href="#"
      role="button"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        openModal({
          title: LEGAL[kind].title,
          body: <p className="muted">{LEGAL[kind].body}</p>,
          actions: [{ label: "Close" }],
        });
      }}
    >
      {children ?? kind}
    </a>
  );
}

const TEAMS_EMAIL = "teams@codetta.dev";

export function TeamsContactButton({ className, children }: { className?: string; children: ReactNode }) {
  const { openModal, toast } = useUi();
  const copy = () => {
    const blocked = () => toast("Copy is blocked here. Select the address instead.", "info");
    try {
      navigator.clipboard.writeText(TEAMS_EMAIL).then(() => toast("Address copied"), blocked);
    } catch {
      blocked();
    }
  };
  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        openModal({
          title: "Codetta for teams",
          body: (
            <>
              <p className="muted">
                Tell us about your cohort: how many learners, which stack and when you start. We reply within one working day.
              </p>
              <div className="input" style={{ display: "flex", alignItems: "center" }}>
                {TEAMS_EMAIL}
              </div>
            </>
          ),
          actions: [{ label: "Copy address", className: "btn-primary", onClick: copy }, { label: "Close" }],
        })
      }
    >
      {children}
    </button>
  );
}
