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

// Couleurs d'accent / d'arrière-plan proposées dans l'éditeur (pastilles).
export const ACCENT_COLORS = [
  "#284193", // royal
  "#1b2245", // marine
  "#3b5bdb", // bleu
  "#0ea5e9", // ciel
  "#0f9e75", // teal
  "#16a34a", // vert
  "#c79a4b", // or
  "#f57a20", // orange
  "#c0392b", // rouge
  "#9d174d", // bordeaux
  "#7c4dff", // violet
  "#111827", // anthracite
];

// Couleurs de texte proposées (sur fonds colorés des en-têtes/bannières).
export const TEXT_COLORS = [
  "#ffffff", // blanc
  "#f7f2e9", // crème
  "#1b2245", // marine
  "#284193", // royal
  "#f57a20", // orange
  "#111827", // noir
];

export const CATEGORY_ICONS: Record<string, string> = {
  "Événement": "🎤",
  "Projet": "🌿",
  "Inscription": "📋",
  "Sortie": "✈️",
};
