"use client";

/** True when the OS asks for reduced motion or the app's own toggle is on. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  if (document.documentElement.dataset.motion === "reduced") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

const easeOutCubic = (k: number) => 1 - Math.pow(1 - k, 3);

/**
 * Tween a number and hand every frame to `onFrame`. Writes go straight to the
 * DOM via the callback, so React does not re-render 60 times a second.
 * Returns a cancel function.
 */
export function tween(from: number, to: number, ms: number, onFrame: (v: number) => void): () => void {
  if (prefersReducedMotion() || from === to) {
    onFrame(to);
    return () => {};
  }
  let raf = 0;
  const t0 = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / ms);
    onFrame(from + (to - from) * easeOutCubic(k));
    if (k < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
