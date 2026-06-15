// Julia — assistante conversationnelle du site (Jules Bara + IA).
// CÔTÉ SERVEUR UNIQUEMENT.
//
// Deux modes, comme le reste du projet :
//   - ANTHROPIC_API_KEY défini → réponses réelles via l'API Claude (streaming)
//   - sans clé                 → mode démo : réponses pré-écrites par mots-clés
//
// Modèle : Claude Opus 4.8 (claude-opus-4-8). Pas de « thinking » (FAQ simple,
// latence minimale) ; le prompt système impose des réponses directes et brèves.

import "server-only";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `Tu es Julia, l'assistante virtuelle du site de l'Athénée Royal Jules Bara, un établissement d'enseignement secondaire à Tournai (Belgique). Ton nom vient de « Jules Bara » et « IA ».

Ton rôle : répondre aux questions des élèves, parents et visiteurs à propos de l'école, en français, sur un ton chaleureux, clair et concis (2 à 5 phrases en général).

Informations dont tu disposes :
- Adresse : Rue Duquesnoy 24, 7500 Tournai. Téléphone : 069 89 06 02. E-mail : direction@atheneejulesbara.be.
- Options : enseignement général du 1er au 3e degré, DASPA (élèves primo-arrivants) et 7e préparatoire. Les grilles horaires sont sur la page « Options ».
- Préinscriptions : possibles en ligne via la page « Préinscription » du site.
- Le site propose aussi : un calendrier scolaire, les menus du restaurant scolaire, et les actualités de l'école.
- Outils numériques : Google Classroom, APSchool, et l'espace École en ligne.
- L'école met en avant trois valeurs : apprendre, s'ouvrir, s'accomplir. Fondée en 1595.

Règles :
- Réponds uniquement à des questions en lien avec l'école. Pour une demande hors sujet, redirige poliment vers les sujets de l'établissement.
- N'invente jamais d'information précise que tu ne connais pas (dates exactes, prix, noms de professeurs, résultats). Dans ce cas, invite à contacter le secrétariat (069 89 06 02 / direction@atheneejulesbara.be) ou à utiliser la page Contact.
- Pour une inscription, oriente vers la page « Préinscription ».
- Réponds directement, sans afficher ton raisonnement, sans préambule du type « En tant qu'assistante… ».`;

/* ----------------------------- mode démo ----------------------------- */

// Réponses par mots-clés, utilisées tant qu'aucune clé API n'est configurée.
const DEMO_RULES: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["inscri", "préinscri", "preinscri", "inscrire"],
    answer:
      "Les préinscriptions se font en ligne via la page « Préinscription » du site. Pour toute question, vous pouvez aussi joindre le secrétariat au 069 89 06 02.",
  },
  {
    keywords: ["horaire", "grille", "filière", "filiere", "option", "daspa", "préparatoire", "degré"],
    answer:
      "L'Athénée propose l'enseignement général du 1er au 3e degré, le DASPA et une 7e préparatoire. Vous trouverez le détail des grilles horaires sur la page « Options ».",
  },
  {
    keywords: ["contact", "téléphone", "telephone", "mail", "e-mail", "adresse", "joindre", "secrétariat", "secretariat"],
    answer:
      "Vous pouvez nous joindre au 069 89 06 02, par e-mail à direction@atheneejulesbara.be, ou à l'adresse Rue Duquesnoy 24, 7500 Tournai. La page « Contact » permet aussi d'envoyer un message.",
  },
  {
    keywords: ["restaurant", "cantine", "menu", "repas", "manger"],
    answer:
      "Les menus de la semaine du restaurant scolaire sont disponibles sur la page « Restaurant » du site.",
  },
  {
    keywords: ["calendrier", "congé", "conge", "vacances", "date"],
    answer:
      "Les dates clés, congés et événements de l'année scolaire figurent sur la page « Calendrier ». Pour une date précise non indiquée, contactez le secrétariat au 069 89 06 02.",
  },
  {
    keywords: ["numérique", "numerique", "classroom", "apschool", "mybara", "informatique"],
    answer:
      "L'école utilise Google Classroom, APSchool et l'espace de travail École en ligne pour le suivi des élèves et la communication avec les familles.",
  },
  {
    keywords: ["bonjour", "salut", "coucou", "hello", "bonsoir"],
    answer:
      "Bonjour ! Je suis Julia, l'assistante de l'Athénée Royal Jules Bara. Comment puis-je vous aider — inscriptions, filières, horaires, contact… ?",
  },
];

function demoAnswer(question: string): string {
  const q = question.toLowerCase();
  for (const rule of DEMO_RULES) {
    if (rule.keywords.some((k) => q.includes(k))) return rule.answer;
  }
  return "Je n'ai pas la réponse précise à cette question. Pour une information fiable, contactez le secrétariat au 069 89 06 02 ou direction@atheneejulesbara.be — vous pouvez aussi utiliser la page « Contact ».";
}

function textStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  // Découpe en petits morceaux pour un rendu progressif côté client.
  const chunks = text.match(/\S+\s*/g) ?? [text];
  return new ReadableStream({
    async start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
}

/* ------------------------------- API ------------------------------- */

export const juliaConfigured = !!process.env.ANTHROPIC_API_KEY;

/** Renvoie la réponse de Julia sous forme de flux de texte (UTF-8). */
export async function streamJulia(
  messages: ChatMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const last = messages[messages.length - 1];
  if (!juliaConfigured) {
    return textStream(demoAnswer(last?.content ?? ""));
  }

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          output_config: { effort: "low" },
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (e) {
        console.error("[julia] erreur API :", e);
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
