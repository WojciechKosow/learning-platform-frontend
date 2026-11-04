"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const LINKS: [string, string][] = [
  ["how", "How it works"],
  ["ide", "The IDE"],
  ["modes", "Learn and Build"],
  ["pricing", "Pricing"],
  ["faq", "FAQ"],
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="site-nav-in">
        <Link href="/" className="brand">
          <BrandMark />
          Codetta
        </Link>
        <nav className="site-links" aria-label="Sections">
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="site-nav-cta">
          <ThemeToggle />
          <Link className="btn btn-ghost" href="/login">
            Log in
          </Link>
          <Link className="btn btn-primary" href="/register">
            Start learning
          </Link>
        </div>
      </div>
    </header>
  );
}
