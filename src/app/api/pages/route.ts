import { createPage, listPages } from "@/lib/pages";
import { slugify } from "@/lib/article-types";
import { requireRole } from "@/lib/auth";

export async function GET() {
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
