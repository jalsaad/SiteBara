"use client";
import { useEffect, useRef } from "react";

type BlobDef = {
  rgb: readonly [number, number, number];
  speed: number;
  phase: number;
  dist: number;
  radius: number;
};

// Palette charte Jules Bara : bleu royal, orange, or, bleu clair.
const BLOBS: BlobDef[] = [
  { rgb: [ 65, 110, 220], speed: 0.80, phase: 0.00, dist: 13, radius: 23 }, // royal vif
  { rgb: [245, 122,  32], speed: 1.10, phase: 1.57, dist: 14, radius: 20 }, // orange Bara
  { rgb: [200, 155,  65], speed: 0.65, phase: 3.14, dist: 15, radius: 22 }, // or/gold
  { rgb: [ 40,  80, 195], speed: 1.25, phase: 4.71, dist: 12, radius: 20 }, // marine clair
];

const SIZE = 58;

export default function JuliaSiriAura({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tRef     = useRef(0);
  const frameRef = useRef<number>(0);
  const activeRef = useRef(active);

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width  = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const R  = SIZE / 2;

    function frame() {
      const act = activeRef.current;

      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // Fond marine très sombre
      ctx.fillStyle = "#0c1228";
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Blobs en mode lumineux additif
      ctx.globalCompositeOperation = "lighter";
      const t = tRef.current;
      for (const b of BLOBS) {
        const bx = cx + Math.cos(t * b.speed        + b.phase) * b.dist;
        const by = cy + Math.sin(t * b.speed * 0.75 + b.phase + 0.4) * b.dist;
        const [r, g, bl] = b.rgb;

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.radius);
        grad.addColorStop(0.0, `rgba(${r},${g},${bl},0.58)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${bl},0.26)`);
        grad.addColorStop(1.0, `rgba(${r},${g},${bl},0)`);

        ctx.beginPath();
        ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Reflet spéculaire (haut-gauche)
      ctx.globalCompositeOperation = "source-over";
      const spec = ctx.createRadialGradient(cx - 10, cy - 12, 0, cx - 4, cy - 6, 18);
      spec.addColorStop(0,   "rgba(255,255,255,0.26)");
      spec.addColorStop(0.5, "rgba(255,255,255,0.05)");
      spec.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();

      // Vignette de bord
      const vign = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R);
      vign.addColorStop(0, "rgba(0,0,0,0)");
      vign.addColorStop(1, "rgba(0,0,0,0.30)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = vign;
      ctx.fill();

      ctx.restore();

      if (act) tRef.current += 0.022;
      frameRef.current = requestAnimationFrame(frame);
    }

    frame();
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width:  "100%",
        height: "100%",
        borderRadius: "50%",
        opacity: active ? 1 : 0,
        transition: "opacity 0.5s ease",
        pointerEvents: "none",
      }}
    />
  );
}
