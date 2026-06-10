// Helpers couleur de la maquette : dérivés des teintes d'accent des cartes.

export function shade(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - 30);
  const g = Math.max(0, ((n >> 8) & 255) - 20);
  const b = Math.min(255, (n & 255) + 10);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

export const ACCENT_COLORS = [
  "#284193",
  "#1b2245",
  "#f57a20",
  "#0f9e75",
  "#7c4dff",
];

export const CATEGORY_ICONS: Record<string, string> = {
  "Événement": "🎤",
  "Projet": "🌿",
  "Inscription": "📋",
  "Sortie": "✈️",
};
