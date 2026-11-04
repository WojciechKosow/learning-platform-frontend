"use client";

import type { MouseEvent } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { THEME_KEY } from "@/lib/theme";
import { Icon } from "./Icon";

type Theme = "dark" | "light";

function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    /* storage blocked: the theme still applies for this visit */
  }
}

/** Light/dark switch. Reveals the new theme as a circle growing from the click. */
export function ThemeToggle() {
  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const html = document.documentElement;
    const next: Theme = html.dataset.theme === "light" ? "dark" : "light";
    if (!document.startViewTransition || prefersReducedMotion()) {
      applyTheme(next);
      return;
    }
    const x = e.clientX || innerWidth - 40;
    const y = e.clientY || 30;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    html.classList.add("theme-vt");
    const vt = document.startViewTransition(() => applyTheme(next));
    vt.ready
      .then(() => {
        html.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 700, easing: "cubic-bezier(.22,.8,.24,1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
    vt.finished.catch(() => {}).finally(() => html.classList.remove("theme-vt"));
  };

  return (
    <button className="theme-btn" onClick={toggle} aria-label="Switch between light and dark theme" title="Switch theme">
      <Icon name="sun" className="sun" />
      <Icon name="moon" className="moon" />
    </button>
  );
}
