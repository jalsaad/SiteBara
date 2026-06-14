"use client";

// Champ de téléversement de média réutilisable (images d'actualités, galeries,
// vidéo d'arrière-plan de bannière). Envoie le fichier à /api/upload et renvoie
// l'URL publique via `onChange`. `kind` adapte l'aperçu et les formats acceptés.

import { useRef, useState } from "react";

const ACCEPT = {
  image: "image/png,image/jpeg,image/webp,image/gif",
  video: "video/mp4,video/webm",
};

export default function ImageUpload({
  value,
  onChange,
  kind = "image",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  kind?: "image" | "video";
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

  const choose = kind === "video" ? "🎬 Choisir une vidéo" : "📷 Choisir une image";

  return (
    <div className="img-up">
      {value ? (
        <div className="img-up-prev">
          {kind === "video" ? (
            <video src={value} muted loop playsInline autoPlay />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Aperçu" />
          )}
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
          {busy ? "Téléversement…" : choose}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
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
