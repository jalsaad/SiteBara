"use client";

// Convertisseur « Images → PDF » — 100 % côté client (lib jsPDF).
// Sélection d'une ou plusieurs images → un PDF téléchargeable (une image par
// page, ajustée au format A4). Utile pour transmettre des documents scannés.

import { useRef, useState } from "react";
import { jsPDF } from "jspdf";

interface Item {
  id: string;
  name: string;
  url: string; // object URL pour l'aperçu
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export default function PdfBuilder() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function add(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: Math.random().toString(36).slice(2),
        name: f.name,
        url: URL.createObjectURL(f),
      }));
    setItems((prev) => [...prev, ...next]);
  }

  function remove(id: string) {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it) URL.revokeObjectURL(it.url);
      return prev.filter((x) => x.id !== id);
    });
  }

  async function build() {
    if (!items.length || busy) return;
    setBusy(true);
    try {
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const margin = 10;
      for (let i = 0; i < items.length; i++) {
        if (i > 0) pdf.addPage();
        const img = await loadImage(items[i].url);
        const maxW = pw - margin * 2;
        const maxH = ph - margin * 2;
        const ratio = Math.min(maxW / img.width, maxH / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        pdf.addImage(img, "JPEG", (pw - w) / 2, (ph - h) / 2, w, h);
      }
      pdf.save("document-bara.pdf");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tool-card reveal">
      <div className="tool-head">
        <span className="tool-ic" style={{ background: "var(--orange)" }}>📄</span>
        <div>
          <h3 className="serif">Images → PDF</h3>
          <p>Regroupez des photos ou scans en un seul PDF (une image par page).</p>
        </div>
      </div>

      <div className="tool-body">
        <button
          type="button"
          className="pdf-drop"
          onClick={() => inputRef.current?.click()}
        >
          📎 Ajouter des images
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />

        {items.length > 0 && (
          <ul className="pdf-list">
            {items.map((it) => (
              <li key={it.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt="" />
                <span className="pdf-name">{it.name}</span>
                <button
                  type="button"
                  className="pdf-x"
                  onClick={() => remove(it.id)}
                  aria-label={`Retirer ${it.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          className="btn btn-orange"
          style={{
            justifyContent: "center",
            ...(items.length === 0 || busy
              ? { opacity: 0.5, pointerEvents: "none" }
              : {}),
          }}
          onClick={build}
        >
          {busy
            ? "Génération…"
            : `Générer le PDF${items.length ? ` (${items.length})` : ""}`}
        </button>
      </div>
    </div>
  );
}
