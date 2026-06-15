import { createPage, listPages } from "@/lib/pages";
import { slugify } from "@/lib/article-types";
import { requireRole } from "@/lib/auth";

// Liste de toutes les pages (brouillons inclus) — réservé à l'éditeur (ADMIN).
// Le site public n'utilise jamais cette route : le menu de navigation lit
// `listPages()` côté serveur (cf. src/app/(public)/layout.tsx).
export async function GET(request: Request) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;
  return Response.json(await listPages());
}

// Création d'une page — réservé aux administrateurs.
export async function POST(request: Request) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;
  const body = await request.json().catch(() => ({}));
  const title = (body.title ?? "").trim();
  if (!title) {
    return Response.json({ error: "Le titre est requis" }, { status: 400 });
  }
  const slug = body.slug ? slugify(body.slug) : slugify(title);
  if (!slug) {
    return Response.json({ error: "Titre invalide" }, { status: 400 });
  }
  const page = await createPage(slug, title);
  if (!page) {
    return Response.json(
      { error: `Une page « ${slug} » existe déjà` },
      { status: 409 }
    );
  }
  return Response.json(page, { status: 201 });
}
