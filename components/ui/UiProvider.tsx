"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

type ToastKind = "ok" | "info";
type Toast = { id: number; msg: string; kind: ToastKind; leaving: boolean };

export type ModalAction = { label: string; className?: string; onClick?: () => void | false };
type ModalSpec = { title: string; body: ReactNode; actions?: ModalAction[] };

type Ui = {
  toast: (msg: string, kind?: ToastKind) => void;
  openModal: (spec: ModalSpec) => void;
  closeModal: () => void;
};

const UiContext = createContext<Ui | null>(null);

export function useUi(): Ui {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside <UiProvider>");
  return ctx;
}

/** Toasts and a single modal, rendered in fixed layers so they never move page content. */
export function UiProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalSpec | null>(null);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);

  const toast = useCallback((msg: string, kind: ToastKind = "ok") => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, msg, kind, leaving: false }]);
    timers.current.push(
      window.setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x))), 2600),
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2900),
    );
  }, []);

  const closeModal = useCallback(() => setModal(null), []);
  const openModal = useCallback((spec: ModalSpec) => setModal(spec), []);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModal(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal]);

  const value = useMemo(() => ({ toast, openModal, closeModal }), [toast, openModal, closeModal]);

  return (
    <UiContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="toasts" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.kind}`} style={t.leaving ? { opacity: 0, transition: "opacity .3s" } : undefined}>
              <Icon name={t.kind === "info" ? "info" : "checkCircle"} />
              <span>{t.msg}</span>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <div className="modal-back" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={modal.title}>
            <div className="modal-head">
              <h3>{modal.title}</h3>
              <button className="tbtn" onClick={() => setModal(null)} aria-label="Close" autoFocus>
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">{modal.body}</div>
            {modal.actions?.length ? (
              <div className="modal-foot">
                {modal.actions.map((a) => (
                  <button
                    key={a.label}
                    className={`btn ${a.className ?? ""}`}
                    onClick={() => {
                      if (a.onClick?.() === false) return;
                      setModal(null);
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </UiContext.Provider>
  );
}
