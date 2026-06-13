"use client";

// Champ de téléversement d'image réutilisable (actualités, galeries…).
// Envoie le fichier à /api/upload et renvoie l'URL publique via `onChange`.

import { useRef, useState } from "react";

export default function ImageUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setBusy(false);
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: null }));
      setError(msg ?? "Échec du téléversement");
      return;
    }
    const { url } = (await res.json()) as { url: string };
    onChange(url);
  }

  return (
    <div className="img-up">
      {value ? (
        <div className="img-up-prev">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Aperçu" />
          <div className="img-up-acts">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? "Téléversement…" : "Remplacer"}
            </button>
            <button type="button" onClick={() => onChange(null)}>
              Retirer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="img-up-drop"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? "Téléversement…" : "📷 Choisir une image"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
      {error && <p className="img-up-err">{error}</p>}
    </div>
  );
}
