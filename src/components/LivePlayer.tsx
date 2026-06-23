"use client";

import { useRef } from "react";

interface Props {
  videoId: string;
  title?: string;
}

export default function LivePlayer({ videoId, title }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  function goFullscreen() {
    wrapRef.current?.requestFullscreen?.();
  }

  const src =
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div ref={wrapRef} className="live-player">
      <iframe
        src={src}
        title={title ?? "Diffusion en direct"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
      <button className="live-fs-btn" onClick={goFullscreen} title="Plein écran">
        ⛶ Plein écran
      </button>
    </div>
  );
}
