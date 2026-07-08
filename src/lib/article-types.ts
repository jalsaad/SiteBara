// Types et helpers partagés client/serveur (sans dépendance Prisma).

export type ArticleStatus = "DRAFT" | "PUBLISHED";

// Diffusion vers les réseaux sociaux (cahier des charges : gestionnaire
// d'actualités → publication et diffusion de contenus vers les réseaux).
export type SocialNetwork = "facebook" | "instagram" | "linkedin";

export type SocialShareStatus = "SENT" | "SIMULATED" | "FAILED";

export interface SocialShare {
  network: SocialNetwork;
  sharedAt: string; // ISO
  status: SocialShareStatus;
  detail?: string;
}

export const SOCIAL_NETWORKS: {
  id: SocialNetwork;
  label: string;
  icon: string; // chemin vers /public/icons/
}[] = [
  { id: "facebook",  label: "Facebook",  icon: "/icons/facebook.svg"  },
  { id: "instagram", label: "Instagram", icon: "/icons/instagram.svg" },
  { id: "linkedin",  label: "LinkedIn",  icon: "/icons/linkedin.svg"  },
];

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  image: string | null;
  images: string[];
  color: string;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  shares: SocialShare[];
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  ctaStyle?: string | null;
  ctaNewTab?: boolean;
  embed?: string | null;
}

export interface ArticleInput {
  title: string;
  category: string;
  excerpt: string;
  body?: string;
  image?: string | null;
  images?: string[];
  color?: string;
  status?: ArticleStatus;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  ctaStyle?: string | null;
  ctaNewTab?: boolean;
  embed?: string | null;
}

// Une URL de média est considérée comme une vidéo d'après son extension.
export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm)(\?|#|$)/i.test(url);
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDateFr(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
