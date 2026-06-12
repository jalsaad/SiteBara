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
| Gestion des actualités | `/admin/actus` | CRUD complet : création, édition, publication/dépublication, suppression — répercuté automatiquement sur la page d'accueil |

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

## Reste à faire

- [ ] Pages de contenu : filières/grilles horaires, restaurant, calendrier
- [ ] **Diffusion vers les réseaux sociaux** depuis le gestionnaire d'actus
- [ ] Téléversement d'images (actualités, galeries)
- [ ] Notification e-mail à la réception d'un message/préinscription
- [ ] Migration du contenu existant (WordPress)
- [ ] QR codes, conversion PDF, chatbot (outils mentionnés au cahier des charges)
- [ ] Comptes utilisateurs en base (modèle User) au lieu des comptes de démo
