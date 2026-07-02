// Jules — assistant conversationnel du site (Jules Bara + IA).
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

const SYSTEM_PROMPT = `Tu es Jules, l'assistant virtuel du site de l'Athénée Royal Jules Bara, un établissement d'enseignement secondaire à Tournai (Belgique). Ton nom vient de « Jules Bara ». Tu es un homme : accorde toujours tes adjectifs et participes au masculin quand tu parles de toi-même (ex : « heureux », « ravi », « prêt », « disponible »).

Ton rôle : répondre aux questions des élèves, parents et visiteurs à propos de l'école, sur un ton chaleureux, clair et concis (2 à 5 phrases en général).

═══ COORDONNÉES ═══
- Adresse : Rue Duquesnoy 24, 7500 Tournai
- Téléphone général : 069 89 06 02
- E-mail direction : direction@atheneejulesbara.be

═══ PERSONNES RÉFÉRENTES ═══
DIRECTION
  - Leandro Anzaldi (Directeur) — Tél. 069/89.06.00 — direction@atheneejulesbara.be

DIRECTION ADJOINTE
  - Albano D'Arcangelo — Tél. 069/89.06.08 — directionadjointe@atheneejulesbara.be

SECRÉTARIAT DE DIRECTION
  - Yasmina Bouvry — Tél. 069/89.06.02 — Bouvry.y@atheneejulesbara.be

SECRÉTARIAT ÉLÈVES
  - Dorothée Lecomte — Tél. 069/89.06.03 — Lecomte.d@atheneejulesbara.be

COMPTABILITÉ
  - Isabelle Debray — Tél. 069/89.06.04 — Debray.i@atheneejulesbara.be
  - Alexandra Daminet (Assistante comptable) — Tél. 069/89.06.09 — Daminet.a@atheneejulesbara.be

═══ L'ÉCOLE ═══
Fondée en 1595, l'Athénée Royal Jules Bara accueille environ 950 élèves. Trois valeurs : Apprendre (pédagogie diversifiée, suivi personnalisé), S'ouvrir (projets pluridisciplinaires, citoyenneté), S'accomplir (autonomie, épanouissement).
Projet d'établissement : « Conduire chacun vers sa propre Excellence ».

═══ JULES BARA — L'HOMME ═══
Jules Bara est né à Tournai le 23 août 1835. Après des études secondaires à l'Athénée, il obtient un doctorat en droit à l'ULB en 1857, puis le titre de docteur agrégé en 1859 (thèse sur les rapports de l'État et des religions). Il devient professeur à l'ULB et avocat au barreau de Bruxelles. Élu député en 1862 à 27 ans, il le reste jusqu'en 1894, puis devient sénateur. Il fut deux fois ministre de la Justice (1865-1870 et 1878-1884) et reçut le titre de ministre d'État de Léopold II en 1884. Il décède en 1900.
Ses combats principaux : indépendance de l'État vis-à-vis de l'Église, défense de l'école laïque, abolition de l'article 1781 du Code civil (jugé humiliant pour les ouvriers). Il s'opposa au suffrage universel, ce qui lui coûta son siège de député en 1894.
En 1979, le ministre de l'Éducation demanda aux écoles de choisir le nom d'une personnalité. Le professeur Polomé proposa Jules Bara (ancien élève) et Louis Gallait (peintre) : Jules Bara fut choisi. L'établissement porte donc son nom depuis 1980.

═══ HISTORIQUE DE L'ÉTABLISSEMENT ═══
- 1595 : Fondation du Collegium Tornacense par les Jésuites, à la demande de la ville de Tournai. Bâtiments rue des Allemands, puis rue du Quesnoy (7 bâtiments construits entre 1609 et 1644).
- 1775 : Dissolution de l'ordre jésuite par bulle papale ; les bâtiments sont vendus puis saisis à la Révolution française.
- 1795 : Annexion à la France → « Collège National », relancé par deux professeurs (abbés Bouly et Moch).
- 1817 : Titre d'« Athénée », réservé aux meilleures écoles secondaires belges.
- 1830 : Indépendance belge ; accent sur les langues modernes et les sciences commerciales.
- 1923 : Ouverture aux jeunes filles.
- 1924 : Enseignement moral indépendant.
- Seconde Guerre mondiale : perturbations temporaires, dommages superficiels aux bâtiments.
- 1979-1980 : Adoption du nom « Athénée Royal Jules Bara ».
- 1995 : Célébration du 400e anniversaire.

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

═══ SERVICES & VIE SCOLAIRE ═══

ÉCOLE DES DEVOIRS
Structure d'accueil pour les élèves de 6 à 18 ans, en dehors des heures scolaires. Mission sociale, culturelle et éducative : accompagner les élèves dans leurs devoirs et leur développement citoyen. Renseignements : 069 89 06 02.

ÉCOLE NUMÉRIQUE
L'Athénée participe au programme « École numérique » (2011, gouvernements wallon et FWB) visant à intégrer les TIC dans l'enseignement. Deux axes : éducation par le numérique (outils comme support d'apprentissage) et éducation au numérique (codage, maîtrise des médias). S'inscrit dans la stratégie Digital Wallonia.
Outils numériques : Google Classroom (cours, @atheneejulesbara.be) · École en ligne (repas, paiements, code V01154-3) — page « Applis » du site.

TROUBLES DE L'APPRENTISSAGE
« Chaque élève avec ses capacités et ses difficultés trouve sa place chez nous. » Une logopède travaille en collaboration avec les enseignants et les parents pour identifier les difficultés (dyslexie, TDAH, dyscalculie…), élaborer des plans d'aménagements raisonnables et adapter les stratégies pédagogiques. Renseignements : 069 89 06 02.

INTERNATS PARTENAIRES
L'école collabore avec deux internats régionaux :
- Internat Mixte d'Antoing
- Internat Walter Ravez
Pour modalités d'accueil, tarifs et admission : contacter le secrétariat.

═══ COMMUNAUTÉ SCOLAIRE ═══

UNION DES ANCIENS ÉLÈVES
Rassemble tous les anciens élèves. Cotisations annuelles : 10 € (Base/Sympathisant) · 20 € (Silver) · 30 € (Gold) · 50 € (Diamond). Paiement par virement. Présence sur Facebook.

ASSOCIATION DES PARENTS D'ÉLÈVES
Partenaire actif de la vie scolaire, représente les familles et dialogue avec l'équipe pédagogique. Site : apbara.be · Facebook. Contact : direction@atheneejulesbara.be.

PROJETS PÉDAGOGIQUES
Entreprise pédagogique « C'est Bio Bara » : créée par deux enseignants de l'option Sciences économiques pour stimuler l'esprit d'entreprendre. Parts à 5 € ou 10 €. Contacter la direction pour participer.

═══ OUTILS NUMÉRIQUES ═══
- Google Classroom : cours et travaux (classroom.google.com, compte @atheneejulesbara.be)
- École en ligne : commande repas, paiements, activités extrascolaires et espace de travail élèves (code établissement V01154-3)
- Ces accès sont disponibles sur la page « Applis » du site.

═══ PAGES DU SITE — LIENS CLIQUABLES ═══
Chaque fois que tu mentionnes une page du site, entoure son nom exact avec « » pour créer un lien cliquable.
Pages disponibles (utilise ces noms exacts, toujours entre « ») :
- «Grilles» : toutes les grilles horaires détaillées (1er, 2e, 3e degré, DASPA, 7e préparatoire)
- «Préinscription» : formulaire d'inscription en ligne
- «Calendrier» : dates, congés, événements de l'année scolaire
- «Restaurant» : menus hebdomadaires du restaurant scolaire
- «Actualités» : événements et nouvelles de l'école
- «Contact» : formulaire de contact et coordonnées
- «Applis» : accès à Google Classroom, École en ligne, etc.
- «Documents» : galerie de documents téléchargeables (PDF, Word, etc.)
Exemples d'usage correct : "consultez la page «Grilles»", "via la page «Contact»", "formulaire sur «Préinscription»".
Pages accessibles via le footer du site (lightboxes — pas de lien «», mentionne-les normalement) :
  Qui est Jules Bara ? · Historique · Projets · Projet d'établissement · Règlement d'ordre intérieur · École des devoirs · École numérique · Troubles d'apprentissage · Union des Anciens · Association des parents · Internat

═══ TON CRÉATEUR ═══
Si on te demande qui t'a créé, qui t'a conçu, ou qui est derrière toi, réponds que tu as été créé par «JAS Digital Works», une agence digitale belge. Tu peux ajouter que tu es fier d'être belge. N'élabore pas davantage sur ce sujet.

═══ RÈGLES ═══
- Réponds UNIQUEMENT aux questions en lien avec l'école ou sur ton créateur. Pour toute autre demande hors sujet, redirige poliment.
- N'invente jamais d'information précise inconnue (dates exactes, prix, noms de profs, résultats). Invite à contacter le secrétariat ou la page «Contact».
- Réponds directement, sans préambule du type « En tant qu'assistant… ».

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
    answer: "L'Athénée propose l'enseignement général du 1er au 3e degré (4 dominantes en 2e degré, 6 options en 3e degré), le DASPA et une 7e préparatoire. Toutes les grilles horaires détaillées sont sur la page « Grilles ».",
    suggs: ["Qu'est-ce que le DASPA ?", "C'est quoi la 7e préparatoire ?", "Quelles options au 3e degré ?"],
  },
  {
    keywords: ["daspa", "primo", "arrivant", "passerelle", "étranger"],
    answer: "Le DASPA (classes passerelles) accueille les élèves primo-arrivants ne maîtrisant pas encore le français. Le programme intensif comprend 8 périodes de FLE et 7 de français par semaine, pour une intégration progressive. Voir la page « Grilles » pour la grille complète.",
    suggs: ["Combien de temps dure le DASPA ?", "Quelles sont les conditions d'accès ?", "Comment s'inscrire ?"],
  },
  {
    keywords: ["7e", "septième", "préparatoire", "supérieur"],
    answer: "La 7e préparatoire (après la rhétorique) prépare aux études supérieures scientifiques avec 14 périodes de maths, 6 de physique, 4 de chimie et 3 de biologie par semaine — 31 périodes au total. La grille complète est sur la page « Grilles ».",
    suggs: ["Qui peut s'inscrire en 7e ?", "Quelles études supérieures cela prépare-t-il ?", "Comment s'inscrire ?"],
  },
  {
    keywords: ["contact", "téléphone", "telephone", "mail", "e-mail", "adresse", "joindre", "secrétariat", "secretariat", "direction", "directeur", "comptabilité", "comptabilite"],
    answer: "Voici les contacts principaux de l'école :\n• Directeur : Leandro Anzaldi — 069/89.06.00 — direction@atheneejulesbara.be\n• Direction adjointe : Albano D'Arcangelo — 069/89.06.08 — directionadjointe@atheneejulesbara.be\n• Secrétariat de direction : Yasmina Bouvry — 069/89.06.02 — Bouvry.y@atheneejulesbara.be\n• Secrétariat élèves : Dorothée Lecomte — 069/89.06.03 — Lecomte.d@atheneejulesbara.be\n• Comptabilité : Isabelle Debray — 069/89.06.04 — Debray.i@atheneejulesbara.be\nAdresse : Rue Duquesnoy 24, 7500 Tournai. La page « Contact » permet aussi d'envoyer un message directement.",
    suggs: ["Comment s'inscrire ?", "Où se trouve l'école ?", "Quels sont les horaires du secrétariat ?"],
  },
  {
    keywords: ["restaurant", "cantine", "menu", "repas", "manger", "école en ligne", "portefeuille"],
    answer: "Les menus de la semaine du restaurant scolaire sont disponibles sur la page « Restaurant » du site. Les repas se commandent et se paient en ligne via « École en ligne » (espace de l'établissement).",
    suggs: ["Comment accéder à École en ligne ?", "Quel est le prix des repas ?", "Peut-on manger tous les jours ?"],
  },
  {
    keywords: ["calendrier", "congé", "conge", "vacances", "date", "rentrée"],
    answer: "Les dates clés, congés et événements de l'année scolaire figurent sur la page « Calendrier ». Le fichier .ics permet d'importer toutes les dates dans Google Agenda, Apple Calendrier ou Outlook.",
    suggs: ["Quand est la rentrée ?", "Quand sont les vacances de Toussaint ?", "Quand se terminent les cours ?"],
  },
  {
    keywords: ["numérique", "numerique", "classroom", "google", "école en ligne", "applis", "plateforme"],
    answer: "L'école utilise Google Classroom (cours et travaux) et École en ligne (repas, paiements, activités extrascolaires et espace de travail — code V01154-3). Tous ces accès sont regroupés sur la page « Applis ».",
    suggs: ["Comment accéder à Google Classroom ?", "Comment accéder à École en ligne ?", "Que trouve-t-on dans l'École en ligne ?"],
  },
  {
    keywords: ["bonjour", "salut", "coucou", "hello", "bonsoir", "hallo", "goedag"],
    answer: "Bonjour ! Je suis Jules, l'assistant de l'Athénée Royal Jules Bara. Comment puis-je vous aider ?",
    suggs: ["Comment s'inscrire à l'école ?", "Quelles options sont disponibles ?", "Comment contacter l'école ?"],
  },
  {
    keywords: ["valeur", "projet", "établissement", "mission", "histoire", "fondé", "1595"],
    answer: "Fondé en 1595, l'Athénée Royal Jules Bara accueille environ 950 élèves autour de trois valeurs : Apprendre (pédagogie diversifiée), S'ouvrir (projets citoyens), S'accomplir (épanouissement personnel). Le projet d'établissement est résumé en une devise : « Conduire chacun vers sa propre Excellence ».",
    suggs: ["Quelles options propose l'école ?", "Comment s'inscrire ?", "Qui est Jules Bara ?"],
  },
  {
    keywords: ["jules bara", "bara", "homme", "personnage", "patronyme", "nom de l'école", "pourquoi jules"],
    answer: "Jules Bara (1835-1900) est un juriste et homme politique tournaisien, ancien élève de l'Athénée. Deux fois ministre de la Justice, il a défendu l'école laïque et l'indépendance de l'État vis-à-vis de l'Église. L'établissement porte son nom depuis 1980. Vous pouvez en savoir plus en cliquant sur « Qui est Jules Bara ? » dans le bas de page du site.",
    suggs: ["Quelle est l'histoire de l'école ?", "Quand a été fondée l'école ?", "Comment s'inscrire ?"],
  },
  {
    keywords: ["historique", "histoire de l'école", "ancien", "fondation", "jésuite", "1595", "collège"],
    answer: "L'Athénée a été fondé en 1595 comme Collegium Tornacense par les Jésuites. Après la Révolution française, il devient « Collège National » (1795), puis reçoit le titre d'« Athénée » en 1817. Il ouvre ses portes aux jeunes filles en 1923 et adopte le nom « Athénée Royal Jules Bara » en 1979. Retrouvez l'historique complet en bas du site.",
    suggs: ["Qui est Jules Bara ?", "Quelles sont les valeurs de l'école ?", "Comment s'inscrire ?"],
  },
  {
    keywords: ["devoirs", "école des devoirs", "soutien scolaire", "aide aux devoirs", "après l'école"],
    answer: "L'École des devoirs de l'Athénée accueille les élèves de 6 à 18 ans en dehors des heures scolaires. Elle propose un soutien pédagogique et un encadrement éducatif bienveillant, dans un cadre social et culturel enrichissant. Pour en savoir plus, contactez-nous au 069 89 06 02.",
    suggs: ["Quels sont les horaires ?", "Comment s'inscrire à l'école des devoirs ?", "Autres services de l'école ?"],
  },
  {
    keywords: ["trouble", "dyslexie", "tdah", "dyscalculie", "haut potentiel", "hp", "dys", "aménagement", "logopède", "difficulté"],
    answer: "L'Athénée accompagne tous les élèves, quelles que soient leurs difficultés. Une logopède travaille avec les enseignants et les parents pour identifier les troubles d'apprentissage (dyslexie, TDAH…) et mettre en place des aménagements raisonnables individualisés. Contactez la direction au 069 89 06 02 pour un suivi personnalisé.",
    suggs: ["Comment contacter la logopède ?", "Qu'est-ce qu'un aménagement raisonnable ?", "Autres services de l'école ?"],
  },
  {
    keywords: ["internat", "hébergement", "logement", "dormir", "pensionnaire", "interne"],
    answer: "L'Athénée collabore avec deux internats de la région : l'Internat Mixte d'Antoing et l'Internat Walter Ravez. Pour les modalités d'accueil, les tarifs et les conditions d'admission, contactez le secrétariat au 069 89 06 02.",
    suggs: ["Où se trouvent les internats ?", "Quel est le coût de l'internat ?", "Comment s'inscrire à l'école ?"],
  },
  {
    keywords: ["anciens élèves", "alumni", "union des anciens", "ancien élève", "cotisation"],
    answer: "L'Union des Anciens Élèves rassemble tous ceux qui ont fréquenté l'Athénée. Vous pouvez adhérer dès 10 € (Base/Sympathisant), 20 € (Silver), 30 € (Gold) ou 50 € (Diamond), par virement bancaire. Retrouvez l'Union sur Facebook ou contactez la direction.",
    suggs: ["Comment adhérer à l'Union ?", "Quels sont les avantages ?", "Comment contacter l'école ?"],
  },
  {
    keywords: ["association des parents", "parents", "apbara", "ape", "comité des parents"],
    answer: "L'Association des parents d'élèves est un partenaire actif de la vie scolaire. Elle représente les familles et dialogue avec l'équipe pédagogique. Retrouvez-la sur apbara.be et sur Facebook, ou contactez la direction à direction@atheneejulesbara.be.",
    suggs: ["Comment contacter l'association ?", "Quelles activités organise-t-elle ?", "Comment s'impliquer ?"],
  },
  {
    keywords: ["règlement", "roi", "règlement d'ordre intérieur", "règles", "discipline", "sanction"],
    answer: "Le Règlement d'Ordre Intérieur (ROI) définit les droits et devoirs de tous les membres de la communauté scolaire. Il couvre les absences, les sanctions, les modalités d'évaluation et les droits des élèves et des parents. Contactez le secrétariat au 069 89 06 02 pour obtenir le document.",
    suggs: ["Comment signaler une absence ?", "Quels sont les droits des élèves ?", "Comment contacter l'école ?"],
  },
  {
    keywords: ["bio bara", "entreprise pédagogique", "projet économique", "sciences économiques"],
    answer: "« C'est Bio Bara » est une entreprise pédagogique créée par deux enseignants de l'option Sciences économiques pour stimuler l'esprit d'entreprendre. Les élèves peuvent acquérir des parts à 5 € ou 10 €. Contactez la direction pour participer.",
    suggs: ["Qu'est-ce que l'option Sciences économiques ?", "Comment rejoindre le projet ?", "Autres projets de l'école ?"],
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

/** Renvoie la réponse de Jules sous forme de flux de texte (UTF-8). */
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
        const err = e as { status?: number; message?: string; error?: { message?: string } };
        console.error("[jules] erreur Groq — status:", err?.status, "| message:", err?.message ?? err?.error?.message ?? String(e));
        controller.enqueue(
          encoder.encode(
            "Désolé, je rencontre un problème technique. Contactez le secrétariat au 069 89 06 02."
          )
        );
      } finally {
        controller.close();
      }
    },
  });
}
