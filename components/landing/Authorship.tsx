"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { AUTH_CLS, AUTH_LBL, AUTH_PROFILES, type AuthProfileKey } from "@/lib/landing-data";
import { tween } from "@/lib/motion";

const KEYS = Object.keys(AUTH_PROFILES) as AuthProfileKey[];

function Stack({ v, sm }: { v: readonly number[]; sm?: boolean }) {
  return (
    <div className={`stack ${sm ? "sm" : ""}`}>
      {v.map((x, i) => (
        <i key={AUTH_CLS[i]} className={AUTH_CLS[i]} style={{ width: `${x}%` }} />
      ))}
    </div>
  );
}

const yours = (k: AuthProfileKey) => AUTH_PROFILES[k].total[0] + AUTH_PROFILES[k].total[1];

/**
 * Authorship report demo. Switching the example learner keeps the same DOM
 * and only changes widths and numbers, so the bars glide (CSS transition) and
 * the card keeps its size; the skill badges for both profiles share one cell.
 */
export function AuthorshipCard() {
  const [cur, setCur] = useState<AuthProfileKey>("hints");
  const numRef = useRef<HTMLElement>(null);
  const prev = useRef<AuthProfileKey>("hints");
  const p = AUTH_PROFILES[cur];

  useEffect(() => {
    const from = yours(prev.current);
    prev.current = cur;
    return tween(from, yours(cur), 800, (v) => {
      if (numRef.current) numRef.current.textContent = Math.round(v) + "%";
    });
  }, [cur]);

  return (
    <div className="auth-card">
      <div className="auth-card-head">
        <h4>
          <Icon name="award" className="sm" />
          Authorship report: Expense Tracker
        </h4>
        <div className="seg" role="tablist" aria-label="Example learner">
          {KEYS.map((k) => (
            <button key={k} role="tab" aria-selected={cur === k} className={cur === k ? "on" : undefined} onClick={() => setCur(k)}>
              {AUTH_PROFILES[k].label}
            </button>
          ))}
        </div>
      </div>
      <div className="auth-body">
        <div>
          <div className="auth-total">
            <b ref={numRef}>{yours("hints")}%</b>
            <span>of the logic written by you</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <Stack v={p.total} />
          </div>
          <div className="stack-legend">
            {p.total.map((x, i) => (
              <span key={AUTH_LBL[i]}>
                <i className={AUTH_CLS[i]} />
                {AUTH_LBL[i]} {x}%
              </span>
            ))}
          </div>
        </div>
        <div className="auth-files">
          {p.files.map(([f, v]) => (
            <div key={f} className="auth-file">
              <code>{f}</code>
              <Stack v={v} sm />
              <span className="pct">{v[0] + v[1]}%</span>
            </div>
          ))}
        </div>
        <div className="swap">
          {KEYS.map((k) => {
            const sk = AUTH_PROFILES[k].skills;
            return (
              <div key={k} className={cur === k ? "on" : undefined}>
                <div className="label" style={{ marginBottom: 10 }}>
                  Skills verified from this project: {sk.filter((x) => x[1]).length} of {sk.length}
                </div>
                <div className="auth-skills">
                  {sk.map(([n, ok]) => (
                    <span key={n} className={`badge ${ok ? "badge-ok" : ""}`}>
                      <Icon name={ok ? "checkCircle" : "circle"} />
                      {n}
                      {ok ? "" : " (needs your own code)"}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
