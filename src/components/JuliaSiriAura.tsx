"use client";
import { useEffect, useRef } from "react";

type BlobDef = {
  rgb: readonly [number, number, number];
  speed: number;
  phase: number;
  dist: number;
  radius: number;
};

// Palette violet/orange/magenta alignée avec le bouton "Demander à Julia"
const BLOBS: BlobDef[] = [
  { rgb: [124,  58, 237], speed: 0.90, phase: 0.00, dist: 14, radius: 26 }, // purple #7c3aed
  { rgb: [245, 122,  32], speed: 1.20, phase: 1.57, dist: 14, radius: 21 }, // orange Bara
  { rgb: [ 79,  70, 229], speed: 0.72, phase: 3.14, dist: 15, radius: 24 }, // indigo #4f46e5
  { rgb: [190,  60, 255], speed: 1.35, phase: 4.71, dist: 12, radius: 22 }, // magenta-violet
];

const BTN = 58;

export default function JuliaSiriAura({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tRef      = useRef(0);
  const frameRef  = useRef<number>(0);
  const activeRef = useRef(active);

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width  = BTN * dpr;
    canvas.height = BTN * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const cx = BTN / 2;
    const cy = BTN / 2;
    const R  = BTN / 2;

    function frame() {
      const act = activeRef.current;
      const t   = tRef.current;

      ctx.clearRect(0, 0, BTN, BTN);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = "#1a0840";
      ctx.fillRect(0, 0, BTN, BTN);

      ctx.globalCompositeOperation = "lighter";
      for (const b of BLOBS) {
        const bx = cx + Math.cos(t * b.speed        + b.phase) * b.dist;
        const by = cy + Math.sin(t * b.speed * 0.75 + b.phase + 0.4) * b.dist;
        const [r, g, bl] = b.rgb;

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.radius);
        grad.addColorStop(0.0, `rgba(${r},${g},${bl},0.82)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${bl},0.45)`);
        grad.addColorStop(1.0, `rgba(${r},${g},${bl},0)`);

        ctx.beginPath();
        ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Reflet spéculaire (haut-gauche)
      ctx.globalCompositeOperation = "source-over";
      const spec = ctx.createRadialGradient(cx - 10, cy - 12, 0, cx - 4, cy - 6, 18);
      spec.addColorStop(0,   "rgba(255,255,255,0.28)");
      spec.addColorStop(0.5, "rgba(255,255,255,0.06)");
      spec.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();

      // Vignette légère
      const vign = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R);
      vign.addColorStop(0, "rgba(0,0,0,0)");
      vign.addColorStop(1, "rgba(0,0,0,0.12)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = vign;
      ctx.fill();

      ctx.restore();

      if (act) tRef.current += 0.028;
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
        width:  BTN + "px",
        height: BTN + "px",
        opacity: active ? 1 : 0,
        transition: "opacity 0.5s ease",
        pointerEvents: "none",
      }}
    />
  );
}
