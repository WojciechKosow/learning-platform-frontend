"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Fixed background: two slowly drifting colour blooms and a dot field that
 * brightens around the pointer. Also drives the cursor "spotlight" on cards.
 * Everything here is position: fixed / custom properties, so it can never
 * affect layout.
 */
export function Ambient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const html = document.documentElement;

    let W = 0;
    let H = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      // Only grow the height: mobile browsers fire resize while the URL bar
      // slides, and re-allocating the canvas every time makes it flicker.
      const nextH = Math.max(H, window.innerHeight);
      if (window.innerWidth === W && nextH === H) return;
      W = window.innerWidth;
      H = nextH;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ptr = { x: -9999, y: -9999, sx: -9999, sy: -9999 };
    const onMove = (e: PointerEvent) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
    };
    const onLeave = () => {
      ptr.x = ptr.y = -9999;
    };

    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || html.dataset.ambient === "off") return;
      const still = prefersReducedMotion();
      if (!still && t - last < 33) return; // ~30 fps is plenty for a background
      if (still && last) return; // reduced motion: draw a single static frame
      last = t;
      ptr.sx += (ptr.x - ptr.sx) * 0.18;
      ptr.sy += (ptr.y - ptr.sy) * 0.18;
      if (Math.abs(ptr.sx) > 5000) {
        ptr.sx = ptr.x;
        ptr.sy = ptr.y;
      }
      const dot = getComputedStyle(html).getPropertyValue("--dot").trim() || "255, 255, 255";
      const isDark = html.dataset.theme !== "light";
      ctx.clearRect(0, 0, W, H);
      const gap = 26;
      const base = isDark ? 0.055 : 0.07;
      const time = t / 1000;
      ctx.fillStyle = `rgb(${dot})`;
      for (let y = gap / 2; y < H; y += gap) {
        for (let x = gap / 2; x < W; x += gap) {
          const dx = x - ptr.sx;
          const dy = y - ptr.sy;
          const d = Math.sqrt(dx * dx + dy * dy);
          const s = d < 260 ? 1 - d / 260 : 0;
          const wave = still ? 0 : 0.035 * Math.sin(time * 0.7 + (x + y) * 0.011);
          const a = base + Math.max(0, wave) + s * s * (isDark ? 0.42 : 0.3);
          if (a < 0.02) continue;
          const r = 1 + s * 0.9;
          ctx.globalAlpha = Math.min(a, 0.6);
          ctx.fillRect(x - r / 2, y - r / 2, r, r);
        }
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(loop);

    // Spotlight: a soft light that follows the pointer inside cards.
    let spotRaf = 0;
    let spotEv: PointerEvent | null = null;
    const onSpot = (e: PointerEvent) => {
      spotEv = e;
      if (spotRaf) return;
      spotRaf = requestAnimationFrame(() => {
        spotRaf = 0;
        const ev = spotEv;
        const el = ev?.target instanceof Element ? (ev.target.closest(".card, .rm-drawer") as HTMLElement | null) : null;
        if (!ev || !el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ev.clientX - r.left + "px");
        el.style.setProperty("--my", ev.clientY - r.top + "px");
      });
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointermove", onSpot, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(spotRaf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointermove", onSpot);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="ambient" aria-hidden="true">
      <i className="bloom b1" />
      <i className="bloom b2" />
      <canvas ref={canvasRef} />
    </div>
  );
}
