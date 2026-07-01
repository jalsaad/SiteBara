// Couche d'accès aux pages composées par blocs — CÔTÉ SERVEUR UNIQUEMENT.
// Même logique que src/lib/articles.ts : Prisma si DATABASE_URL, sinon
// magasin mémoire de démonstration.

import "server-only";
import fs from "fs";
import path from "path";
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
    order: 0,
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
              href: "/grilles",
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
              desc: "Google Classroom et l'espace de travail École en ligne.",
              href: "/applis",
              color: "var(--teal)",
            },
            {
              icon: "🍽️",
              title: "Menu",
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
  title: "Docs",
  published: true,
  order: 50,
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

// Grilles horaires (/filieres)
seed.push({
  slug: "grilles",
  title: "Grilles",
  published: true,
  order: 10,
  blocks: [
    {
      id: blockId(),
      type: "banner",
      data: {
        eyebrow: "Enseignement secondaire · Tournai",
        title: "Grilles *horaires*",
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
            desc: "1re & 2e — tronc commun et différencié. Activités complémentaires au choix et dispositif différencié (1D/2D).",
            href: "#1er-degre",
            color: "var(--royal)",
          },
          {
            icon: "🔬",
            title: "Deuxième degré",
            desc: "3e & 4e — transition générale. Sciences, langues modernes, sciences économiques et humaines.",
            href: "#2e-degre",
            color: "var(--teal)",
          },
          {
            icon: "🎓",
            title: "Troisième degré",
            desc: "5e & 6e — transition générale. Approfondissement des options en vue des études supérieures.",
            href: "#3e-degre",
            color: "var(--orange)",
          },
        ],
      },
    },
    // ── Premier degré ──────────────────────────────────────────────────
    {
      id: "1er-degre",
      type: "text",
      data: {
        title: "Premier degré — 1ʳᵉ & 2ᵉ année",
        body: "Le premier degré est commun à tous les élèves. Il comprend un tronc commun enrichi d'activités complémentaires au choix (4 périodes). Un dispositif différencié (1D/2D) permet d'adapter le parcours aux besoins de chaque élève.",
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "Grille horaire — tronc commun 1ᵉʳ & 2ᵉ degré (2026-2027)",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" },
          { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
          { c: "Français", p: "5" },
          { c: "Néerlandais ou Anglais", p: "4" },
          { c: "Mathématiques", p: "5" },
          { c: "Histoire", p: "2" },
          { c: "Géographie", p: "2" },
          { c: "Initiation scientifique", p: "3" },
          { c: "Éducation physique", p: "3" },
          { c: "Éducation musicale", p: "1" },
          { c: "Éducation plastique", p: "1" },
          { c: "Activités complémentaires au choix", p: "4" },
          { c: "TOTAL", p: "32" },
        ],
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "2ᵉ année — activités complémentaires au choix (4 périodes)",
        th1: "Activité",
        th2: "Périodes",
        rows: [
          { c: "Latin", p: "4" },
          { c: "Activités de langue", p: "4" },
          { c: "Activités scientifiques", p: "2" },
          { c: "Activités économiques", p: "2" },
          { c: "Activités sportives", p: "2" },
          { c: "Activités informatiques", p: "2" },
          { c: "Activités mathématiques", p: "2" },
          { c: "Français renforcé", p: "2" },
        ],
      },
    },
    // ── Deuxième degré ────────────────────────────────────────────────
    {
      id: "2e-degre",
      type: "text",
      data: {
        title: "Deuxième degré — 3ᵉ & 4ᵉ année",
        body: "Le deuxième degré propose un enseignement général de transition. Les élèves choisissent une dominante parmi : Classique (Latin), Scientifique, Langues modernes, Sciences économiques.",
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "2ᵉ degré — Dominante Classique / Latin",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" },
          { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
          { c: "Français", p: "5" },
          { c: "Langue 1 (Néerlandais ou Anglais)", p: "4" },
          { c: "Mathématiques", p: "5" },
          { c: "Histoire", p: "2" },
          { c: "Géographie", p: "2" },
          { c: "Sciences : Biologie", p: "2" },
          { c: "Sciences : Chimie", p: "1" },
          { c: "Sciences : Physique", p: "2" },
          { c: "Éducation physique", p: "2" },
          { c: "Langue 2", p: "4" },
          { c: "Latin (option)", p: "4" },
          { c: "TOTAL", p: "35" },
        ],
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "2ᵉ degré — Dominante Scientifique",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" },
          { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
          { c: "Français", p: "5" },
          { c: "Langue 1 (Néerlandais ou Anglais)", p: "4" },
          { c: "Mathématiques", p: "5" },
          { c: "Histoire", p: "2" },
          { c: "Géographie", p: "2" },
          { c: "Sciences : Biologie", p: "2" },
          { c: "Sciences : Chimie", p: "2" },
          { c: "Sciences : Physique", p: "2" },
          { c: "Éducation physique", p: "3" },
          { c: "Langue 2", p: "4" },
          { c: "Laboratoire", p: "2" },
          { c: "TOTAL", p: "35" },
        ],
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "2ᵉ degré — Dominante Langues modernes",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" },
          { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
          { c: "Français", p: "5" },
          { c: "Langue 1 (Néerlandais ou Anglais)", p: "4" },
          { c: "Mathématiques", p: "5" },
          { c: "Histoire", p: "2" },
          { c: "Géographie", p: "2" },
          { c: "Sciences : Biologie", p: "1" },
          { c: "Sciences : Chimie", p: "1" },
          { c: "Sciences : Physique", p: "1" },
          { c: "Éducation physique", p: "3" },
          { c: "Langue 2", p: "4" },
          { c: "Renforcement Langue 1", p: "1" },
          { c: "Renforcement Langue 2", p: "1" },
          { c: "TOTAL", p: "32" },
        ],
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "2ᵉ degré — Dominante Sciences économiques",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" },
          { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
          { c: "Français", p: "5" },
          { c: "Langue 1 (Néerlandais ou Anglais)", p: "4" },
          { c: "Mathématiques", p: "5" },
          { c: "Histoire", p: "2" },
          { c: "Géographie", p: "2" },
          { c: "Sciences : Biologie", p: "1" },
          { c: "Sciences : Chimie", p: "1" },
          { c: "Sciences : Physique", p: "1" },
          { c: "Éducation physique", p: "3" },
          { c: "Langue 2", p: "4" },
          { c: "Sciences économiques (option)", p: "4" },
          { c: "TOTAL", p: "34" },
        ],
      },
    },
    // ── Troisième degré ───────────────────────────────────────────────
    {
      id: "3e-degre",
      type: "text",
      data: {
        title: "Troisième degré — 5ᵉ & 6ᵉ année",
        body: "Le troisième degré approfondit l'option choisie en 2ᵉ degré. Six options sont disponibles : Latin, Langues modernes, Sciences générales, Histoire (sciences humaines), Sciences économiques, Géographie.",
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "3ᵉ degré — Option Latin (Humanités classiques)",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" },
          { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
          { c: "Français", p: "5" },
          { c: "Langue 1 (Néerlandais ou Anglais)", p: "4" },
          { c: "Langue 2", p: "4" },
          { c: "Mathématiques", p: "2" },
          { c: "Histoire", p: "2" },
          { c: "Géographie", p: "2" },
          { c: "Sciences : Biologie", p: "1" },
          { c: "Sciences : Chimie", p: "1" },
          { c: "Sciences : Physique", p: "1" },
          { c: "Éducation physique", p: "3" },
          { c: "Activités de physique", p: "1" },
          { c: "Latin (option)", p: "4" },
          { c: "TOTAL", p: "32" },
        ],
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "3ᵉ degré — Option Langues modernes",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" },
          { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
          { c: "Français", p: "5" },
          { c: "Langue 1 (Néerlandais ou Anglais)", p: "4" },
          { c: "Langue 2", p: "4" },
          { c: "Langue 3 (Espagnol ou Allemand)", p: "4" },
          { c: "Mathématiques", p: "2" },
          { c: "Histoire", p: "2" },
          { c: "Géographie", p: "2" },
          { c: "Sciences : Biologie", p: "1" },
          { c: "Sciences : Chimie", p: "1" },
          { c: "Sciences : Physique", p: "1" },
          { c: "Éducation physique", p: "3" },
          { c: "Renforcement Langue 1", p: "1" },
          { c: "Renforcement Langue 2", p: "1" },
          { c: "Renforcement Langue 3", p: "1" },
          { c: "TOTAL", p: "34" },
        ],
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "3ᵉ degré — Option Sciences générales",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" },
          { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
          { c: "Français", p: "5" },
          { c: "Langue 1 (Néerlandais ou Anglais)", p: "4" },
          { c: "Mathématiques", p: "4" },
          { c: "Histoire", p: "2" },
          { c: "Géographie", p: "2" },
          { c: "Sciences : Biologie", p: "2" },
          { c: "Sciences : Chimie", p: "2" },
          { c: "Sciences : Physique", p: "2" },
          { c: "Éducation physique", p: "3" },
          { c: "Laboratoire", p: "2" },
          { c: "Activités de physique", p: "1" },
          { c: "TOTAL", p: "31" },
        ],
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "3ᵉ degré — Option Histoire (Sciences humaines)",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" },
          { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
          { c: "Français", p: "5" },
          { c: "Langue 1 (Néerlandais ou Anglais)", p: "4" },
          { c: "Langue 2", p: "4" },
          { c: "Mathématiques", p: "2" },
          { c: "Histoire", p: "2" },
          { c: "Géographie", p: "2" },
          { c: "Sciences : Biologie", p: "1" },
          { c: "Sciences : Chimie", p: "1" },
          { c: "Sciences : Physique", p: "1" },
          { c: "Éducation physique", p: "3" },
          { c: "Histoire (option)", p: "4" },
          { c: "TOTAL", p: "31" },
        ],
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "3ᵉ degré — Option Sciences économiques",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" },
          { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
          { c: "Français", p: "5" },
          { c: "Langue 1 (Néerlandais ou Anglais)", p: "4" },
          { c: "Langue 2", p: "4" },
          { c: "Mathématiques", p: "6" },
          { c: "Histoire", p: "2" },
          { c: "Géographie", p: "2" },
          { c: "Sciences : Biologie", p: "1" },
          { c: "Sciences : Chimie", p: "1" },
          { c: "Sciences : Physique", p: "1" },
          { c: "Éducation physique", p: "3" },
          { c: "Sciences économiques (option)", p: "4" },
          { c: "TOTAL", p: "35" },
        ],
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "3ᵉ degré — Option Géographie",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" },
          { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
          { c: "Français", p: "5" },
          { c: "Langue 1 (Néerlandais ou Anglais)", p: "4" },
          { c: "Langue 2", p: "4" },
          { c: "Mathématiques", p: "2" },
          { c: "Histoire", p: "2" },
          { c: "Géographie", p: "2" },
          { c: "Sciences : Biologie", p: "1" },
          { c: "Sciences : Chimie", p: "1" },
          { c: "Sciences : Physique", p: "1" },
          { c: "Éducation physique", p: "3" },
          { c: "Géographie (option)", p: "4" },
          { c: "TOTAL", p: "31" },
        ],
      },
    },
    // ── DASPA & 7ᵉ préparatoire ───────────────────────────────────────
    {
      id: blockId(),
      type: "cards",
      data: {
        eyebrow: "Dispositifs spéciaux",
        title: "*DASPA* & 7ᵉ préparatoire",
        lead: "",
        cards: [
          {
            icon: "🌍",
            title: "DASPA",
            desc: "Dispositif d'Accueil et de Scolarisation des élèves Primo-Arrivants : intégration progressive et apprentissage intensif du français.",
            href: "#daspa",
            color: "var(--teal)",
          },
          {
            icon: "📚",
            title: "7ᵉ préparatoire",
            desc: "Année préparatoire à l'enseignement supérieur : renforcement des prérequis en mathématiques, sciences et langues.",
            href: "#7e-prep",
            color: "var(--gold)",
          },
        ],
      },
    },
    {
      id: "daspa",
      type: "text",
      data: {
        title: "DASPA — Primo-arrivants (classes passerelles)",
        body: "Le DASPA accueille les élèves nouvellement arrivés en Belgique qui ne maîtrisent pas encore suffisamment le français. L'objectif est leur intégration optimale dans le système éducatif, avec un accompagnement pédagogique adapté et un apprentissage intensif du français langue étrangère.",
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "DASPA — Grille horaire (2026-2027)",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Religion / Morale / Éducation à la citoyenneté", p: "1" },
          { c: "Éducation à la philosophie et à la citoyenneté", p: "1" },
          { c: "Français", p: "7" },
          { c: "Français langue étrangère (FLE)", p: "8" },
          { c: "Langue 1", p: "2" },
          { c: "Sciences", p: "2" },
          { c: "Mathématiques", p: "6" },
          { c: "Histoire", p: "1" },
          { c: "Géographie", p: "1" },
          { c: "Éducation physique", p: "2" },
          { c: "TOTAL", p: "31" },
        ],
      },
    },
    {
      id: "7e-prep",
      type: "text",
      data: {
        title: "7ᵉ préparatoire à l'enseignement supérieur",
        body: "La 7ᵉ préparatoire est une année après la rhétorique pour consolider les bases avant l'enseignement supérieur, avec un accent fort sur les mathématiques et les sciences.",
      },
    },
    {
      id: blockId(),
      type: "grid",
      data: {
        title: "7ᵉ préparatoire — Grille horaire (2026-2027)",
        th1: "Cours",
        th2: "Périodes / semaine",
        rows: [
          { c: "Physique", p: "6" },
          { c: "Chimie", p: "4" },
          { c: "Biologie", p: "3" },
          { c: "Mathématiques", p: "14" },
          { c: "Informatique", p: "2" },
          { c: "Anglais", p: "2" },
          { c: "TOTAL", p: "31" },
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
  order: 20,
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
  order: 30,
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

// Menu (/restaurant) — menu automatique géré dans /admin/menu.
seed.push({
  slug: "restaurant",
  title: "Menu",
  published: true,
  order: 40,
  blocks: [
    {
      id: blockId(),
      type: "banner",
      data: {
        eyebrow: "Vie quotidienne · Menu scolaire",
        title: "Le *menu* scolaire",
        sub: "Des repas chauds, équilibrés et préparés sur place chaque jour.",
        color: "#c79a4b",
      },
    },
    {
      id: blockId(),
      type: "menu",
      data: {
        eyebrow: "Menu de la semaine",
        title: "Au *menu* cette semaine",
        lead: "Menus indicatifs, susceptibles d'évoluer selon les approvisionnements.",
        note: "Repas commandés et payés en ligne, sans espèces, via le compte de l'élève.",
        btn: "🍽 Réserver vos repas sur École en ligne",
        link: "https://www9.ecoleenligne.be/V01154-3/membres/login.php?action=login&opt=1&id=1&order=desc&language_init=fr&etp=arjulesbara",
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
            desc: "Service du midi de 11h45 à 13h15, en deux pauses selon les degrés. Fermé le mercredi.",
            href: "#",
            color: "var(--royal)",
          },
          {
            icon: "💳",
            title: "Tarifs & paiement",
            desc: "Repas complet (potage + plat + dessert) à tarif démocratique. Paiement sans espèces via le compte École en ligne de l'élève.",
            href: "#",
            color: "var(--orange)",
          },
          {
            icon: "🧾",
            title: "Allergènes",
            desc: "Les fiches allergènes sont affichées au self et disponibles au secrétariat.",
            href: "#",
            color: "var(--teal)",
          },
        ],
      },
    },
  ],
});

// Applis & outils (/applis) — en-tête et accès éditables ; la section « Outils
// pratiques » (QR code, images→PDF) est un bloc VERROUILLÉ non éditable.
seed.push({
  slug: "applis",
  title: "Applis",
  published: true,
  order: 45,
  blocks: [
    {
      id: blockId(),
      type: "banner",
      data: {
        eyebrow: "Espaces numériques & outils",
        title: "Applis *& outils*",
        sub: "Retrouvez en un endroit les accès aux plateformes de l'école et quelques outils pratiques, directement utilisables depuis votre navigateur.",
        color: "#284193",
      },
    },
    {
      id: blockId(),
      type: "cards",
      data: {
        eyebrow: "Accès rapides",
        title: "Vos espaces *numériques*",
        lead: "Élèves, parents et enseignants accèdent directement aux plateformes de l'établissement.",
        cards: [
          {
            icon: "🎓",
            title: "Google Classroom",
            desc: "Cours, travaux et communications entre enseignants et élèves.",
            href: "https://classroom.google.com",
            color: "var(--royal)",
          },
          {
            icon: "💻",
            title: "École en ligne",
            desc: "Espace de travail, repas, paiements et activités extrascolaires de l'élève.",
            href: "https://www9.ecoleenligne.be/V01154-3/membres/login.php?action=login&opt=1&id=1&order=desc&language_init=fr&etp=arjulesbara",
            color: "var(--teal)",
          },
        ],
      },
    },
    {
      id: blockId(),
      type: "cards",
      data: {
        eyebrow: "Suite Google",
        title: "Créer, rédiger, *calculer*",
        lead: "Les outils Google intégrés à votre compte scolaire @atheneejulesbara.be.",
        cards: [
          { icon: "📝", title: "Google Docs", desc: "Traitement de texte collaboratif en temps réel.", href: "https://docs.google.com", color: "var(--royal)" },
          { icon: "📊", title: "Google Sheets", desc: "Tableur et graphiques en ligne, partageable instantanément.", href: "https://sheets.google.com", color: "var(--teal)" },
          { icon: "🎞️", title: "Google Slides", desc: "Présentations collaboratives accessibles depuis n'importe quel appareil.", href: "https://slides.google.com", color: "var(--orange)" },
          { icon: "🧪", title: "Google Colab", desc: "Notebooks Python interactifs dans le navigateur — idéal pour les sciences et la data.", href: "https://colab.research.google.com", color: "var(--gold)" },
        ],
      },
    },
    {
      id: blockId(),
      type: "cards",
      data: {
        eyebrow: "Création & design",
        title: "Concevoir, *illustrer*, communiquer",
        lead: "Des outils accessibles sans installation pour créer des visuels et des supports de communication.",
        cards: [
          { icon: "🎨", title: "Canva", desc: "Création de visuels, affiches, infographies et présentations avec des centaines de modèles.", href: "https://www.canva.com", color: "var(--royal)" },
          { icon: "🖼️", title: "Pixlr", desc: "Retouche photo et montage graphique en ligne, alternative gratuite à Photoshop.", href: "https://pixlr.com", color: "var(--teal)" },
        ],
      },
    },
    {
      id: blockId(),
      type: "cards",
      data: {
        eyebrow: "Coding & logique",
        title: "Apprendre à *programmer*, pas à pas",
        lead: "Des plateformes ludiques pour initier élèves et enseignants à la pensée computationnelle.",
        cards: [
          { icon: "🐱", title: "Scratch", desc: "Programmation par blocs pour créer des animations, jeux et histoires interactives.", href: "https://scratch.mit.edu", color: "var(--royal)" },
          { icon: "💡", title: "Code.org", desc: "Cours et défis de programmation gratuits, du primaire au secondaire.", href: "https://code.org", color: "var(--orange)" },
          { icon: "🧩", title: "Blockly.games", desc: "Jeux éducatifs de Google pour apprendre la logique de programmation pas à pas.", href: "https://blockly.games", color: "var(--teal)" },
        ],
      },
    },
    { id: blockId(), type: "tools", data: {} },
    {
      id: blockId(),
      type: "cards",
      data: {
        eyebrow: "Apprentissage",
        title: "Réviser, *explorer*, progresser",
        lead: "Des ressources éducatives gratuites et complémentaires aux cours.",
        cards: [
          { icon: "📐", title: "GeoGebra", desc: "Géométrie, algèbre et graphiques interactifs — incontournable en math au secondaire belge.", href: "https://www.geogebra.org", color: "var(--royal)" },
          { icon: "🎓", title: "Khan Academy", desc: "Des milliers de cours vidéo gratuits en français : maths, sciences, histoire, économie…", href: "https://fr.khanacademy.org", color: "var(--orange)" },
          { icon: "⚗️", title: "PhET Simulations", desc: "Simulations interactives en physique, chimie et biologie — idéal pour visualiser les concepts.", href: "https://phet.colorado.edu/fr", color: "var(--teal)" },
          { icon: "🃏", title: "Quizlet", desc: "Fiches de révision, jeux de mémorisation et tests — créez ou réutilisez des sets existants.", href: "https://quizlet.com", color: "var(--gold)" },
        ],
      },
    },
    {
      id: blockId(),
      type: "cta",
      data: {
        title: "Un accès ne fonctionne pas ?",
        body: "Le secrétariat vous aide à récupérer vos identifiants ou à configurer votre espace numérique.",
        btn: "Nous contacter",
        link: "/contact",
      },
    },
  ],
});

// Persistance JSON sur disque (mode sans base de données).
// Sauvegarde dans data/pages.json — persiste entre les redémarrages du serveur.
const DATA_FILE = path.join(process.cwd(), "data", "pages.json");

function saveStore(store: PageData[]): void {
  // Écriture asynchrone pour ne pas bloquer le thread Node.js (filesystem réseau).
  const data = JSON.stringify(store, null, 2);
  fs.promises
    .mkdir(path.dirname(DATA_FILE), { recursive: true })
    .then(() => fs.promises.writeFile(DATA_FILE, data, "utf8"))
    .catch((e) => console.error("[pages] Impossible de sauvegarder pages.json :", e));
}

const g = globalThis as unknown as { __baraPages?: PageData[] };
function memStore(): PageData[] {
  if (!g.__baraPages) {
    // Lecture unique au démarrage (synchrone, une seule fois grâce au cache globalThis)
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      g.__baraPages = JSON.parse(raw);
    } catch {
      // Fichier absent ou corrompu → on repart du seed et on le persiste
      g.__baraPages = structuredClone(seed);
      saveStore(g.__baraPages);
    }
  }
  return g.__baraPages!;
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
      order: page.order,
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
  { slug: string; title: string; published: boolean; order: number }[]
> {
  if (useDb) {
    const db = await prisma();
    const pages = await db.page.findMany({
      select: { slug: true, title: true, published: true, order: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return pages;
  }
  return memStore()
    .map(({ slug, title, published, order }) => ({ slug, title, published, order }))
    .sort((a, b) => a.order - b.order);
}

// Prochaine valeur d'ordre (place la nouvelle page en fin de menu).
async function nextOrder(): Promise<number> {
  if (useDb) {
    const db = await prisma();
    const top = await db.page.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    return (top?.order ?? 0) + 10;
  }
  const store = memStore();
  return store.reduce((m, p) => Math.max(m, p.order), 0) + 10;
}

export async function createPage(
  slug: string,
  title: string
): Promise<PageData | null> {
  const order = await nextOrder();
  if (useDb) {
    const db = await prisma();
    const exists = await db.page.findUnique({ where: { slug } });
    if (exists) return null;
    await db.page.create({ data: { slug, title, published: false, order } });
    return (await getPage(slug))!;
  }
  const store = memStore();
  if (store.some((p) => p.slug === slug)) return null;
  const page: PageData = { slug, title, published: false, order, blocks: [] };
  store.push(page);
  saveStore(store);
  return page;
}

// Réordonne les pages selon la liste de slugs fournie (ordre du menu).
export async function reorderPages(slugs: string[]): Promise<void> {
  if (useDb) {
    const db = await prisma();
    await Promise.all(
      slugs.map((slug, i) =>
        db.page.update({ where: { slug }, data: { order: i * 10 } }).catch(() => null)
      )
    );
    return;
  }
  const store = memStore();
  slugs.forEach((slug, i) => {
    const p = store.find((x) => x.slug === slug);
    if (p) p.order = i * 10;
  });
  saveStore(store);
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
  saveStore(store);
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
        order: await nextOrder(),
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
    page = {
      slug,
      title: input.title ?? slug,
      published: false,
      order: await nextOrder(),
      blocks: [],
    };
    store.push(page);
  }
  if (input.title) page.title = input.title;
  if (input.publish !== undefined) page.published = input.publish;
  page.blocks = structuredClone(input.blocks);
  saveStore(store);
  return page;
}
