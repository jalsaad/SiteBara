# Site web — Athénée Royal Jules Bara

Refonte du site [atheneejulesbara.be](https://atheneejulesbara.be) selon le
cahier des charges (mail du pouvoir organisateur) et la maquette graphique
validée (`../bara maquette du site2.html`).

**Stack** : Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4 ·
Prisma 7 · PostgreSQL.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
```

Sans configuration supplémentaire, le site tourne en **mode démo** : les
actualités sont servies depuis un magasin en mémoire pré-rempli (les
modifications ne survivent pas au redémarrage).

### Brancher PostgreSQL (production / OVH)

```bash
cp .env.example .env       # renseigner DATABASE_URL
npx prisma migrate dev     # crée les tables
npm run dev
```

La couche de données (`src/lib/articles.ts`) bascule automatiquement sur
Prisma dès que `DATABASE_URL` est défini.

## Les trois interfaces (cahier des charges)

| Interface | URL | État |
|---|---|---|
| Site public | `/` | Accueil fidèle à la maquette, pages de contenu (`/filieres`, `/restaurant`, `/calendrier`), liste + détail des actualités, SEO de base (métadonnées, Open Graph) |
| Éditeur de pages drag-and-drop | `/admin/editeur` | Palette de 6 blocs (bannière, texte, actus, grille horaire **éditable** — en-têtes + lignes, galerie d'images, contact), canvas avec aperçu temps réel, inspecteur de propriétés, duplication/suppression/réordonnancement. La **bannière** accepte une **vidéo d'arrière-plan**, un **effet graphique en premier plan** (grain, points, hachures, vignette) à **transparence réglable**, et un **style de bordure inférieure** (vague, oblique, courbe) |
| Gestion des actualités | `/admin/actus` | CRUD complet : création, édition, publication/dépublication, suppression — répercuté automatiquement sur la page d'accueil. Diffusion vers les réseaux sociaux (voir ci-dessous) |

## Structure

```
prisma/schema.prisma          Modèles : User (rôles), Page, Block, Article,
                              PreRegistration, ContactMessage
src/app/(public)/             Site public (layout nav + footer)
src/app/admin/                Interfaces d'administration
src/app/api/articles/         API REST des actualités
src/lib/articles.ts           Couche données (Prisma ⇄ mémoire) — serveur
src/lib/users.ts              Comptes admin (scrypt, Prisma ⇄ mémoire) — serveur
src/lib/email.ts              Notifications e-mail (nodemailer) — serveur
src/lib/julia.ts              Chatbot Julia (API Claude ⇄ démo) — serveur
src/lib/article-types.ts      Types partagés client/serveur
src/components/               Nav, Footer, NewsCard, Reveal, Toast
public/                       Logos + vidéo héro extraits de la maquette
```

## Authentification & comptes

L'espace `/admin` est protégé (cookie de session signé HMAC + proxy Next ;
secret via `AUTH_SECRET`). Les identifiants sont vérifiés contre le modèle
`User` (`src/lib/users.ts`) : mots de passe **hachés avec scrypt** (module
natif, jamais stockés en clair).

La connexion se fait **en deux temps (double authentification)** :

1. **E-mail + mot de passe** (avec œil 👁 pour afficher/masquer le mot de passe
   et case **« Se souvenir de moi »**). Si les identifiants sont valides, un
   **code de sécurité à 6 chiffres** est envoyé par e-mail à l'utilisateur — aucune
   session n'est encore ouverte.
2. **Saisie du code** : valide pendant 10 minutes, à usage unique, 5 essais max
   (code haché en mémoire, `src/lib/twofactor.ts`). Une fois validé, la session
   est ouverte.

« Se souvenir de moi » porte la durée de la session de **12 h** à **30 jours**.
L'envoi du code réutilise la configuration **SMTP** (voir « Notifications
e-mail ») ; **sans SMTP** (mode démo) le code est tracé dans la **console du
serveur** afin de pouvoir tester le flux hors ligne.

Au premier démarrage (base vide) ou en mode démo, trois comptes sont **semés**
automatiquement à partir de `ADMIN_PASSWORD` / `COMM_PASSWORD` / `CUISINE_PASSWORD` :

| Compte | Rôle | Accès |
|---|---|---|
| admin@atheneejulesbara.be / `admin2026` | ADMIN | éditeur de pages + actus + messages + menu + utilisateurs |
| communication@atheneejulesbara.be / `comm2026` | COMM | actus + messages |
| cuisine@atheneejulesbara.be / `cuisine2026` | CUISINE | menu de la semaine du restaurant scolaire |

La page **`/admin/utilisateurs`** (réservée aux ADMIN) permet de créer des
comptes, changer le rôle, réinitialiser le mot de passe et supprimer — avec
garde-fous : on ne peut pas supprimer son propre compte ni rétrograder /
supprimer le dernier administrateur. L'e-mail d'un compte est immuable.

## Diffusion vers les réseaux sociaux

Depuis `/admin/actus`, le bouton 📣 d'un article **publié** ouvre la fenêtre
de diffusion : choix des réseaux (Facebook, Instagram, LinkedIn), envoi du
titre + résumé + lien vers l'article, et historique par réseau (dernière
diffusion, statut) affiché sous le badge de publication.

- **Sans clés API** (mode démo) : la diffusion est *simulée* et tracée dans
  l'historique — rien n'est envoyé.
- **Avec clés API** (`.env`) : publication réelle via l'API Graph Meta
  (`FACEBOOK_PAGE_ID`, `FACEBOOK_PAGE_TOKEN`, `INSTAGRAM_ACCOUNT_ID`) et
  l'API LinkedIn (`LINKEDIN_ORG_ID`, `LINKEDIN_ACCESS_TOKEN`). `SITE_URL`
  définit l'URL publique utilisée dans les liens partagés.

Connecteurs dans `src/lib/social.ts`, historique stocké sur l'article
(colonne Json `shares` — exécuter `npx prisma migrate dev` puis
`npx prisma generate` après mise à jour du schéma).

## Pages composées & formulaires

- L'éditeur (`/admin/editeur`) gère **toutes les pages du site** : panneau
  « Pages du site » (statut publié/brouillon), création (`+ Nouvelle page`),
  renommage, suppression (l'accueil est protégé), bascule avec garde-fou si
  des modifications ne sont pas enregistrées (`?page=slug` pour le lien
  direct). Chaque page s'enregistre/se publie via `PUT /api/pages/[slug]`
  et les pages publiées sont rendues publiquement sur `/p/[slug]` avec les
  styles du site.
- Les pages publiées apparaissent automatiquement dans le menu de
  navigation public (entre les liens fixes et « Contact »).
- `/contact` et `/preinscription` enregistrent les demandes, consultables
  dans `/admin/messages`.
- À chaque demande reçue, une **notification e-mail** est envoyée au secrétariat
  (voir ci-dessous).

## Notifications e-mail

À la réception d'un message de contact ou d'une préinscription, le secrétariat
est notifié par e-mail (connecteur `src/lib/email.ts`, branché sur les routes
`POST /api/contact` et `POST /api/preinscriptions`). L'envoi est *best-effort* :
un échec n'empêche jamais l'enregistrement de la demande.

- **Sans SMTP** (mode démo) : la notification est *simulée* et tracée dans la
  console serveur — rien n'est envoyé.
- **Avec SMTP** (`.env`) : envoi réel via nodemailer. Variables `SMTP_HOST`,
  `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, expéditeur `MAIL_FROM`
  et destinataire(s) `MAIL_TO` (plusieurs adresses séparées par des virgules).
  Exemple OVH : `ssl0.ovh.net` / `465` / `SMTP_SECURE=true`. L'adresse de
  l'expéditeur du formulaire est placée en `Reply-To`.

## Applis & outils

La page **`/applis`** (lien dans la nav) regroupe :

- **Accès rapides** : cartes vers les espaces numériques externes (Google
  Classroom, APSchool, MyBara). Les URLs sont dans un tableau en tête de
  `src/app/(public)/applis/page.tsx` — *à confirmer/ajuster avec l'établissement*.
- **Générateur de QR code** (`src/components/QrGenerator.tsx`) : un lien/texte →
  aperçu + téléchargement PNG.
- **Images → PDF** (`src/components/PdfBuilder.tsx`) : regroupe des photos/scans
  en un PDF (une image par page, format A4).

Les deux outils fonctionnent **entièrement côté navigateur** (libs `qrcode` et
`jspdf`) : aucune donnée n'est envoyée à un serveur, aucun coût, et ils
fonctionnent sur tout hébergement.

## Julia — assistante conversationnelle (chatbot)

**Julia** (« Jules Bara » + « IA ») est l'assistante du site public : une bulle
de discussion flottante (`src/components/JuliaChat.tsx`, montée dans le layout
public) répond aux questions des visiteurs sur l'école — inscriptions, filières,
calendrier, restaurant, contact… La réponse s'affiche en streaming.

- **Sans `ANTHROPIC_API_KEY`** (mode démo) : réponses pré-écrites par mots-clés
  (`src/lib/julia.ts`) — fonctionne hors ligne, sans coût.
- **Avec `ANTHROPIC_API_KEY`** : réponses générées par l'API Claude (modèle
  **Opus 4.8**, `claude-opus-4-8`), avec un prompt système contenant les
  informations de l'établissement et des garde-fous (rester sur le sujet de
  l'école, ne rien inventer, rediriger vers le secrétariat en cas de doute).

Endpoint : `POST /api/julia` (public, runtime Node, streaming texte). L'historique
est borné (12 messages, 2000 caractères/message).

## Téléversement d'images

L'éditeur d'actualités (`/admin/actus`) permet d'ajouter une **image de
couverture** à chaque article (champ « Image de couverture » de la modale).
Elle s'affiche sur la carte en page d'accueil/actualités et en bandeau de la
page de détail (à défaut, le dégradé de la couleur d'accent est conservé).

- Endpoint : `POST /api/upload` (authentifié, multipart `file`) — valide le
  type et la taille, puis renvoie `{ url }`. **Images** : JPEG/PNG/WebP/GIF,
  5 Mo max. **Vidéos** (arrière-plan de bannière) : MP4/WebM, 25 Mo max.
- Stockage : `public/uploads/` (ignoré par git), servi à `/uploads/<nom>`.
  Convient à l'hébergement OVH en serveur Node (`next start`).
- Composant réutilisable : `src/components/ImageUpload.tsx` (aperçu, remplacer,
  retirer ; prop `kind="image" | "video"`) — réemployé dans le bloc **Galerie**
  de l'éditeur de pages (`/admin/editeur`) : ajout/remplacement/retrait de
  plusieurs photos, rendues sur la page publique (`/p/[slug]`). Sans photo, la
  galerie conserve ses vignettes colorées par défaut. Côté **bannière**, il sert
  aussi à téléverser la vidéo d'arrière-plan (voir tableau des interfaces).

## Reste à faire

- [x] **Diffusion vers les réseaux sociaux** depuis le gestionnaire d'actus
- [x] **Téléversement d'images** de couverture pour les actualités
- [x] **Pages de contenu** : filières/grilles horaires (`/filieres`), restaurant
  (`/restaurant`), calendrier scolaire (`/calendrier`)
- [x] Téléversement d'images dans les galeries de l'éditeur de pages
- [x] Notification e-mail à la réception d'un message/préinscription
- [x] **Chatbot Julia** (assistant IA du site) — voir ci-dessous
- [x] **Page Applis** : QR codes, conversion images → PDF, accès numériques — voir ci-dessous
- [x] Comptes utilisateurs en base (modèle User) au lieu des comptes de démo
