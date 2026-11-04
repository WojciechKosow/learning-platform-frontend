"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUi } from "@/components/ui/UiProvider";
import { fmtInt, PACKS, PLAN_CREDITS, type Pack } from "@/lib/landing-data";
import { tween } from "@/lib/motion";
import { TeamsContactButton } from "./LegalLinks";

type Bill = "month" | "year";
type EstStyle = "learn" | "mixed" | "build";

const EST_TIMES: [number, string][] = [[0.5, "30 min"], [1, "1 hour"], [2, "2 hours"], [3, "3+ hours"]];
const EST_STYLES: [EstStyle, string][] = [["learn", "Learn mode only"], ["mixed", "Mostly Learn"], ["build", "Learn and Build"]];
const PER_HOUR: Record<EstStyle, number> = { learn: 40, mixed: 70, build: 140 };

const estimate = (t: number, s: EstStyle) => Math.round((t * 30 * PER_HOUR[s]) / 50) * 50;

function recommendation(n: number): ReactNode {
  const over = n - PLAN_CREDITS.pro;
  if (n <= PLAN_CREDITS.free)
    return (
      <>
        <span className="badge badge-ok">
          <Icon name="check" />
          Free
        </span>
        <span>The free plan covers this. Upgrade when you want Build mode or more projects.</span>
      </>
    );
  if (over <= 0)
    return (
      <>
        <span className="badge badge-act">
          <Icon name="zap" />
          Pro
        </span>
        <span>Pro covers this with {fmtInt(-over)} credits to spare. No top-ups needed.</span>
      </>
    );
  const pk = PACKS.find((p) => p.credits >= over) ?? PACKS[PACKS.length - 1];
  return (
    <>
      <span className="badge badge-ai">
        <Icon name="plus" />
        Pro + top-up
      </span>
      <span>
        About {fmtInt(over)} credits past Pro. A {pk.name.toLowerCase()} (${pk.price}) covers it, or use Build mode a bit less.
      </span>
    </>
  );
}

// Every possible estimate, so the recommendation box can reserve the height of
// the longest one (see .swap) and never resize while you click around.
const ALL_ESTIMATES = Array.from(new Set(EST_TIMES.flatMap(([t]) => EST_STYLES.map(([s]) => estimate(t, s)))));

/** Animated number that writes to the DOM directly while tweening. */
function useTweenedNumber(value: number, fmt: (v: number) => string, ms = 600) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    return tween(from, value, ms, (v) => {
      if (ref.current) ref.current.textContent = fmt(v);
    });
  }, [value, fmt, ms]);
  return ref;
}
const fmtDollar = (v: number) => "$" + Math.round(v);
const fmtCredits = (v: number) => fmtInt(Math.round(v));

export function Pricing() {
  const { toast } = useUi();
  const [bill, setBill] = useState<Bill>("month");
  const [pack, setPack] = useState<Pack["id"]>("medium");
  const [estT, setEstT] = useState(2);
  const [estS, setEstS] = useState<EstStyle>("mixed");

  const proPrice = bill === "year" ? 33 : 50;
  const proRef = useTweenedNumber(proPrice, fmtDollar);
  const n = estimate(estT, estS);
  const estRef = useTweenedNumber(n, fmtCredits);
  const selectedPack = PACKS.find((p) => p.id === pack)!;

  return (
    <section className="section" id="pricing">
      <div className="wrap">
        <div className="section-head center">
          <h2>One plan for everything you build.</h2>
          <p>
            Pro gives you the whole platform and a monthly AI budget that covers daily learning. If a big Build month runs past it, top up. You always
            see the cost before AI work runs.
          </p>
          <div className="bill">
            <div className="seg" role="tablist" aria-label="Billing period">
              <button className={bill === "month" ? "on" : undefined} role="tab" aria-selected={bill === "month"} onClick={() => setBill("month")}>
                Monthly
              </button>
              <button className={bill === "year" ? "on" : undefined} role="tab" aria-selected={bill === "year"} onClick={() => setBill("year")}>
                Yearly <span className="badge badge-act">Save 33%</span>
              </button>
            </div>
          </div>
        </div>

        <div className="plans">
          <article className="plan">
            <div className="plan-top">
              <b>Free</b>
            </div>
            <div className="plan-price">
              <span className="amt">$0</span>
              <span className="per">forever</span>
            </div>
            <div className="plan-sub">No card needed</div>
            <div className="plan-credits">
              300 AI credits<span>every month</span>
            </div>
            <p className="lede">Learn the fundamentals in Learn mode and finish your first project.</p>
            <Link className="btn btn-lg btn-block" href="/register">
              Create free account
            </Link>
            <ul>
              <li><Icon name="check" />Full browser IDE with terminal and live preview</li>
              <li><Icon name="check" />Learn mode: explanations, hints and reviews</li>
              <li><Icon name="check" />Personal roadmap and skill checks</li>
              <li><Icon name="check" />One active project at a time</li>
              <li className="no"><Icon name="minus" />Build mode</li>
              <li className="no"><Icon name="minus" />Public portfolio with authorship reports</li>
            </ul>
          </article>

          <article className="plan featured">
            <div className="plan-top">
              <b>Pro</b>
              <span className="badge badge-act">Everything included</span>
            </div>
            <div className="plan-price">
              <span className="amt" ref={proRef}>
                $50
              </span>
              <span className="per">/ month</span>
            </div>
            <div className="plan-sub swap">
              <span className={bill === "month" ? "on" : undefined}>Billed monthly</span>
              <span className={bill === "year" ? "on" : undefined}>Billed $399 yearly, you save $201</span>
            </div>
            <div className="plan-credits">
              5,000 AI credits<span>every month</span>
            </div>
            <p className="lede">
              For people who want to progress fast: build several projects a month, use Build mode when you need speed, and top up only if you go past
              your budget.
            </p>
            <Link className="btn btn-primary btn-lg btn-block" href="/register">
              Start with Pro
            </Link>
            <div className="note">Cancel anytime. Monthly credits reset each billing period.</div>
            <ul>
              <li><Icon name="check" />Everything in Free</li>
              <li><Icon name="check" />Learn mode and Build mode</li>
              <li><Icon name="check" />Unlimited projects, including your own app ideas</li>
              <li><Icon name="check" />Authorship report on every project</li>
              <li><Icon name="check" />Public portfolio with verified skills</li>
              <li><Icon name="check" />Cost estimate and a cap on every Build run</li>
              <li><Icon name="check" />Top up anytime when you need more</li>
              <li className="soon"><Icon name="github" />Coming in V0.2: GitHub sync and local VS Code</li>
            </ul>
          </article>

          <article className="plan teams">
            <div className="plan-top">
              <b>Teams</b>
              <span className="badge">Bootcamps and schools</span>
            </div>
            <div className="plan-price">
              <span className="amt" style={{ fontSize: 44 }}>
                Custom
              </span>
            </div>
            <div className="plan-sub">Per seat, from 10 learners</div>
            <p className="lede">Run a cohort on Codetta with your own projects and progress you can see.</p>
            <TeamsContactButton className="btn btn-lg btn-block">Talk to us</TeamsContactButton>
            <ul>
              <li><Icon name="check" />Everything in Pro for every seat</li>
              <li><Icon name="check" />Cohort dashboard and authorship reports</li>
              <li><Icon name="check" />Build mode on or off per cohort</li>
              <li><Icon name="check" />Custom roadmaps and projects</li>
              <li><Icon name="check" />Shared credit pool, invoices in EUR, USD or PLN</li>
            </ul>
          </article>
        </div>
        <p className="dim" style={{ textAlign: "center", fontSize: 12.5, marginTop: 14 }}>
          Prices in USD. Local VAT is shown at checkout.
        </p>

        <div className="packs">
          <div className="packs-head">
            <div>
              <h3>Top-ups</h3>
              <p>Went past your monthly credits? Add more in one click. Top-ups are a one-time payment, work on any plan and never expire.</p>
            </div>
            <div className="tags">
              <span className="badge">One-time payment</span>
              <span className="badge">Never expire</span>
              <span className="badge">Used after monthly credits</span>
            </div>
          </div>
          <div className="pack-grid" role="radiogroup" aria-label="Top-up size">
            {PACKS.map((p) => (
              <button key={p.id} className={`pack ${p.id === pack ? "on" : ""}`} role="radio" aria-checked={p.id === pack} onClick={() => setPack(p.id)}>
                <div className="pack-top">
                  <b>
                    {p.name}
                    {p.best && <span className="badge badge-act">Best top-up rate</span>}
                  </b>
                  <span className="pack-radio" />
                </div>
                <div className="pack-amt">
                  {fmtInt(p.credits)}
                  <span>credits</span>
                </div>
                <div className="pack-foot">
                  <b>${p.price}</b>
                  <span>${(p.price / p.credits).toFixed(4)} per credit</span>
                </div>
              </button>
            ))}
          </div>
          <div className="packs-foot">
            <span>
              Credits included in Pro work out to <b>$0.0100 each</b>, the best rate on Codetta.
            </span>
            <button
              className="btn btn-primary"
              onClick={() => toast(`Create an account first. Checkout for ${fmtInt(selectedPack.credits)} credits opens after sign-up.`, "info")}
            >
              {/* All labels share one cell: the button keeps the width of the longest. */}
              <span className="swap">
                {PACKS.map((p) => (
                  <span key={p.id} className={p.id === pack ? "on" : undefined}>
                    Add {fmtInt(p.credits)} credits for ${p.price}
                  </span>
                ))}
              </span>
            </button>
          </div>
        </div>

        <div className="explain">
          <div>
            <div className="intro-ico ai">
              <Icon name="zap" />
            </div>
            <h4>Credits follow real AI work</h4>
            <p>Small questions cost little. Big Build runs cost more, because more AI work runs. Writing and running your own code is always free.</p>
            <div className="cost-table">
              <span>Hint or explanation</span>
              <b>1–3</b>
              <span>Code review</span>
              <b>5–10</b>
              <span>Project plan from your idea</span>
              <b>~25</b>
              <span>Build mode run</span>
              <b>20–200</b>
              <span>Running code, tests, skill checks</span>
              <b>free</b>
            </div>
          </div>
          <div>
            <div className="intro-ico ai">
              <Icon name="eye" />
            </div>
            <h4>See the cost before it runs</h4>
            <p>Every Build run shows an estimate and a cap you can change. If a run would go past the cap, it stops and asks first.</p>
          </div>
          <div>
            <div className="intro-ico ai">
              <Icon name="reset" />
            </div>
            <h4>Failed steps cost nothing</h4>
            <p>If a review or a Build run fails, the credits go straight back to your balance.</p>
          </div>
        </div>

        <div className="estimator">
          <div className="est-in">
            <div>
              <h3>Will Pro cover my month?</h3>
              <p className="muted" style={{ marginTop: 6 }}>
                Pick how you plan to work. We&apos;ll estimate a typical month.
              </p>
            </div>
            <div>
              <span className="label">Daily time</span>
              <div className="seg">
                {EST_TIMES.map(([v, l]) => (
                  <button key={v} className={v === estT ? "on" : undefined} aria-pressed={v === estT} onClick={() => setEstT(v)}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="label">How you work</span>
              <div className="seg">
                {EST_STYLES.map(([v, l]) => (
                  <button key={v} className={v === estS ? "on" : undefined} aria-pressed={v === estS} onClick={() => setEstS(v)}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="est-out">
            <div className="est-big">
              <span className="n" ref={estRef}>
                {fmtInt(estimate(2, "mixed"))}
              </span>
              <span>credits a month</span>
            </div>
            <div>
              <div className="est-scale">
                <i style={{ width: `${Math.max(3, Math.min(100, (n / 6600) * 100))}%` }} />
              </div>
              <div className="est-marks">
                <span style={{ left: "4%" }}>Free 300</span>
                <span style={{ left: "76%" }}>Pro 5,000</span>
              </div>
            </div>
            <div className="swap" aria-live="polite">
              {ALL_ESTIMATES.map((v) => (
                <div key={v} className={`est-rec ${v === n ? "on" : ""}`}>
                  {recommendation(v)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
