"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUi } from "@/components/ui/UiProvider";
import { useOnboarding } from "@/lib/onboarding/context";
import { LIMITS, TECH, coverage } from "@/lib/onboarding/options";
import { AsideNote, Loading, Shell } from "./ui";
import { reachable } from "./nav";

export function TechnologiesScreen() {
  const { ready, answers, update, save, status } = useOnboarding();
  const router = useRouter();
  const { toast } = useUi();
  const [other, setOther] = useState("");
  const [busy, setBusy] = useState(false);
  if (!ready) return <Loading route="technologies" />;

  const sel = answers.tech.selected;
  const custom = answers.tech.custom;
  const n = sel.filter((x) => x !== "other").length + custom.length;
  const toggle = (id: string) =>
    update((x) => ({ ...x, tech: { ...x.tech, selected: x.tech.selected.includes(id) ? x.tech.selected.filter((t) => t !== id) : [...x.tech.selected, id] } }));
  const addCustom = (e: FormEvent) => {
    e.preventDefault();
    const v = other.trim().slice(0, LIMITS.custom);
    if (v && custom.length < LIMITS.customCount && !custom.some((c) => c.toLowerCase() === v.toLowerCase())) {
      update((x) => ({ ...x, tech: { ...x.tech, custom: [...x.tech.custom, v] } }));
    }
    setOther("");
  };
  const next = async () => {
    setBusy(true);
    if (await save()) router.push("/onboarding/experience");
    else toast("We couldn’t save your answers. Check your connection and try again.", "err");
    setBusy(false);
  };

  return (
    <Shell route="technologies" reachable={reachable(status, answers)}>
      <div className="with-aside">
        <div>
          <div className="eyebrow"><Icon name="layers" className="sm" />Your technologies</div>
          <h1 className="s-title">Which technologies have you worked with?</h1>
          <p className="s-sub">Select everything you’ve used, even briefly. A tutorial counts. We currently focus on frontend development.</p>
          <div className="notice">
            <Icon name="info" />
            <div>
              <b>Selecting a technology doesn’t mean you have to know it well.</b> It’s a starting point. The interview checks what you can
              actually do with it, and your profile shows the difference.
            </div>
          </div>
          {TECH.map((g) => {
            const c = g.items.filter((i) => sel.includes(i.id) && i.id !== "other").length;
            return (
              <section className="tech-group" key={g.group}>
                <div className="tech-group-head">
                  <h3><Icon name={g.icon} className="sm" />{g.group}</h3>
                  <span className="cnt">{c ? `${c} selected` : ""}</span>
                </div>
                <div className="tech-grid">
                  {g.items.map((t) => {
                    const on = sel.includes(t.id);
                    return (
                      <button key={t.id} type="button" className={`tech-tile ${on ? "on" : ""}`} aria-pressed={on} onClick={() => toggle(t.id)}>
                        <span className="tech-glyph">{t.glyph}</span>
                        <span><b>{t.name}</b><small>{on && t.id !== "other" ? "To be verified" : t.sub}</small></span>
                        <span className="chk"><Icon name="check" /></span>
                      </button>
                    );
                  })}
                </div>
                {g.items.some((i) => i.id === "other") && sel.includes("other") ? (
                  <div className="opt-inline">
                    <form className="input-group" style={{ height: 42 }} onSubmit={addCustom}>
                      <Icon name="plus" />
                      <input
                        placeholder="Add a technology and press Enter, e.g. Vite, Tailwind, Python"
                        aria-label="Add another technology"
                        maxLength={LIMITS.custom}
                        value={other}
                        onChange={(e) => setOther(e.target.value)}
                        style={{ fontFamily: "var(--font)", fontSize: 13.5 }}
                      />
                      <button className="btn btn-sm" type="submit">Add</button>
                    </form>
                    <div className="custom-chips">
                      {custom.map((c, i) => (
                        <span className="cchip" key={c}>
                          {c}
                          <button
                            type="button"
                            aria-label={`Remove ${c}`}
                            onClick={() => update((x) => ({ ...x, tech: { ...x.tech, custom: x.tech.custom.filter((_, j) => j !== i) } }))}
                          >
                            <Icon name="x" className="xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}
          <div className="foot">
            <Link className="btn btn-ghost" href="/onboarding/about"><Icon name="chevLeft" />Back</Link>
            <div className="foot-r">
              <span className="hint">{n ? `${n} selected, all to be verified` : "Nothing selected yet"}</span>
              <button className="btn btn-primary" type="button" disabled={busy} onClick={next}>
                {n ? <>Continue<Icon name="arrowRight" className="arrow" /></> : "I haven’t used these yet"}
              </button>
            </div>
          </div>
        </div>
        <aside>
          <AsideNote icon="sparkles" title="What the interview will cover">
            <div className="cover-list">
              {coverage(sel).map(([t, d, on]) => (
                <div className={`cover-item ${on ? "" : "off"}`} key={t}>
                  <Icon name={on ? "circleDot" : "help"} />
                  <div>{t}<span>{d}</span></div>
                </div>
              ))}
            </div>
          </AsideNote>
          <AsideNote icon="eye" title="Declared vs. demonstrated">
            <p>Anything you select here starts as <b>declared</b>. It becomes <b>demonstrated</b> only when you show it in the interview.</p>
          </AsideNote>
        </aside>
      </div>
    </Shell>
  );
}
