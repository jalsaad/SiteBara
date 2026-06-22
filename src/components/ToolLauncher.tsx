"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import QrGenerator from "./QrGenerator";
import PdfBuilder from "./PdfBuilder";

type Tool = "qr" | "pdf" | null;

const TOOLS = [
  {
    id: "qr" as const,
    color: "var(--royal)",
    icon: "▦",
    title: "Générateur de QR code",
    desc: "Lien, e-mail, Wi-Fi, contact… avec couleurs et logo, à imprimer.",
  },
  {
    id: "pdf" as const,
    color: "var(--orange)",
    icon: "📄",
    title: "Convertisseur PDF",
    desc: "Scans & images → PDF, fusion et réorganisation de pages.",
  },
];

export default function ToolLauncher() {
  const [open, setOpen] = useState<Tool>(null);

  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <div className="tool-grid">
        {TOOLS.map(t => (
          <button
            key={t.id}
            type="button"
            className="acard reveal"
            style={{ "--c": t.color } as React.CSSProperties}
            onClick={() => setOpen(t.id)}
          >
            <div className="ic">{t.icon}</div>
            <h3 className="serif">{t.title}</h3>
            <p>{t.desc}</p>
            <span className="go">Ouvrir l&apos;outil →</span>
          </button>
        ))}
      </div>

      {open && createPortal(
        <div className="tool-lb" onClick={close} role="dialog" aria-modal="true">
          <div className="tool-lb-panel" onClick={e => e.stopPropagation()}>
            <div className="tool-lb-hd">
              <button type="button" className="tool-lb-close" onClick={close} aria-label="Fermer">✕</button>
            </div>
            <div className="tool-lb-body">
              {open === "qr"  && <QrGenerator />}
              {open === "pdf" && <PdfBuilder />}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
