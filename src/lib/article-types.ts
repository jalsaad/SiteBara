// Types et helpers partagés client/serveur (sans dépendance Prisma).

export type ArticleStatus = "DRAFT" | "PUBLISHED";

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  color: string;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
}

export interface ArticleInput {
  title: string;
  category: string;
  excerpt: string;
  body?: string;
  color?: string;
  status?: ArticleStatus;
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
