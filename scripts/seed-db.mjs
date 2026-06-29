/**
 * Seed the local PostgreSQL database with the default page content.
 * Run with: node scripts/seed-db.mjs
 * Requires DATABASE_URL in .env.local or the environment.
 */

import pg from "pg";
import { readFileSync } from "fs";
import { randomBytes } from "crypto";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load DATABASE_URL from .env.local if not already set
if (!process.env.DATABASE_URL) {
  try {
    const env = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
    for (const line of env.split("\n")) {
      const [k, ...rest] = line.split("=");
      if (k?.trim() === "DATABASE_URL") {
        process.env.DATABASE_URL = rest.join("=").trim();
      }
    }
  } catch {}
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function cuid() {
  return "c" + randomBytes(11).toString("base64url").slice(0, 23);
}

// ──────────────────────── Seed data ────────────────────────────────────────

const pages = [
  {
    slug: "accueil",
    title: "Accueil",
    published: true,
    order: 0,
    blocks: [
      {
        type: "hero",
        data: {
          pill: "Établissement d'enseignement · Fondé en 1595",
          title: "Apprendre, *s'ouvrir*, s'accomplir.",
          sub: "Au cœur de Tournai, un athénée où chaque élève est accompagné individuellement vers la réussite, dans un cadre moderne et bienveillant.",
          btn1: "École en ligne",
          link1: "https://www9.ecoleenligne.be/V01154-3/membres/login.php?action=login&opt=1&id=1&order=desc&language_init=fr&etp=arjulesbara",
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
        type: "pillars",
        data: {
          intro: "Depuis plus de quatre siècles, l'Athénée Royal Jules Bara forme des esprits *curieux, ouverts et autonomes*.",
          pillars: [
            { title: "Apprendre", desc: "Des approches pédagogiques diversifiées et ludiques, du matériel moderne et un suivi personnalisé de chaque élève." },
            { title: "S'ouvrir", desc: "Échanges, projets citoyens, langues et culture : une école tournée vers le monde et la diversité." },
            { title: "S'accomplir", desc: "Développer l'autonomie et la confiance pour que chacun trouve sa voie et révèle son potentiel." },
          ],
        },
      },
      {
        type: "cards",
        data: {
          eyebrow: "Accès rapides",
          title: "Tout ce dont vous avez besoin, *en un clic*",
          lead: "Élèves, parents et enseignants accèdent directement aux ressources essentielles de l'établissement.",
          cards: [
            { icon: "🎓", title: "Nos options", desc: "Grilles horaires du premier au troisième degré, DASPA et 7ᵉ préparatoire.", href: "/filieres", color: "var(--royal)" },
            { icon: "📅", title: "Calendrier", desc: "Dates clés, congés et événements de l'année scolaire en cours.", href: "/calendrier", color: "var(--orange)" },
            { icon: "💻", title: "École numérique", desc: "Google Classroom et l'espace de travail École en ligne.", href: "/applis", color: "var(--teal)" },
            { icon: "🍽️", title: "Restaurant", desc: "Menus de la semaine et informations sur la cantine scolaire.", href: "/restaurant", color: "var(--gold)" },
          ],
        },
      },
      {
        type: "split",
        data: {
          eyebrow: "Une école résolument numérique",
          title: "Des outils modernes au service de la *pédagogie*",
          icon: "💻",
          tags: ["Google Classroom", "Tableaux interactifs", "École en ligne"],
          checks: [
            { title: "Classes connectées", desc: "Matériel moderne et environnements numériques de travail." },
            { title: "Suivi en ligne", desc: "Parents et élèves suivent les résultats et communications via École en ligne." },
            { title: "Accompagnement adapté", desc: "Prise en charge des troubles de l'apprentissage et école des devoirs." },
          ],
        },
      },
      { type: "news", data: { title: "Dernières actualités" } },
      {
        type: "quote",
        data: {
          quote: "Une école n'est pas un lieu où l'on entasse des savoirs, mais où l'on apprend à devenir soi-même.",
          who: "— L'équipe pédagogique, Athénée Royal Jules Bara",
        },
      },
      {
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
  {
    slug: "filieres",
    title: "Options",
    published: true,
    order: 10,
    blocks: [
      {
        type: "banner",
        data: { eyebrow: "Enseignement secondaire · Tournai", title: "Nos *options*", sub: "Un parcours général de transition, du premier au troisième degré, pour préparer chaque élève aux études supérieures dans un cadre exigeant et bienveillant.", color: "#284193" },
      },
      {
        type: "cards",
        data: {
          eyebrow: "Les trois degrés",
          title: "Un parcours *progressif*",
          lead: "De l'entrée en secondaire jusqu'à la rhétorique, chaque degré construit l'autonomie et affine l'orientation de l'élève.",
          cards: [
            { icon: "🧭", title: "Premier degré", desc: "1re & 2e — tronc commun et différencié. Activités complémentaires au choix et dispositif différencié (1D/2D).", href: "#1er-degre", color: "var(--royal)" },
            { icon: "🔬", title: "Deuxième degré", desc: "3e & 4e — transition générale. Sciences, langues modernes, sciences économiques et humaines.", href: "#2e-degre", color: "var(--teal)" },
            { icon: "🎓", title: "Troisième degré", desc: "5e & 6e — transition générale. Approfondissement des options en vue des études supérieures.", href: "#3e-degre", color: "var(--orange)" },
          ],
        },
      },
      { id: "1er-degre", type: "text", data: { title: "Premier degré — 1ʳᵉ & 2ᵉ année", body: "Le premier degré est commun à tous les élèves. Il comprend un tronc commun enrichi d'activités complémentaires au choix (4 périodes). Un dispositif différencié (1D/2D) permet d'adapter le parcours aux besoins de chaque élève." } },
      {
        type: "grid",
        data: {
          title: "Grille horaire — tronc commun 1ᵉʳ & 2ᵉ degré (2026-2027)",
          th1: "Cours", th2: "Périodes / semaine",
          rows: [
            { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" }, { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
            { c: "Français", p: "5" }, { c: "Néerlandais ou Anglais", p: "4" }, { c: "Mathématiques", p: "5" },
            { c: "Histoire", p: "2" }, { c: "Géographie", p: "2" }, { c: "Initiation scientifique", p: "3" },
            { c: "Éducation physique", p: "3" }, { c: "Éducation musicale", p: "1" }, { c: "Éducation plastique", p: "1" },
            { c: "Activités complémentaires au choix", p: "4" }, { c: "TOTAL", p: "32" },
          ],
        },
      },
      { id: "2e-degre", type: "text", data: { title: "Deuxième degré — 3ᵉ & 4ᵉ année", body: "Le deuxième degré propose un enseignement général de transition. Les élèves choisissent une dominante parmi : Classique (Latin), Scientifique, Langues modernes, Sciences économiques." } },
      {
        type: "grid",
        data: {
          title: "2ᵉ degré — Dominante Sciences générales",
          th1: "Cours", th2: "Périodes / semaine",
          rows: [
            { c: "Français", p: "5" }, { c: "Langue 1", p: "4" }, { c: "Langue 2", p: "4" },
            { c: "Mathématiques", p: "5" }, { c: "Sciences", p: "5" }, { c: "Histoire", p: "2" },
            { c: "Géographie", p: "2" }, { c: "Éducation physique", p: "3" }, { c: "TOTAL", p: "35" },
          ],
        },
      },
      { id: "3e-degre", type: "text", data: { title: "Troisième degré — 5ᵉ & 6ᵉ année", body: "Le troisième degré approfondit l'option choisie en 2ᵉ degré. Six options sont disponibles : Latin, Langues modernes, Sciences générales, Histoire (sciences humaines), Sciences économiques, Géographie." } },
      {
        type: "cards",
        data: {
          eyebrow: "Dispositifs spéciaux",
          title: "*DASPA* & 7ᵉ préparatoire",
          lead: "",
          cards: [
            { icon: "🌍", title: "DASPA", desc: "Dispositif d'Accueil et de Scolarisation des élèves Primo-Arrivants : intégration progressive et apprentissage intensif du français.", href: "#daspa", color: "var(--teal)" },
            { icon: "📚", title: "7ᵉ préparatoire", desc: "Année préparatoire à l'enseignement supérieur : renforcement des prérequis en mathématiques, sciences et langues.", href: "#7e-prep", color: "var(--gold)" },
          ],
        },
      },
      { id: "daspa", type: "text", data: { title: "DASPA — Primo-arrivants", body: "Le DASPA accueille les élèves nouvellement arrivés en Belgique qui ne maîtrisent pas encore suffisamment le français. L'objectif est leur intégration optimale dans le système éducatif, avec un accompagnement pédagogique adapté et un apprentissage intensif du français langue étrangère." } },
      { id: "7e-prep", type: "text", data: { title: "7ᵉ préparatoire à l'enseignement supérieur", body: "La 7ᵉ préparatoire est une année après la rhétorique pour consolider les bases avant l'enseignement supérieur, avec un accent fort sur les mathématiques et les sciences." } },
      { type: "cta", data: { title: "Une question sur l'orientation ?", body: "L'équipe pédagogique vous reçoit pour construire le parcours le mieux adapté à votre enfant.", btn: "Préinscription", link: "/preinscription" } },
    ],
  },
  {
    slug: "calendrier",
    title: "Calendrier",
    published: true,
    order: 20,
    blocks: [
      { type: "banner", data: { eyebrow: "Année scolaire 2026-2027", title: "Calendrier *scolaire*", sub: "Congés, vacances et temps forts de l'année, selon le calendrier officiel de la Fédération Wallonie-Bruxelles.", color: "#f57a20" } },
      {
        type: "grid",
        data: {
          title: "Congés & vacances 2026-2027",
          th1: "Période", th2: "Dates",
          rows: [
            { c: "Rentrée scolaire", p: "Lundi 24 août 2026" },
            { c: "Congé d'automne (Toussaint)", p: "Du 19 au 30 octobre 2026" },
            { c: "Vacances d'hiver (Noël)", p: "Du 21 décembre 2026 au 1ᵉʳ janvier 2027" },
            { c: "Congé de détente (Carnaval)", p: "Du 22 février au 5 mars 2027" },
            { c: "Vacances de printemps (Pâques)", p: "Du 26 avril au 7 mai 2027" },
            { c: "Vacances d'été", p: "À partir du 2 juillet 2027" },
          ],
        },
      },
      { type: "cta", data: { title: "Une question sur le calendrier ?", body: "Le secrétariat vous renseigne sur les dates et l'organisation de l'année.", btn: "Nous contacter", link: "/contact" } },
    ],
  },
  {
    slug: "actualites",
    title: "Actualités",
    published: true,
    order: 30,
    blocks: [
      { type: "banner", data: { eyebrow: "Vie de l'école", title: "Toutes les *actualités*", sub: "Événements, projets et informations pratiques de l'Athénée Royal Jules Bara.", color: "#284193" } },
      { type: "newslist", data: { eyebrow: "", title: "", lead: "" } },
      { type: "cta", data: { title: "Une info à partager ?", body: "Un projet, un événement, une réussite ? Faites-le savoir au service communication.", btn: "Nous contacter", link: "/contact" } },
    ],
  },
  {
    slug: "restaurant",
    title: "Restaurant",
    published: true,
    order: 40,
    blocks: [
      { type: "banner", data: { eyebrow: "Vie quotidienne · Restaurant scolaire", title: "Le *restaurant* scolaire", sub: "Des repas chauds, équilibrés et préparés sur place chaque jour, avec une alternative végétarienne quotidienne.", color: "#c79a4b" } },
      { type: "menu", data: { eyebrow: "Menu de la semaine", title: "Au menu *au restaurant*", lead: "Menus indicatifs, susceptibles d'évoluer selon les approvisionnements. Une alternative végétarienne est proposée chaque jour.", note: "Repas commandés et payés en ligne, sans espèces, via le compte de l'élève.", btn: "🍽 Réserver vos repas sur École en ligne", link: "https://www9.ecoleenligne.be/V01154-3/membres/login.php?action=login&opt=1&id=1&order=desc&language_init=fr&etp=arjulesbara" } },
      {
        type: "cards",
        data: {
          eyebrow: "Infos pratiques", title: "Bon à *savoir*", lead: "",
          cards: [
            { icon: "🕛", title: "Horaires", desc: "Service du midi de 11h45 à 13h15, en deux pauses selon les degrés.", href: "#", color: "var(--royal)" },
            { icon: "💳", title: "Tarifs & paiement", desc: "Repas complet à tarif démocratique. Paiement sans espèces via École en ligne.", href: "#", color: "var(--orange)" },
            { icon: "🥗", title: "Alternative & allergènes", desc: "Une alternative végétarienne chaque jour. Fiches allergènes disponibles au secrétariat.", href: "#", color: "var(--teal)" },
          ],
        },
      },
    ],
  },
  {
    slug: "applis",
    title: "Applis",
    published: true,
    order: 45,
    blocks: [
      { type: "banner", data: { eyebrow: "Espaces numériques & outils", title: "Applis *& outils*", sub: "Retrouvez en un endroit les accès aux plateformes de l'école et quelques outils pratiques.", color: "#284193" } },
      {
        type: "cards",
        data: {
          eyebrow: "Accès rapides", title: "Vos espaces *numériques*", lead: "Élèves, parents et enseignants accèdent directement aux plateformes de l'établissement.",
          cards: [
            { icon: "🎓", title: "Google Classroom", desc: "Cours, travaux et communications entre enseignants et élèves.", href: "https://classroom.google.com", color: "var(--royal)" },
            { icon: "💻", title: "École en ligne", desc: "Espace de travail, repas, paiements et activités extrascolaires de l'élève.", href: "https://www9.ecoleenligne.be/V01154-3/membres/login.php?action=login&opt=1&id=1&order=desc&language_init=fr&etp=arjulesbara", color: "var(--teal)" },
            { icon: "💻", title: "École en ligne", desc: "Espace de travail en ligne de l'établissement.", href: "https://www9.ecoleenligne.be/V01154-3/membres/login.php?action=login&opt=1&id=1&order=desc&language_init=fr&etp=arjulesbara", color: "var(--orange)" },
          ],
        },
      },
      { type: "tools", data: {} },
      { type: "cta", data: { title: "Un accès ne fonctionne pas ?", body: "Le secrétariat vous aide à récupérer vos identifiants ou à configurer votre espace numérique.", btn: "Nous contacter", link: "/contact" } },
    ],
  },
  {
    slug: "projet-pedagogique",
    title: "Notre projet",
    published: true,
    order: 50,
    blocks: [
      { type: "hero", data: { pill: "Projet d'établissement", title: "Notre *projet* pédagogique", sub: "Une école bienveillante et exigeante, tournée vers l'autonomie, l'ouverture et la réussite de chaque élève.", btn1: "Préinscription", link1: "/preinscription", btn2: "", link2: "#", color: "#284193", bg: "gradient", effects: true, anim: true } },
      { type: "text", data: { title: "Apprendre, s'ouvrir, s'accomplir", body: "Des approches pédagogiques diversifiées et un suivi personnalisé, une école tournée vers le monde et la diversité, et le développement de l'autonomie pour que chacun trouve sa voie." } },
      { type: "gallery", data: { title: "La vie à Bara" } },
    ],
  },
];

// ──────────────────────── Insert ───────────────────────────────────────────

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Wipe existing pages (cascade deletes blocks)
    await client.query('DELETE FROM "Page"');
    console.log("Cleared existing pages.");

    for (const page of pages) {
      const pageId = cuid();
      await client.query(
        `INSERT INTO "Page" (id, slug, title, published, "order", "updatedAt", "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [pageId, page.slug, page.title, page.published, page.order]
      );

      for (let i = 0; i < page.blocks.length; i++) {
        const block = page.blocks[i];
        const blockId = block.id ?? cuid();
        await client.query(
          `INSERT INTO "Block" (id, "pageId", "order", type, data)
           VALUES ($1, $2, $3, $4, $5)`,
          [blockId, pageId, i, block.type, JSON.stringify(block.data)]
        );
      }

      console.log(`  ✓ ${page.slug} (${page.blocks.length} blocs)`);
    }

    await client.query("COMMIT");
    console.log("\nSeed terminé avec succès.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erreur :", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
