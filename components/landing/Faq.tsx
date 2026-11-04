"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { FAQ } from "@/lib/landing-data";

export function Faq() {
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const toggle = (i: number) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="section-head center">
          <h2>Questions, answered.</h2>
        </div>
        <div className="faq">
          {FAQ.map(([q, a], i) => (
            <div key={q} className={`faq-item ${open.has(i) ? "open" : ""}`}>
              <button className="faq-q" aria-expanded={open.has(i)} aria-controls={`faq-${i}`} onClick={() => toggle(i)}>
                {q}
                <span className="pm">
                  <Icon name="plus" className="sm" />
                </span>
              </button>
              <div className="faq-a" id={`faq-${i}`} role="region">
                <div>
                  <p>{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
