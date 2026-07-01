"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  label: string;
  title: string;
  children: React.ReactNode;
}

export default function FooterInfoModal({ label, title, children }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const modal = (
    <div className="jb-veil" onClick={() => setOpen(false)}>
      <button className="lb-close-float" onClick={() => setOpen(false)} aria-label="Fermer">✕</button>
      <div className="jb-box jb-box-text" onClick={(e) => e.stopPropagation()}>
        <div className="jb-text">
          <h2 className="jb-name">{title}</h2>
          <div className="jb-body">{children}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button className="footer-modal-link" onClick={() => setOpen(true)}>{label}</button>
      {mounted && open && createPortal(modal, document.body)}
    </>
  );
}
