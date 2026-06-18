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

// ---- Pages « cœur » du menu, désormais éditables (rendues sur leurs routes
// dédiées /filieres, /calendrier, /actualites, /restaurant). ----

// Options (/filieres)
seed.push({
  slug: "filieres",
  title: "Options",
  published: true,
  blocks: [
    {
      id: blockId(),
      type: "banner",
      data: {
        eyebrow: "Enseignement secondaire · Tournai",
        title: "Nos *options*",
        sub: "Un parcours général de transition, du premier au troisième degré, pour préparer chaque élève aux études supérieures dans un cadre exigeant et bienveillant.",
        color: "#284193",
      },
    },
    {
      id: blockId(),
      type: "cards",
      data: {
        eyebrow: "Les trois degrés",
        title: "Un parcours *progressif*",
        lead: "De l'entrée en secondaire jusqu'à la rhétorique, chaque degré construit l'autonomie et affine l'orientation de l'élève.",
        cards: [
          {
            icon: "🧭",
            title: "Premier degré",
            desc: "1re & 2e — commun et différencié. Tronc commun, activités complémentaires au choix et dispositif différencié (1D/2D).",
            href: "#",
            color: "var(--royal)",
          },
          {
            icon: "🔬",
            title: "Deuxième degré",
            desc: "3e & 4e — transition générale. Renforcement en sciences, langues modernes, sciences économiques et humaines.",
            href: "#",
            color: "var(--teal)",
          },
          {
            icon: "🎓",
            title: "Troisième degré",
            desc: "5e & 6e — transition générale. Approfondissement des options en vue des études supérieures.",
            href: "#",
            color: "var(--orange)",
          },
        ],
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "Grille horaire — premier degré commun",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Formation religieuse / morale", p: "2" },
          { c: "Français", p: "6" },
          { c: "Mathématiques", p: "4" },
          { c: "Langue moderne I (néerlandais / anglais)", p: "4" },
          { c: "Étude du milieu (histoire-géographie)", p: "4" },
          { c: "Sciences", p: "3" },
          { c: "Éducation physique", p: "3" },
          { c: "Éducation artistique & technologique", p: "2" },
          { c: "Activités complémentaires au choix", p: "4" },
        ],
      },
    },
    {
      id: blockId(),
      type: "split",
      data: {
        eyebrow: "Options aux 2e & 3e degrés",
        title: "Construire son *orientation*",
        icon: "🎓",
        tags: ["Sciences", "Langues", "Mathématiques", "Sciences économiques", "Latin"],
        checks: [
          { title: "Sciences (sciences générales)", desc: "" },
          { title: "Mathématiques renforcées", desc: "" },
          { title: "Langues modernes (néerlandais · anglais · espagnol)", desc: "" },
          { title: "Sciences économiques", desc: "" },
          { title: "Sciences sociales & humaines", desc: "" },
          { title: "Latin", desc: "" },
        ],
      },
    },
    {
      id: blockId(),
      type: "cards",
      data: {
        eyebrow: "Dispositifs",
        title: "*DASPA* & 7ᵉ préparatoire",
        lead: "",
        cards: [
          {
            icon: "🌍",
            title: "DASPA",
            desc: "Dispositif d'Accueil et de Scolarisation des élèves Primo-Arrivants : intégration progressive, apprentissage intensif du français.",
            href: "#",
            color: "var(--teal)",
          },
          {
            icon: "📚",
            title: "7ᵉ préparatoire",
            desc: "Année préparatoire à l'enseignement supérieur : renforcement des prérequis (mathématiques, sciences, langues).",
            href: "#",
            color: "var(--gold)",
          },
        ],
      },
    },
    {
      id: blockId(),
      type: "cta",
      data: {
        title: "Une question sur l'orientation ?",
        body: "L'équipe pédagogique vous reçoit pour construire le parcours le mieux adapté à votre enfant.",
        btn: "Préinscription",
        link: "/preinscription",
      },
    },
  ],
});

// Calendrier (/calendrier)
seed.push({
  slug: "calendrier",
  title: "Calendrier",
  published: true,
  blocks: [
    {
      id: blockId(),
      type: "banner",
      data: {
        eyebrow: "Année scolaire 2026-2027",
        title: "Calendrier *scolaire*",
        sub: "Congés, vacances et temps forts de l'année, selon le calendrier officiel de la Fédération Wallonie-Bruxelles.",
        color: "#f57a20",
      },
    },
    {
      id: blockId(),
      type: "downloads",
      data: {
        title: "",
        downloads: [
          {
            label: "📄 Consulter le calendrier (PDF)",
            href: "/calendrier-2026-2027.pdf",
            download: false,
            primary: false,
          },
          {
            label: "📅 Ajouter les vacances à mon agenda",
            href: "/calendrier-vacances-2026-2027.ics",
            download: true,
            primary: true,
          },
        ],
        hint: "Le fichier « .ics » s'ouvre dans votre application d'agenda (Google Agenda, Apple Calendrier, Outlook…) pour importer toutes les dates en un clic.",
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "Congés & vacances 2026-2027",
        th1: "Période",
        th2: "Dates",
        rows: [
          { c: "Rentrée scolaire", p: "Lundi 24 août 2026" },
          { c: "Fête de la Communauté française", p: "Dimanche 27 septembre 2026" },
          { c: "Congé d'automne (Toussaint)", p: "Du 19 au 30 octobre 2026" },
          { c: "Fête des morts", p: "Lundi 2 novembre 2026" },
          { c: "Commémoration du 11 novembre", p: "Mercredi 11 novembre 2026" },
          { c: "Vacances d'hiver (Noël)", p: "Du 21 décembre 2026 au 1ᵉʳ janvier 2027" },
          { c: "Mardi Gras", p: "Mardi 9 février 2027" },
          { c: "Congé de détente (Carnaval)", p: "Du 22 février au 5 mars 2027" },
          { c: "Lundi de Pâques", p: "Lundi 29 mars 2027" },
          { c: "Vacances de printemps (Pâques)", p: "Du 26 avril au 7 mai 2027" },
          { c: "Jeudi de l'Ascension", p: "Jeudi 6 mai 2027" },
          { c: "Lundi de Pentecôte", p: "Lundi 17 mai 2027" },
          { c: "Vacances d'été", p: "À partir du 2 juillet 2027" },
        ],
      },
    },
    {
      id: blockId(),
      type: "split",
      data: {
        eyebrow: "Temps forts",
        title: "Prochains *rendez-vous*",
        icon: "📅",
        tags: [],
        checks: [
          { title: "Juin 2027 — Session d'examens", desc: "Évaluations de fin d'année pour l'ensemble des degrés." },
          { title: "Fin juin 2027 — Bulletins & proclamation", desc: "Réunion de parents et proclamation des résultats de la rhétorique." },
          { title: "1ᵉʳ juillet 2027 — Dernier jour de cours", desc: "Clôture de l'année scolaire 2026-2027." },
          { title: "Fin août 2027 — Rentrée 2027-2028", desc: "Reprise des cours pour la nouvelle année scolaire." },
        ],
      },
    },
    {
      id: blockId(),
      type: "cta",
      data: {
        title: "Une question sur le calendrier ?",
        body: "Le secrétariat vous renseigne sur les dates et l'organisation de l'année.",
        btn: "Nous contacter",
        link: "/contact",
      },
    },
  ],
});

// Actualités (/actualites) — en-tête et habillage éditables ; la liste des
// articles (bloc newslist) reste alimentée par /admin/actus.
seed.push({
  slug: "actualites",
  title: "Actualités",
  published: true,
  blocks: [
    {
      id: blockId(),
      type: "banner",
      data: {
        eyebrow: "Vie de l'école",
        title: "Toutes les *actualités*",
        sub: "Événements, projets et informations pratiques de l'Athénée Royal Jules Bara.",
        color: "#284193",
      },
    },
    {
      id: blockId(),
      type: "newslist",
      data: { eyebrow: "", title: "", lead: "" },
    },
    {
      id: blockId(),
      type: "cta",
      data: {
        title: "Une info à partager ?",
        body: "Un projet, un événement, une réussite ? Faites-le savoir au service communication.",
        btn: "Nous contacter",
        link: "/contact",
      },
    },
  ],
});

// Restaurant (/restaurant) — menu automatique géré dans /admin/menu.
seed.push({
  slug: "restaurant",
  title: "Restaurant",
  published: true,
  blocks: [
    {
      id: blockId(),
      type: "banner",
      data: {
        eyebrow: "Vie quotidienne · Restaurant scolaire",
        title: "Le *restaurant* scolaire",
        sub: "Des repas chauds, équilibrés et préparés sur place chaque jour, avec une alternative végétarienne quotidienne.",
        color: "#c79a4b",
      },
    },
    {
      id: blockId(),
      type: "menu",
      data: {
        eyebrow: "Menu de la semaine",
        title: "Au menu *au restaurant*",
        lead: "Menus indicatifs, susceptibles d'évoluer selon les approvisionnements. Une alternative végétarienne est proposée chaque jour.",
        note: "Repas commandés et payés en ligne, sans espèces, via le compte de l'élève.",
        btn: "🍽 Réserver vos repas sur APSchool",
        link: "https://www.apschool.be",
      },
    },
    {
      id: blockId(),
      type: "cards",
      data: {
        eyebrow: "Infos pratiques",
        title: "Bon à *savoir*",
        lead: "",
        cards: [
          {
            icon: "🕛",
            title: "Horaires",
            desc: "Service du midi de 11h45 à 13h15, en deux pauses selon les degrés. Restaurant fermé le mercredi après-midi.",
            href: "#",
            color: "var(--royal)",
          },
          {
            icon: "💳",
            title: "Tarifs & paiement",
            desc: "Repas complet (potage + plat + dessert) à tarif démocratique. Paiement sans espèces via le compte APSchool de l'élève.",
            href: "#",
            color: "var(--orange)",
          },
          {
            icon: "🥗",
            title: "Alternative & allergènes",
            desc: "Une alternative végétarienne chaque jour. Les fiches allergènes sont affichées au self et disponibles au secrétariat.",
            href: "#",
            color: "var(--teal)",
          },
        ],
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
