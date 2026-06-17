"use client";

// Champ de téléversement de média réutilisable (images d'actualités, galeries,
// vidéo d'arrière-plan de bannière). Envoie le fichier à /api/upload et renvoie
// l'URL publique via `onChange`. `kind` adapte l'aperçu et les formats acceptés.

import { useRef, useState } from "react";
import { isVideoUrl } from "@/lib/article-types";

const IMG = "image/png,image/jpeg,image/webp,image/gif";
const VID = "video/mp4,video/webm";
const ACCEPT = {
  image: IMG,
  video: VID,
  media: `${IMG},${VID}`,
};

export default function ImageUpload({
  value,
  onChange,
  kind = "image",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  kind?: "image" | "video" | "media";
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

  const choose =
    kind === "video"
      ? "🎬 Choisir une vidéo"
      : kind === "media"
        ? "📎 Choisir une image ou une vidéo"
        : "📷 Choisir une image";

  // Le rendu d'aperçu : vidéo si kind=video, ou si kind=media et URL vidéo.
  const showVideo =
    kind === "video" || (kind === "media" && !!value && isVideoUrl(value));

  return (
    <div className="img-up">
      {value ? (
        <div className="img-up-prev">
          {showVideo ? (
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
