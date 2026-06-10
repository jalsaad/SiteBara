// Types des pages composées par blocs — partagés client/serveur.

export type BlockType = "hero" | "text" | "news" | "grid" | "gallery" | "contact";

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
}

export type BlockData = Partial<HeroData> & {
  title?: string;
  body?: string;
  addr?: string;
  tel?: string;
  mail?: string;
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
  },
  text: {
    title: "Titre de section",
    body: "Saisissez votre texte ici. Ce bloc accepte plusieurs paragraphes et se modifie sans aucune ligne de code.",
  },
  news: { title: "Dernières actualités" },
  grid: { title: "Grille horaire — 1er degré" },
  gallery: { title: "Galerie photo" },
  contact: {
    title: "Nous contacter",
    addr: "Rue Duquesnoy 24, 7500 Tournai",
    tel: "069 89 06 02",
    mail: "direction@atheneejulesbara.be",
  },
};

export function blockId(): string {
  return "b" + Math.random().toString(36).slice(2, 8);
}
