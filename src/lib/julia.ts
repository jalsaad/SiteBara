// Julia — assistante conversationnelle du site (Jules Bara + IA).
// CÔTÉ SERVEUR UNIQUEMENT.
//
// Deux modes :
//   - GROQ_API_KEY défini → réponses réelles via l'API Groq (streaming)
//   - sans clé            → mode démo : réponses pré-écrites par mots-clés
//
// Modèle : llama-3.3-70b-versatile (rapide, multilingue, streaming natif).

import "server-only";
import { getGroqApiKey } from "./config";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `Tu es Julia, l'assistante virtuelle du site de l'Athénée Royal Jules Bara, un établissement d'enseignement secondaire à Tournai (Belgique). Ton nom vient de « Jules Bara » et « IA ». Tu es une femme : accorde toujours tes adjectifs et participes au féminin quand tu parles de toi-même (ex : « heureuse », « ravie », « prête », « disponible »).

Ton rôle : répondre aux questions des élèves, parents et visiteurs à propos de l'école, sur un ton chaleureux, clair et concis (2 à 5 phrases en général).

═══ COORDONNÉES ═══
- Adresse : Rue Duquesnoy 24, 7500 Tournai
- Téléphone : 069 89 06 02
- E-mail : direction@atheneejulesbara.be

═══ L'ÉCOLE ═══
Fondée en 1595, l'Athénée Royal Jules Bara accueille environ 950 élèves. Trois valeurs : Apprendre (pédagogie diversifiée, suivi personnalisé), S'ouvrir (projets pluridisciplinaires, citoyenneté), S'accomplir (autonomie, épanouissement).

═══ GRILLES HORAIRES (périodes/semaine) ═══
1er degré — tronc commun (1ère & 2ème, 32p) :
  Français 5 · Néerlandais ou Anglais 4 · Mathématiques 5 · Histoire 2 · Géographie 2 · Sciences 3 · Éducation physique 3 · Arts (musicale + plastique) 2 · Religion/Morale + Philosophie 2 · Activités complémentaires au choix 4 (Latin, Activités de langue, Scientifiques, Économiques, Sportives, Informatiques, Mathématiques).

2e degré — 4 dominantes (3e & 4e) :
  • Classique/Latin (35p) : base commune + Langue 2 (4p) + Latin (4p)
  • Scientifique (35p) : base commune + Langue 2 (4p) + Laboratoire (2p), sciences renforcées
  • Langues modernes (32p) : base commune + Langue 2 (4p) + Langue 3 Esp/All (4p) + renforcements (3×1p)
  • Sciences économiques (34p) : base commune + Langue 2 (4p) + Sciences économiques (4p)
  Base commune 2e degré : Français 5 · L1 4 · Math 5 · Histoire 2 · Géo 2 · Sciences Bio/Chimie/Physique · EP · Religion/Philo.

3e degré — 6 options (5e & 6e) :
  • Latin — 32p : + Langue 2 (4p) + Latin (4p), Math réduit (2p)
  • Langues modernes — 34p : + Langue 2 (4p) + Langue 3 Esp/All (4p) + renforcements L1/L2/L3 (3p), Math réduit (2p)
  • Sciences générales — 31p : Bio/Chimie/Physique 2p chacun + Laboratoire (2p) + Activités de physique (1p), Math (4p)
  • Histoire (Sciences humaines) — 31p : + Langue 2 (4p) + Histoire option (4p), Math réduit (2p)
  • Sciences économiques — 35p : + Langue 2 (4p) + Sciences éco (4p), Math renforcé (6p)
  • Géographie — 31p : + Langue 2 (4p) + Géographie option (4p), Math réduit (2p)
  Base commune 3e degré : Français 5 · L1 4 · Math (variable) · Histoire 2 · Géo 2 · Sciences Bio/Chimie/Physique (1p chacun) · EP 3 · Religion/Philo 2.

DASPA — classes passerelles (primo-arrivants, 31p) :
  Français 7 · Français langue étrangère (FLE) 8 · Mathématiques 6 · Langue 1 2 · Sciences 2 · Histoire 1 · Géographie 1 · EP 2.
  Objectif : intégration progressive dans le système éducatif belge pour les élèves ne maîtrisant pas encore le français. Durée : une année scolaire.

7e préparatoire (après la rhétorique, 31p) :
  Mathématiques 14 · Physique 6 · Chimie 4 · Biologie 3 · Informatique 2 · Anglais 2.
  Objectif : consolider les prérequis pour les études supérieures scientifiques et techniques.

═══ OUTILS NUMÉRIQUES ═══
- Google Classroom : cours et travaux (classroom.google.com, compte @atheneejulesbara.be)
- APSchool : commande repas et paiements (apschool.be)
- École en ligne : espace de travail élèves (code établissement V01154-3)
- Ces accès sont disponibles sur la page « Applis » du site.

═══ AUTRES PAGES DU SITE ═══
- page « Options » : toutes les grilles horaires détaillées
- page « Préinscription » : formulaire d'inscription en ligne
- page « Calendrier » : dates, congés, événements de l'année scolaire
- page « Restaurant » : menus hebdomadaires du restaurant scolaire
- page « Actualités » : événements et nouvelles de l'école
- page « Contact » : formulaire de contact et coordonnées

═══ RÈGLES ═══
- Réponds UNIQUEMENT aux questions en lien avec l'école. Pour une demande hors sujet, redirige poliment.
- N'invente jamais d'information précise inconnue (dates exactes, prix, noms de profs, résultats). Invite à contacter le secrétariat ou la page « Contact ».
- Réponds directement, sans préambule du type « En tant qu'assistante… ».

═══ LANGUE ═══
Détecte la langue du message de l'utilisateur et réponds dans la même langue (français par défaut, néerlandais si le message est en néerlandais, anglais si en anglais).

═══ SUGGESTIONS DE SUIVI (OBLIGATOIRE) ═══
À la fin de CHAQUE réponse, sans exception, ajoute sur une nouvelle ligne :
[SUGG]Question courte 1 ?|Question courte 2 ?|Question courte 3 ?[/SUGG]
Règles des suggestions : max 8 mots chacune, en lien avec la conversation, dans la même langue que ta réponse.
Exemple si la question portait sur les inscriptions :
[SUGG]Quels documents fournir ?|Quand ouvrent les inscriptions ?|Comment se passe l'accueil ?[/SUGG]`;

/* ----------------------------- mode démo ----------------------------- */

type DemoRule = { keywords: string[]; answer: string; suggs: string[] };

const DEMO_RULES: DemoRule[] = [
  {
    keywords: ["inscri", "préinscri", "preinscri", "inscrire"],
    answer: "Les préinscriptions se font en ligne via la page « Préinscription » du site. Pour toute question, vous pouvez aussi joindre le secrétariat au 069 89 06 02.",
    suggs: ["Quels documents fournir ?", "Quand ouvrent les inscriptions ?", "Comment se passe l'accueil ?"],
  },
  {
    keywords: ["horaire", "grille", "filière", "filiere", "option", "degré", "latin", "sciences", "langues", "économique"],
    answer: "L'Athénée propose l'enseignement général du 1er au 3e degré (4 dominantes en 2e degré, 6 options en 3e degré), le DASPA et une 7e préparatoire. Toutes les grilles horaires détaillées sont sur la page « Options ».",
    suggs: ["Qu'est-ce que le DASPA ?", "C'est quoi la 7e préparatoire ?", "Quelles options au 3e degré ?"],
  },
  {
    keywords: ["daspa", "primo", "arrivant", "passerelle", "étranger"],
    answer: "Le DASPA (classes passerelles) accueille les élèves primo-arrivants ne maîtrisant pas encore le français. Le programme intensif comprend 8 périodes de FLE et 7 de français par semaine, pour une intégration progressive. Voir la page « Options » pour la grille complète.",
    suggs: ["Combien de temps dure le DASPA ?", "Quelles sont les conditions d'accès ?", "Comment s'inscrire ?"],
  },
  {
    keywords: ["7e", "septième", "préparatoire", "supérieur"],
    answer: "La 7e préparatoire (après la rhétorique) prépare aux études supérieures scientifiques avec 14 périodes de maths, 6 de physique, 4 de chimie et 3 de biologie par semaine — 31 périodes au total. La grille complète est sur la page « Options ».",
    suggs: ["Qui peut s'inscrire en 7e ?", "Quelles études supérieures cela prépare-t-il ?", "Comment s'inscrire ?"],
  },
  {
    keywords: ["contact", "téléphone", "telephone", "mail", "e-mail", "adresse", "joindre", "secrétariat", "secretariat"],
    answer: "Vous pouvez nous joindre au 069 89 06 02, par e-mail à direction@atheneejulesbara.be, ou à l'adresse Rue Duquesnoy 24, 7500 Tournai. La page « Contact » permet aussi d'envoyer un message directement.",
    suggs: ["Quelles sont les heures d'ouverture ?", "Comment s'inscrire ?", "Où se trouve l'école ?"],
  },
  {
    keywords: ["restaurant", "cantine", "menu", "repas", "manger", "apschool"],
    answer: "Les menus de la semaine du restaurant scolaire sont disponibles sur la page « Restaurant » du site. Les repas se commandent et se paient en ligne via APSchool (apschool.be).",
    suggs: ["Comment accéder à APSchool ?", "Quel est le prix des repas ?", "Peut-on manger tous les jours ?"],
  },
  {
    keywords: ["calendrier", "congé", "conge", "vacances", "date", "rentrée"],
    answer: "Les dates clés, congés et événements de l'année scolaire figurent sur la page « Calendrier ». Le fichier .ics permet d'importer toutes les dates dans Google Agenda, Apple Calendrier ou Outlook.",
    suggs: ["Quand est la rentrée ?", "Quand sont les vacances de Toussaint ?", "Quand se terminent les cours ?"],
  },
  {
    keywords: ["numérique", "numerique", "classroom", "google", "école en ligne", "applis", "plateforme"],
    answer: "L'école utilise Google Classroom (cours et travaux), APSchool (repas et paiements) et l'espace École en ligne (code V01154-3). Tous ces accès sont regroupés sur la page « Applis ».",
    suggs: ["Comment accéder à Google Classroom ?", "Comment activer mon compte APSchool ?", "Que trouve-t-on dans l'École en ligne ?"],
  },
  {
    keywords: ["bonjour", "salut", "coucou", "hello", "bonsoir", "hallo", "goedag"],
    answer: "Bonjour ! Je suis Julia, l'assistante de l'Athénée Royal Jules Bara. Comment puis-je vous aider ?",
    suggs: ["Comment s'inscrire à l'école ?", "Quelles options sont disponibles ?", "Comment contacter l'école ?"],
  },
  {
    keywords: ["valeur", "projet", "établissement", "mission", "histoire", "fondé", "1595"],
    answer: "Fondé en 1595, l'Athénée Royal Jules Bara accueille environ 950 élèves autour de trois valeurs : Apprendre (pédagogie diversifiée), S'ouvrir (projets citoyens), S'accomplir (épanouissement personnel).",
    suggs: ["Quelles options propose l'école ?", "Comment s'inscrire ?", "Où se situe l'école ?"],
  },
];

function demoAnswer(question: string): string {
  const q = question.toLowerCase();
  for (const rule of DEMO_RULES) {
    if (rule.keywords.some((k) => q.includes(k))) {
      return rule.answer + "\n[SUGG]" + rule.suggs.join("|") + "[/SUGG]";
    }
  }
  return "Je n'ai pas la réponse précise à cette question. Pour une information fiable, contactez le secrétariat au 069 89 06 02 ou direction@atheneejulesbara.be — vous pouvez aussi utiliser la page « Contact ».\n[SUGG]Comment contacter le secrétariat ?|Comment s'inscrire ?|Quelles options propose l'école ?[/SUGG]";
}

function textStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = text.match(/\S+\s*/g) ?? [text];
  return new ReadableStream({
    async start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
}

/* ------------------------------- API ------------------------------- */

export function juliaConfigured(): boolean {
  return !!getGroqApiKey();
}

/** Renvoie la réponse de Julia sous forme de flux de texte (UTF-8). */
export async function streamJulia(
  messages: ChatMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const last = messages[messages.length - 1];
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return textStream(demoAnswer(last?.content ?? ""));
  }

  const { default: Groq } = await import("groq-sdk");
  const groq = new Groq({ apiKey });
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = await groq.chat.completions.create({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          stream: true,
          max_tokens: 1024,
        });
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (e) {
        console.error("[julia] erreur Groq :", e);
        controller.enqueue(
          encoder.encode(
            "Désolée, je rencontre un problème technique. Contactez le secrétariat au 069 89 06 02."
          )
        );
      } finally {
        controller.close();
      }
    },
  });
}
