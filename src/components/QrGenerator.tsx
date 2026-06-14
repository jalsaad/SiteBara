"use client";

// Générateur de QR codes — 100 % côté client (lib qrcode, aucun appel réseau).
// Saisir un texte ou une URL → aperçu + téléchargement PNG.

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function QrGenerator() {
  const [value, setValue] = useState("https://atheneejulesbara.be");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const text = value.trim();
    // Léger debounce : on régénère le QR peu après la dernière frappe. Le cas
    // « champ vide » est traité dans le timer (mise à jour asynchrone) pour ne
    // pas appeler setState directement dans le corps de l'effet.
    timer.current = setTimeout(
      () => {
        if (!text) {
          setDataUrl(null);
          return;
        }
        QRCode.toDataURL(text, {
          width: 480,
          margin: 2,
          color: { dark: "#1b2245", light: "#ffffff" },
        })
          .then(setDataUrl)
          .catch(() => setDataUrl(null));
      },
      text ? 250 : 0
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value]);

  return (
    <div className="tool-card reveal">
      <div className="tool-head">
        <span className="tool-ic" style={{ background: "var(--royal)" }}>▦</span>
        <div>
          <h3 className="serif">Générateur de QR code</h3>
          <p>Transformez un lien ou un texte en QR code à imprimer.</p>
        </div>
      </div>

      <div className="tool-body">
        <label className="tool-label" htmlFor="qr-input">
          Lien ou texte
        </label>
        <textarea
          id="qr-input"
          className="tool-input"
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://… ou un message"
        />

        <div className="qr-preview">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="Aperçu du QR code" />
          ) : (
            <span className="qr-empty">Saisissez un lien pour générer le QR code</span>
          )}
        </div>

        <a
          className="btn btn-orange"
          href={dataUrl ?? "#"}
          download="qr-code-bara.png"
          aria-disabled={!dataUrl}
          style={
            dataUrl
              ? { justifyContent: "center" }
              : { justifyContent: "center", opacity: 0.5, pointerEvents: "none" }
          }
        >
          Télécharger le PNG
        </a>
      </div>
    </div>
  );
}
