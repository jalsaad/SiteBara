// Helpers de rendu de la bannière (« hero »), partagés entre l'aperçu de
// l'éditeur (client) et le rendu public (serveur). Fonctions pures, sans
// dépendance React : renvoient des valeurs CSS / chemins SVG.

import type { HeroOverlay, HeroBorder } from "./page-types";

// Grain « film » (bruit fractal SVG) — réutilise le motif de la maquette.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Options de l'effet graphique en premier plan (pour les segments de l'inspecteur). */
export const OVERLAY_OPTIONS: { value: HeroOverlay; label: string }[] = [
  { value: "none", label: "Aucun" },
  { value: "grain", label: "Grain" },
  { value: "dots", label: "Points" },
  { value: "diagonal", label: "Hachures" },
  { value: "grid", label: "Quadrillage" },
  { value: "scanlines", label: "Lignes" },
  { value: "vignette", label: "Vignette" },
  { value: "glow", label: "Halo" },
];

/** Options du style de la bordure inférieure. */
export const BORDER_OPTIONS: { value: HeroBorder; label: string }[] = [
  { value: "none", label: "Aucune" },
  { value: "wave", label: "Vague" },
  { value: "curve", label: "Courbe" },
  { value: "slant", label: "Oblique" },
  { value: "rounded", label: "Arrondi" },
  { value: "zigzag", label: "Zigzag" },
  { value: "peaks", label: "Pics" },
];

/**
 * Style de la couche d'effet graphique (premier plan). Renvoie `null` si
 * aucun effet. L'opacité (0–100) règle la transparence demandée.
 */
export function overlayStyle(
  kind: HeroOverlay | undefined,
  opacity: number | undefined
): Record<string, string | number> | null {
  const base: Record<string, string | number> = {
    opacity: Math.min(100, Math.max(0, opacity ?? 35)) / 100,
  };
  switch (kind) {
    case "grain":
      return { ...base, backgroundImage: GRAIN, mixBlendMode: "overlay" };
    case "dots":
      return {
        ...base,
        backgroundImage:
          "radial-gradient(rgba(255,255,255,.95) 1.1px, transparent 1.5px)",
        backgroundSize: "16px 16px",
      };
    case "diagonal":
      return {
        ...base,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,.85) 0, rgba(255,255,255,.85) 1.5px, transparent 1.5px, transparent 13px)",
      };
    case "grid":
      return {
        ...base,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
      };
    case "scanlines":
      return {
        ...base,
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0, rgba(255,255,255,.5) 1px, transparent 1px, transparent 5px)",
      };
    case "vignette":
      return {
        ...base,
        backgroundImage:
          "radial-gradient(125% 95% at 50% 22%, transparent 42%, rgba(0,0,0,.9))",
      };
    case "glow":
      return {
        ...base,
        backgroundImage:
          "radial-gradient(80% 70% at 50% 12%, rgba(255,255,255,.85), transparent 60%)",
        mixBlendMode: "soft-light",
      };
    default:
      return null;
  }
}

/** Chemin SVG (viewBox 0 0 1200 120, preserveAspectRatio none) de la bordure. */
export function borderPath(kind: HeroBorder | undefined): string | null {
  switch (kind) {
    case "wave":
      return "M0,58 C260,112 470,12 700,46 C910,76 1050,18 1200,52 L1200,120 L0,120 Z";
    case "slant":
      return "M0,120 L1200,44 L1200,120 Z";
    case "curve":
      return "M0,120 Q600,2 1200,120 Z";
    case "rounded":
      return "M0,120 L0,52 Q0,22 42,22 L1158,22 Q1200,22 1200,52 L1200,120 Z";
    case "zigzag":
      return "M0,120 L0,64 L120,32 L240,64 L360,32 L480,64 L600,32 L720,64 L840,32 L960,64 L1080,32 L1200,64 L1200,120 Z";
    case "peaks":
      return "M0,120 L0,60 Q75,14 150,60 Q225,14 300,60 Q375,14 450,60 Q525,14 600,60 Q675,14 750,60 Q825,14 900,60 Q975,14 1050,60 Q1125,14 1200,60 L1200,120 Z";
    default:
      return null;
  }
}
