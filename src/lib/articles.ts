// Couche d'accès aux actualités — CÔTÉ SERVEUR UNIQUEMENT.
// Les composants client importent les types depuis "@/lib/article-types".
//
// Deux modes :
//  - DATABASE_URL défini  → PostgreSQL via Prisma (production, OVH)
//  - sans DATABASE_URL    → magasin en mémoire pré-rempli avec les contenus
//    de la maquette (mode démo : les modifications ne survivent pas au
//    redémarrage du serveur).

import "server-only";
import type { Article, ArticleInput } from "./article-types";
import { slugify } from "./article-types";

export type { Article, ArticleInput, ArticleStatus } from "./article-types";
export { slugify, formatDateFr } from "./article-types";

/* ------------------- magasin mémoire (mode démo) ------------------- */

const seed: Article[] = [
  {
    id: "a1",
    title: "Tournoi d'éloquence 2026",
    slug: "tournoi-d-eloquence-2026",
    category: "Événement",
    excerpt:
      "Nos élèves de 3e degré ont brillé lors de la grande finale d'éloquence.",
    body: "Nos élèves de 3e degré ont brillé lors de la grande finale d'éloquence organisée à Tournai.",
    color: "#284193",
    status: "PUBLISHED",
    publishedAt: "2026-04-03T10:00:00.000Z",
    createdAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "a2",
    title: "Biodiversité à tous les étages",
    slug: "biodiversite-a-tous-les-etages",
    category: "Projet",
    excerpt:
      "Un projet pédagogique immersif autour de la nature et du vivant.",
    body: "Un projet pédagogique immersif autour de la nature et du vivant, mené avec l'ensemble des classes.",
    color: "#0f9e75",
    status: "PUBLISHED",
    publishedAt: "2026-03-18T10:00:00.000Z",
    createdAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "a3",
    title: "Portes ouvertes & préinscriptions",
    slug: "portes-ouvertes-preinscriptions",
    category: "Inscription",
    excerpt:
      "Venez découvrir l'établissement et rencontrer l'équipe pédagogique.",
    body: "Venez découvrir l'établissement et rencontrer l'équipe pédagogique lors de nos journées portes ouvertes.",
    color: "#f57a20",
    status: "PUBLISHED",
    publishedAt: "2026-03-02T10:00:00.000Z",
    createdAt: "2026-02-25T10:00:00.000Z",
  },
  {
    id: "a4",
    title: "Voyage scolaire en Italie",
    slug: "voyage-scolaire-en-italie",
    category: "Sortie",
    excerpt:
      "Brouillon en cours de rédaction pour le séjour culturel de mai.",
    body: "",
    color: "#1b2245",
    status: "DRAFT",
    publishedAt: null,
    createdAt: "2026-04-10T10:00:00.000Z",
  },
];

// Conserve le magasin entre les rechargements HMR du serveur de dev.
const g = globalThis as unknown as { __baraArticles?: Article[] };
function memStore(): Article[] {
  if (!g.__baraArticles) g.__baraArticles = structuredClone(seed);
  return g.__baraArticles;
}

function memId(): string {
  return "a" + Math.random().toString(36).slice(2, 10);
}

/* ------------------------------ Prisma ------------------------------ */

const useDb = !!process.env.DATABASE_URL;

type PrismaArticle = Omit<Article, "publishedAt" | "createdAt"> & {
  publishedAt: Date | null;
  createdAt: Date;
};

async function prisma() {
  const { PrismaClient } = await import("@/generated/prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const gp = globalThis as unknown as {
    __baraPrisma?: InstanceType<typeof PrismaClient>;
  };
  if (!gp.__baraPrisma) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    gp.__baraPrisma = new PrismaClient({ adapter });
  }
  return gp.__baraPrisma;
}

function fromDb(a: PrismaArticle): Article {
  return {
    ...a,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
  };
}

/* ------------------------------- API ------------------------------- */

export async function listArticles(opts?: {
  publishedOnly?: boolean;
  limit?: number;
}): Promise<Article[]> {
  if (useDb) {
    const db = await prisma();
    const rows = await db.article.findMany({
      where: opts?.publishedOnly ? { status: "PUBLISHED" } : undefined,
      orderBy: { createdAt: "desc" },
      take: opts?.limit,
    });
    return rows.map(fromDb);
  }
  let rows = [...memStore()].sort((x, y) =>
    y.createdAt.localeCompare(x.createdAt)
  );
  if (opts?.publishedOnly) rows = rows.filter((a) => a.status === "PUBLISHED");
  if (opts?.limit) rows = rows.slice(0, opts.limit);
  return rows;
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (useDb) {
    const db = await prisma();
    const row = await db.article.findUnique({ where: { slug } });
    return row ? fromDb(row) : null;
  }
  return memStore().find((a) => a.slug === slug) ?? null;
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const status = input.status ?? "DRAFT";
  const base = {
    title: input.title,
    slug: slugify(input.title) || memId(),
    category: input.category,
    excerpt: input.excerpt,
    body: input.body ?? "",
    color: input.color ?? "#284193",
    status,
  };
  if (useDb) {
    const db = await prisma();
    const row = await db.article.create({
      data: {
        ...base,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
    return fromDb(row);
  }
  const store = memStore();
  if (store.some((a) => a.slug === base.slug)) {
    base.slug = `${base.slug}-${memId()}`;
  }
  const article: Article = {
    ...base,
    id: memId(),
    publishedAt: status === "PUBLISHED" ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
  };
  store.unshift(article);
  return article;
}

export async function updateArticle(
  id: string,
  input: Partial<ArticleInput>
): Promise<Article | null> {
  if (useDb) {
    const db = await prisma();
    const prev = await db.article.findUnique({ where: { id } });
    if (!prev) return null;
    const row = await db.article.update({
      where: { id },
      data: {
        ...input,
        publishedAt:
          input.status === "PUBLISHED" && prev.status !== "PUBLISHED"
            ? new Date()
            : prev.publishedAt,
      },
    });
    return fromDb(row);
  }
  const store = memStore();
  const a = store.find((x) => x.id === id);
  if (!a) return null;
  if (input.status === "PUBLISHED" && a.status !== "PUBLISHED") {
    a.publishedAt = new Date().toISOString();
  }
  Object.assign(a, input);
  return a;
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (useDb) {
    const db = await prisma();
    try {
      await db.article.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  const store = memStore();
  const i = store.findIndex((x) => x.id === id);
  if (i === -1) return false;
  store.splice(i, 1);
  return true;
}
