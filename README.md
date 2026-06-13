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
| Site public | `/` | Accueil fidèle à la maquette, liste + détail des actualités, SEO de base (métadonnées, Open Graph) |
| Éditeur de pages drag-and-drop | `/admin/editeur` | Palette de 6 blocs (bannière, texte, actus, grille, galerie, contact), canvas avec aperçu temps réel, inspecteur de propriétés, duplication/suppression/réordonnancement |
| Gestion des actualités | `/admin/actus` | CRUD complet : création, édition, publication/dépublication, suppression — répercuté automatiquement sur la page d'accueil. Diffusion vers les réseaux sociaux (voir ci-dessous) |

## Structure

```
prisma/schema.prisma          Modèles : User (rôles), Page, Block, Article,
                              PreRegistration, ContactMessage
src/app/(public)/             Site public (layout nav + footer)
src/app/admin/                Interfaces d'administration
src/app/api/articles/         API REST des actualités
src/lib/articles.ts           Couche données (Prisma ⇄ mémoire) — serveur
src/lib/article-types.ts      Types partagés client/serveur
src/components/               Nav, Footer, NewsCard, Reveal, Toast
public/                       Logos + vidéo héro extraits de la maquette
```

## Authentification

L'espace `/admin` est protégé (cookie de session signé HMAC + proxy Next).
Comptes de démonstration (mots de passe surchargés par `ADMIN_PASSWORD` /
`COMM_PASSWORD`, secret de session via `AUTH_SECRET`) :

| Compte | Rôle | Accès |
|---|---|---|
| admin@atheneejulesbara.be / `admin2026` | ADMIN | éditeur de pages + actus + messages |
| communication@atheneejulesbara.be / `comm2026` | COMM | actus + messages |

À terme : remplacer les comptes de démo par le modèle `User` en base
(éventuellement via Auth.js).

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

## Téléversement d'images

L'éditeur d'actualités (`/admin/actus`) permet d'ajouter une **image de
couverture** à chaque article (champ « Image de couverture » de la modale).
Elle s'affiche sur la carte en page d'accueil/actualités et en bandeau de la
page de détail (à défaut, le dégradé de la couleur d'accent est conservé).

- Endpoint : `POST /api/upload` (authentifié, multipart `file`) — valide le
  type (JPEG/PNG/WebP/GIF) et la taille (5 Mo max), puis renvoie `{ url }`.
- Stockage : `public/uploads/` (ignoré par git), servi à `/uploads/<nom>`.
  Convient à l'hébergement OVH en serveur Node (`next start`).
- Composant réutilisable : `src/components/ImageUpload.tsx` (aperçu, remplacer,
  retirer) — prêt à être réemployé pour les galeries de l'éditeur de pages.

## Reste à faire

- [x] **Diffusion vers les réseaux sociaux** depuis le gestionnaire d'actus
- [x] **Téléversement d'images** de couverture pour les actualités
- [ ] Pages de contenu : filières/grilles horaires, restaurant, calendrier
- [ ] Téléversement d'images dans les galeries de l'éditeur de pages
- [ ] Notification e-mail à la réception d'un message/préinscription
- [ ] Migration du contenu existant (WordPress)
- [ ] QR codes, conversion PDF, chatbot (outils mentionnés au cahier des charges)
- [ ] Comptes utilisateurs en base (modèle User) au lieu des comptes de démo
