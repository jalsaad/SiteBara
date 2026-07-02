"use client";
import { useEffect, useState } from "react";

export default function Countdown({ target }: { target: string }) {
  const [diff, setDiff] = useState(() => Math.max(0, new Date(target).getTime() - Date.now()));

  useEffect(() => {
    const tick = () => setDiff(Math.max(0, new Date(target).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (diff === 0) return <span className="cs-cd-done">C&apos;est l&apos;heure ! 🎉</span>;

  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);

  return (
    <span className="cs-cd">
      <span className="cs-cd-unit"><b>{d}</b><small>j</small></span>
      <span className="cs-cd-sep">:</span>
      <span className="cs-cd-unit"><b>{String(h).padStart(2, "0")}</b><small>h</small></span>
      <span className="cs-cd-sep">:</span>
      <span className="cs-cd-unit"><b>{String(m).padStart(2, "0")}</b><small>m</small></span>
      <span className="cs-cd-sep">:</span>
      <span className="cs-cd-unit"><b>{String(s).padStart(2, "0")}</b><small>s</small></span>
    </span>
  );
}
