// Types des pages composées par blocs — partagés client/serveur.

export type BlockType =
  | "hero"
  | "text"
  | "news"
  | "grid"
  | "gallery"
  | "contact"
  | "pillars"
  | "cards"
  | "split"
  | "quote"
  | "cta";

// Effet graphique en premier plan de la bannière (avec opacité réglable).
export type HeroOverlay =
  | "none"
  | "grain"
  | "dots"
  | "diagonal"
  | "vignette"
  | "grid"
  | "scanlines"
  | "glow";
// Style de la bordure inférieure de la bannière.
export type HeroBorder =
  | "none"
  | "wave"
  | "slant"
  | "curve"
  | "rounded"
  | "zigzag"
  | "peaks";

// Statistique du héros (ex. « 430+ » / « Ans d'histoire »).
export interface HeroStat {
  n: string;
  l: string;
}

// Pilier (section « mission »).
export interface PillarItem {
  title: string;
  desc: string;
}

// Carte d'accès rapide.
export interface CardItem {
  icon: string;
  title: string;
  desc: string;
  href: string;
  color: string;
}

// Point de la liste à coches (section « école numérique »).
export interface CheckItem {
  title: string;
  desc: string;
}

export interface HeroData {
  pill: string;
  title: string;
  sub: string;
  btn1: string;
  link1: string;
  btn2: string;
  link2: string;
  color: string;
  bg: "gradient" | "solid" | "texture";
  effects: boolean;
  anim: boolean;
  video: string; // URL d'une vidéo d'arrière-plan (vide = aucune)
  overlay: HeroOverlay; // effet graphique en premier plan
  overlayOpacity: number; // 0–100, transparence de l'effet
  border: HeroBorder; // style de la bordure inférieure
  borderColor: string; // couleur de la forme de bordure (défaut crème)
  borderBg: string; // couleur d'arrière-plan de la bordure (vide = transparent)
  stats: HeroStat[]; // statistiques optionnelles sous les boutons
}

export interface GridRow {
  c: string; // intitulé (ex. cours)
  p: string; // valeur (ex. périodes)
}

export type BlockData = Partial<HeroData> & {
  title?: string;
  body?: string;
  addr?: string;
  tel?: string;
  mail?: string;
  images?: string[];
  // Bloc « Grille horaire » : en-têtes de colonnes + lignes éditables.
  th1?: string;
  th2?: string;
  rows?: GridRow[];
  // Sections « accueil » : intitulés communs.
  eyebrow?: string;
  lead?: string;
  icon?: string;
  // Bloc « Piliers » (mission) : grande intro + piliers numérotés.
  intro?: string;
  pillars?: PillarItem[];
  // Bloc « Cartes » (accès rapides).
  cards?: CardItem[];
  // Bloc « Deux colonnes » (école numérique) : étiquettes + liste à coches.
  tags?: string[];
  checks?: CheckItem[];
  // Bloc « Citation ».
  quote?: string;
  who?: string;
  // Bloc « Appel à l'action » : bouton.
  btn?: string;
  link?: string;
};

export interface Block {
  id: string;
  type: BlockType;
  data: BlockData;
}

export interface PageData {
  slug: string;
  title: string;
  published: boolean;
  blocks: Block[];
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Bannière",
  text: "Texte",
  news: "Actualités",
  grid: "Grille horaire",
  gallery: "Galerie",
  contact: "Contact",
  pillars: "Piliers",
  cards: "Cartes d'accès",
  split: "Deux colonnes",
  quote: "Citation",
  cta: "Appel à l'action",
};

export const BLOCK_TEMPLATES: Record<BlockType, BlockData> = {
  hero: {
    pill: "Nouveau",
    title: "Votre titre ici",
    sub: "Sous-titre descriptif de la section.",
    btn1: "En savoir plus",
    link1: "#",
    btn2: "",
    link2: "#",
    color: "#284193",
    bg: "gradient",
    effects: true,
    anim: true,
    video: "",
    overlay: "none",
    overlayOpacity: 35,
    border: "none",
    borderColor: "#f7f2e9",
    borderBg: "",
    stats: [],
  },
  text: {
    title: "Titre de section",
    body: "Saisissez votre texte ici. Ce bloc accepte plusieurs paragraphes et se modifie sans aucune ligne de code.",
  },
  news: { title: "Dernières actualités" },
  grid: {
    title: "Grille horaire — 1er degré",
    th1: "Cours",
    th2: "Périodes",
    rows: [
      { c: "Français", p: "5" },
      { c: "Mathématiques", p: "4" },
      { c: "Sciences", p: "3" },
      { c: "Langues modernes", p: "4" },
    ],
  },
  gallery: { title: "Galerie photo", images: [] },
  contact: {
    title: "Nous contacter",
    addr: "Rue Duquesnoy 24, 7500 Tournai",
    tel: "069 89 06 02",
    mail: "direction@atheneejulesbara.be",
  },
  pillars: {
    intro: "Une grande phrase d'introduction avec un *mot* en accent.",
    pillars: [
      { title: "Apprendre", desc: "Description du premier pilier." },
      { title: "S'ouvrir", desc: "Description du deuxième pilier." },
      { title: "S'accomplir", desc: "Description du troisième pilier." },
    ],
  },
  cards: {
    eyebrow: "Accès rapides",
    title: "Tout en *un clic*",
    lead: "Une courte phrase d'introduction.",
    cards: [
      {
        icon: "🎓",
        title: "Une carte",
        desc: "Description de la carte.",
        href: "#",
        color: "var(--royal)",
      },
    ],
  },
  split: {
    eyebrow: "Sur-titre",
    title: "Titre de la *section*",
    icon: "💻",
    tags: ["Étiquette 1", "Étiquette 2"],
    checks: [
      { title: "Point clé", desc: "Description du point." },
    ],
  },
  quote: {
    quote: "Une citation inspirante au sujet de l'école.",
    who: "— L'équipe pédagogique",
  },
  cta: {
    title: "Titre de l'appel à l'action",
    body: "Phrase incitative.",
    btn: "Bouton",
    link: "/preinscription",
  },
};

export function blockId(): string {
  return "b" + Math.random().toString(36).slice(2, 8);
}
