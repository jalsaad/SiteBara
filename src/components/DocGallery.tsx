"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DocItem {
  label: string;
  href: string;
  desc?: string;
}

function docTypeInfo(href: string): { icon: string; color: string } {
  const ext = (href || "").split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return { icon: "🖼️", color: "#7c4dff" };
  if (ext === "pdf") return { icon: "📄", color: "#e53935" };
  if (["doc", "docx"].includes(ext)) return { icon: "📝", color: "#1565c0" };
  if (["xls", "xlsx"].includes(ext)) return { icon: "📊", color: "#2e7d32" };
  if (["ppt", "pptx"].includes(ext)) return { icon: "📑", color: "#e65100" };
  if (["ods", "odt", "odp"].includes(ext)) return { icon: "📃", color: "#00838f" };
  return { icon: "📁", color: "#546e7a" };
}

function extOf(href: string) {
  return (href || "").split(".").pop()?.toLowerCase() ?? "";
}
function isImg(href: string) { return ["jpg","jpeg","png","gif","webp","svg"].includes(extOf(href)); }
function isPdf(href: string) { return extOf(href) === "pdf"; }
function isOffice(href: string) {
  return ["doc","docx","xls","xlsx","ppt","pptx","odt","ods","odp"].includes(extOf(href));
}

function DocLightbox({ item, onClose }: { item: DocItem; onClose: () => void }) {
  const { icon } = docTypeInfo(item.href);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const viewerUrl = isOffice(item.href)
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(
        window.location.origin + (item.href.startsWith("/") ? item.href : "/" + item.href)
      )}&embedded=true`
    : item.href;

  const modal = (
    <div className="lb-veil" onClick={onClose}>
      <button className="lb-close-float" onClick={onClose} aria-label="Fermer">✕</button>
      <div className="lb-box" onClick={(e) => e.stopPropagation()}>
        <div className="lb-head">
          <span className="lb-title">{item.label}</span>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn btn-orange lb-dl" href={item.href} download={item.label || true}>
            ⬇ Télécharger
          </a>
          <button className="lb-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="lb-content">
          {isImg(item.href) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.href} alt={item.label} className="lb-img" />
          )}
          {isPdf(item.href) && (
            <iframe src={item.href} className="lb-iframe" title={item.label} />
          )}
          {isOffice(item.href) && (
            <iframe src={viewerUrl} className="lb-iframe" title={item.label} />
          )}
          {!isImg(item.href) && !isPdf(item.href) && !isOffice(item.href) && (
            <div className="lb-nopreview">
              <div style={{ fontSize: 80 }}>{icon}</div>
              <p style={{ marginTop: 18, fontWeight: 600, color: "#e0e4f0" }}>{item.label}</p>
              <p style={{ fontSize: 13, color: "#7a85a8", marginTop: 6 }}>
                Aucun aperçu disponible — téléchargez le fichier pour l&apos;ouvrir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Portal sur document.body : échappe tout contexte d'empilement parent
  return createPortal(modal, document.body);
}

export default function DocGallery({ items, hint }: { items: DocItem[]; hint?: string }) {
  const [open, setOpen] = useState<DocItem | null>(null);

  return (
    <>
      <div className="doc-gallery reveal">
        {items.map((it, i) => {
          const { icon, color } = docTypeInfo(it.href);
          const image = isImg(it.href);
          return (
            <button
              key={i}
              className="doc-card"
              onClick={() => setOpen(it)}
              title={it.label}
            >
              {/* Miniature */}
              <div className="doc-thumb" style={image ? undefined : { background: color }}>
                {image
                  ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.href} alt="" className="doc-thumb-img" />
                  )
                  : <span className="doc-thumb-icon">{icon}</span>
                }
              </div>
              {/* Overlay au survol */}
              <div className="doc-overlay" aria-hidden="true">
                <span className="doc-overlay-name">{it.label || "Document"}</span>
                {it.desc && <span className="doc-overlay-desc">{it.desc}</span>}
              </div>
            </button>
          );
        })}
      </div>
      {hint && <p className="cal-actions-hint">{hint}</p>}
      {open && <DocLightbox item={open} onClose={() => setOpen(null)} />}
    </>
  );
}
