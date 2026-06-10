// Couche d'accès aux pages composées par blocs — CÔTÉ SERVEUR UNIQUEMENT.
// Même logique que src/lib/articles.ts : Prisma si DATABASE_URL, sinon
// magasin mémoire de démonstration.

import "server-only";
import type { Block, PageData } from "./page-types";
import { blockId } from "./page-types";

export type { Block, PageData } from "./page-types";

const seed: PageData[] = [
  {
    slug: "accueil",
    title: "Accueil",
    published: true,
    blocks: [
      {
        id: blockId(),
        type: "hero",
        data: {
          pill: "Établissement d'enseignement · Fondé en 1595",
          title: "Apprendre, *s'ouvrir*, s'accomplir",
          sub: "Au cœur de Tournai, un athénée où chaque élève est accompagné individuellement vers la réussite.",
          btn1: "Préinscriptions ouvertes",
          link1: "/preinscription",
          btn2: "Découvrir l'école",
          link2: "/#mission",
          color: "#1b2245",
          bg: "texture",
          effects: true,
          anim: true,
        },
      },
      { id: blockId(), type: "news", data: { title: "Dernières actualités" } },
      {
        id: blockId(),
        type: "contact",
        data: {
          title: "Nous trouver",
          addr: "Rue Duquesnoy 24, 7500 Tournai",
          tel: "069 89 06 02",
          mail: "direction@atheneejulesbara.be",
        },
      },
    ],
  },
];

// Exemple de page secondaire pré-remplie (mode démo).
seed.push({
  slug: "filieres",
  title: "Nos filières",
  published: true,
  blocks: [
    {
      id: blockId(),
      type: "hero",
      data: {
        pill: "Enseignement",
        title: "Nos *filières* et options",
        sub: "Du premier au troisième degré, ainsi que le DASPA et la 7ᵉ préparatoire.",
        btn1: "Préinscription",
        link1: "/preinscription",
        btn2: "",
        link2: "#",
        color: "#284193",
        bg: "gradient",
        effects: true,
        anim: true,
      },
    },
    { id: blockId(), type: "grid", data: { title: "Grille horaire — 1er degré" } },
    {
      id: blockId(),
      type: "text",
      data: {
        title: "Un parcours pour chaque élève",
        body: "Enseignement général, options scientifiques, langues modernes, sciences économiques et sociales : chaque élève construit un parcours adapté à son projet.",
      },
    },
  ],
});

const g = globalThis as unknown as { __baraPages?: PageData[] };
function memStore(): PageData[] {
  if (!g.__baraPages) g.__baraPages = structuredClone(seed);
  return g.__baraPages;
}

const useDb = !!process.env.DATABASE_URL;

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

export async function getPage(slug: string): Promise<PageData | null> {
  if (useDb) {
    const db = await prisma();
    const page = await db.page.findUnique({
      where: { slug },
      include: { blocks: { orderBy: { order: "asc" } } },
    });
    if (!page) return null;
    return {
      slug: page.slug,
      title: page.title,
      published: page.published,
      blocks: page.blocks.map((b) => ({
        id: b.id,
        type: b.type as Block["type"],
        data: b.data as Block["data"],
      })),
    };
  }
  return memStore().find((p) => p.slug === slug) ?? null;
}

export async function listPages(): Promise<
  { slug: string; title: string; published: boolean }[]
> {
  if (useDb) {
    const db = await prisma();
    const pages = await db.page.findMany({
      select: { slug: true, title: true, published: true },
      orderBy: { createdAt: "asc" },
    });
    return pages;
  }
  return memStore().map(({ slug, title, published }) => ({
    slug,
    title,
    published,
  }));
}

export async function createPage(
  slug: string,
  title: string
): Promise<PageData | null> {
  if (useDb) {
    const db = await prisma();
    const exists = await db.page.findUnique({ where: { slug } });
    if (exists) return null;
    await db.page.create({ data: { slug, title, published: false } });
    return (await getPage(slug))!;
  }
  const store = memStore();
  if (store.some((p) => p.slug === slug)) return null;
  const page: PageData = { slug, title, published: false, blocks: [] };
  store.push(page);
  return page;
}

export async function deletePage(slug: string): Promise<boolean> {
  if (useDb) {
    const db = await prisma();
    try {
      await db.page.delete({ where: { slug } });
      return true;
    } catch {
      return false;
    }
  }
  const store = memStore();
  const i = store.findIndex((p) => p.slug === slug);
  if (i === -1) return false;
  store.splice(i, 1);
  return true;
}

export async function savePage(
  slug: string,
  input: { title?: string; blocks: Block[]; publish?: boolean }
): Promise<PageData> {
  if (useDb) {
    const db = await prisma();
    const page = await db.page.upsert({
      where: { slug },
      create: {
        slug,
        title: input.title ?? slug,
        published: input.publish ?? false,
      },
      update: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.publish !== undefined ? { published: input.publish } : {}),
      },
    });
    // Remplace l'ensemble des blocs (ordre = position dans le tableau).
    await db.block.deleteMany({ where: { pageId: page.id } });
    await db.block.createMany({
      data: input.blocks.map((b, i) => ({
        pageId: page.id,
        order: i,
        type: b.type,
        data: b.data as object,
      })),
    });
    return (await getPage(slug))!;
  }
  const store = memStore();
  let page = store.find((p) => p.slug === slug);
  if (!page) {
    page = { slug, title: input.title ?? slug, published: false, blocks: [] };
    store.push(page);
  }
  if (input.title) page.title = input.title;
  if (input.publish !== undefined) page.published = input.publish;
  page.blocks = structuredClone(input.blocks);
  return page;
}
