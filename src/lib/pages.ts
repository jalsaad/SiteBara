// Couche d'accès aux pages composées par blocs — CÔTÉ SERVEUR UNIQUEMENT.
// Même logique que src/lib/articles.ts : Prisma si DATABASE_URL, sinon
// magasin mémoire de démonstration.

import "server-only";
import type { Block, PageData } from "./page-types";
import { blockId } from "./page-types";

export type { Block, PageData } from "./page-types";

// Page d'accueil du site (« / ») — désormais ÉDITABLE via l'éditeur : la route
// `/` rend cette page composée (slug « accueil ») via PageBlocks.
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
          title: "Apprendre, *s'ouvrir*, s'accomplir.",
          sub: "Au cœur de Tournai, un athénée où chaque élève est accompagné individuellement vers la réussite, dans un cadre moderne et bienveillant.",
          btn1: "École en ligne",
          link1:
            "https://www9.ecoleenligne.be/V01154-3/membres/login.php?action=login&opt=1&id=1&order=desc&language_init=fr&etp=arjulesbara",
          btn2: "Préinscriptions ouvertes",
          link2: "/preinscription",
          color: "#1b2245",
          bg: "texture",
          effects: true,
          anim: true,
          video: "/hero.mp4",
          overlay: "grain",
          overlayOpacity: 40,
          border: "none",
          borderColor: "#f7f2e9",
          borderBg: "",
          stats: [
            { n: "430+", l: "Ans d'histoire" },
            { n: "950", l: "Élèves heureux" },
            { n: "100%", l: "Personnels investis" },
          ],
        },
      },
      {
        id: blockId(),
        type: "pillars",
        data: {
          intro:
            "Depuis plus de quatre siècles, l'Athénée Royal Jules Bara forme des esprits *curieux, ouverts et autonomes*.",
          pillars: [
            {
              title: "Apprendre",
              desc: "Des approches pédagogiques diversifiées et ludiques, du matériel moderne et un suivi personnalisé de chaque élève.",
            },
            {
              title: "S'ouvrir",
              desc: "Échanges, projets citoyens, langues et culture : une école tournée vers le monde et la diversité.",
            },
            {
              title: "S'accomplir",
              desc: "Développer l'autonomie et la confiance pour que chacun trouve sa voie et révèle son potentiel.",
            },
          ],
        },
      },
      {
        id: blockId(),
        type: "cards",
        data: {
          eyebrow: "Accès rapides",
          title: "Tout ce dont vous avez besoin, *en un clic*",
          lead: "Élèves, parents et enseignants accèdent directement aux ressources essentielles de l'établissement.",
          cards: [
            {
              icon: "🎓",
              title: "Nos options",
              desc: "Grilles horaires du premier au troisième degré, DASPA et 7ᵉ préparatoire.",
              href: "/filieres",
              color: "var(--royal)",
            },
            {
              icon: "📅",
              title: "Calendrier",
              desc: "Dates clés, congés et événements de l'année scolaire en cours.",
              href: "/calendrier",
              color: "var(--orange)",
            },
            {
              icon: "💻",
              title: "École numérique",
              desc: "Google Classroom, APSchool et l'espace de travail École en ligne.",
              href: "/applis",
              color: "var(--teal)",
            },
            {
              icon: "🍽️",
              title: "Restaurant",
              desc: "Menus de la semaine et informations sur la cantine scolaire.",
              href: "/restaurant",
              color: "var(--gold)",
            },
          ],
        },
      },
      {
        id: blockId(),
        type: "split",
        data: {
          eyebrow: "Une école résolument numérique",
          title: "Des outils modernes au service de la *pédagogie*",
          icon: "💻",
          tags: [
            "Google Classroom",
            "APSchool",
            "Tableaux interactifs",
            "École en ligne",
          ],
          checks: [
            {
              title: "Classes connectées",
              desc: "Matériel moderne et environnements numériques de travail.",
            },
            {
              title: "Suivi en ligne",
              desc: "Parents et élèves suivent les résultats et communications via École en ligne.",
            },
            {
              title: "Accompagnement adapté",
              desc: "Prise en charge des troubles de l'apprentissage et école des devoirs.",
            },
          ],
        },
      },
      { id: blockId(), type: "news", data: { title: "Dernières actualités" } },
      {
        id: blockId(),
        type: "quote",
        data: {
          quote:
            "Une école n'est pas un lieu où l'on entasse des savoirs, mais où l'on apprend à devenir soi-même.",
          who: "— L'équipe pédagogique, Athénée Royal Jules Bara",
        },
      },
      {
        id: blockId(),
        type: "cta",
        data: {
          title: "Envie de rejoindre l'aventure Bara ?",
          body: "Les préinscriptions pour la prochaine rentrée sont ouvertes. Venez nous rencontrer.",
          btn: "Je m'inscris",
          link: "/preinscription",
        },
      },
    ],
  },
];

// Exemple de page secondaire composée dans l'éditeur (mode démo). Sujet
// distinct des pages de contenu dédiées (/filieres, /restaurant, /calendrier)
// pour illustrer l'éditeur drag-and-drop sans faire doublon.
seed.push({
  slug: "projet-pedagogique",
  title: "Notre projet",
  published: true,
  blocks: [
    {
      id: blockId(),
      type: "hero",
      data: {
        pill: "Projet d'établissement",
        title: "Notre *projet* pédagogique",
        sub: "Une école bienveillante et exigeante, tournée vers l'autonomie, l'ouverture et la réussite de chaque élève.",
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
    {
      id: blockId(),
      type: "text",
      data: {
        title: "Apprendre, s'ouvrir, s'accomplir",
        body: "Des approches pédagogiques diversifiées et un suivi personnalisé, une école tournée vers le monde et la diversité, et le développement de l'autonomie pour que chacun trouve sa voie.",
      },
    },
    { id: blockId(), type: "gallery", data: { title: "La vie à Bara" } },
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
