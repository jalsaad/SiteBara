// Couche d'accès aux actualités — CÔTÉ SERVEUR UNIQUEMENT.
// Les composants client importent les types depuis "@/lib/article-types".
//
// Deux modes :
//  - DATABASE_URL défini  → PostgreSQL via Prisma (production, OVH)
//  - sans DATABASE_URL    → magasin en mémoire pré-rempli avec les contenus
//    de la maquette (mode démo : les modifications ne survivent pas au
//    redémarrage du serveur).

import "server-only";
import type { Article, ArticleInput, SocialShare } from "./article-types";
import { slugify } from "./article-types";

export type {
  Article,
  ArticleInput,
  ArticleStatus,
  SocialNetwork,
  SocialShare,
} from "./article-types";
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
    image: null,
    images: [],
    color: "#284193",
    status: "PUBLISHED",
    publishedAt: "2026-04-03T10:00:00.000Z",
    createdAt: "2026-04-01T10:00:00.000Z",
    shares: [
      {
        network: "facebook",
        sharedAt: "2026-04-03T10:05:00.000Z",
        status: "SIMULATED",
        detail: "Mode démo : aucune clé API configurée, publication simulée.",
      },
    ],
  },
  {
    id: "a2",
    title: "Biodiversité à tous les étages",
    slug: "biodiversite-a-tous-les-etages",
    category: "Projet",
    excerpt:
      "Un projet pédagogique immersif autour de la nature et du vivant.",
    body: "Un projet pédagogique immersif autour de la nature et du vivant, mené avec l'ensemble des classes.",
    image: null,
    images: [],
    color: "#0f9e75",
    status: "PUBLISHED",
    publishedAt: "2026-03-18T10:00:00.000Z",
    createdAt: "2026-03-15T10:00:00.000Z",
    shares: [],
  },
  {
    id: "a3",
    title: "Portes ouvertes & préinscriptions",
    slug: "portes-ouvertes-preinscriptions",
    category: "Inscription",
    excerpt:
      "Venez découvrir l'établissement et rencontrer l'équipe pédagogique.",
    body: "Venez découvrir l'établissement et rencontrer l'équipe pédagogique lors de nos journées portes ouvertes.",
    image: null,
    images: [],
    color: "#f57a20",
    status: "PUBLISHED",
    publishedAt: "2026-03-02T10:00:00.000Z",
    createdAt: "2026-02-25T10:00:00.000Z",
    shares: [],
  },
  {
    id: "a4",
    title: "Voyage scolaire en Italie",
    slug: "voyage-scolaire-en-italie",
    category: "Sortie",
    excerpt:
      "Brouillon en cours de rédaction pour le séjour culturel de mai.",
    body: "",
    image: null,
    images: [],
    color: "#1b2245",
    status: "DRAFT",
    publishedAt: null,
    createdAt: "2026-04-10T10:00:00.000Z",
    shares: [],
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

type PrismaArticle = Omit<
  Article,
  "publishedAt" | "createdAt" | "shares" | "images"
> & {
  publishedAt: Date | null;
  createdAt: Date;
  // Colonnes Json — optionnelles pour rester compatible avec un client Prisma
  // généré avant les migrations « shares »/« images » (régénérer via
  // `npx prisma generate`).
  shares?: unknown;
  images?: unknown;
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
    shares: Array.isArray(a.shares) ? (a.shares as SocialShare[]) : [],
    images: Array.isArray(a.images) ? (a.images as string[]) : [],
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

export async function getArticleById(id: string): Promise<Article | null> {
  if (useDb) {
    const db = await prisma();
    const row = await db.article.findUnique({ where: { id } });
    return row ? fromDb(row) : null;
  }
  return memStore().find((a) => a.id === id) ?? null;
}

/** Ajoute des diffusions à l'historique d'un article (réseaux sociaux). */
export async function addShares(
  id: string,
  shares: SocialShare[]
): Promise<Article | null> {
  if (useDb) {
    const db = await prisma();
    const prev = (await db.article.findUnique({
      where: { id },
    })) as PrismaArticle | null;
    if (!prev) return null;
    const merged = [
      ...(Array.isArray(prev.shares) ? (prev.shares as SocialShare[]) : []),
      ...shares,
    ];
    const row = await db.article.update({
      where: { id },
      // Cast : champ absent des types tant que le client n'est pas régénéré.
      data: { shares: merged } as never,
    });
    return fromDb(row);
  }
  const a = memStore().find((x) => x.id === id);
  if (!a) return null;
  a.shares = [...a.shares, ...shares];
  return a;
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const status = input.status ?? "DRAFT";
  const base = {
    title: input.title,
    slug: slugify(input.title) || memId(),
    category: input.category,
    excerpt: input.excerpt,
    body: input.body ?? "",
    image: input.image ?? null,
    images: input.images ?? [],
    color: input.color ?? "#284193",
    status,
  };
  const publishedAt = status === "PUBLISHED" ? new Date() : null;
  if (useDb) {
    const db = await prisma();
    const row = await db.article.create({
      data: {
        ...base,
        publishedAt,
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
    publishedAt: publishedAt ? publishedAt.toISOString() : null,
    createdAt: new Date().toISOString(),
    shares: [],
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
