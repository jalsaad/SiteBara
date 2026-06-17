"use client";

// Galerie de médias d'une actualité avec lightbox : chaque image/vidéo est
// cliquable pour s'ouvrir en grand (navigation ‹ ›, fermeture Échap / clic
// extérieur / croix). Les vidéos s'affichent en vignette avec un ▶ ; le lecteur
// avec contrôles n'apparaît qu'en grand.

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { isVideoUrl } from "@/lib/article-types";

export default function ArticleGallery({ images }: { images: string[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (dir: number) =>
      setOpen((cur) =>
        cur === null ? cur : (cur + dir + images.length) % images.length
      ),
    [images.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, go]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="art-gal">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            className="gal-item"
            onClick={() => setOpen(i)}
            aria-label={isVideoUrl(src) ? "Agrandir la vidéo" : "Agrandir l'image"}
          >
            {isVideoUrl(src) ? (
              <>
                <video src={src} muted playsInline preload="metadata" />
                <span className="gal-play">▶</span>
              </>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" />
            )}
          </button>
        ))}
      </div>

      {open !== null &&
        createPortal(
          <div
            className="lightbox"
            onClick={close}
            role="dialog"
            aria-modal="true"
          >
          <button className="lb-close" onClick={close} aria-label="Fermer">
            ✕
          </button>
          {images.length > 1 && (
            <button
              className="lb-nav lb-prev"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Média précédent"
            >
              ‹
            </button>
          )}
          <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
            {isVideoUrl(images[open]) ? (
              <video src={images[open]} controls autoPlay playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[open]} alt="" />
            )}
          </div>
          {images.length > 1 && (
            <button
              className="lb-nav lb-next"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Média suivant"
            >
              ›
            </button>
          )}
          {images.length > 1 && (
            <div className="lb-count">
              {open + 1} / {images.length}
            </div>
          )}
          </div>,
          document.body
        )}
    </>
  );
}
