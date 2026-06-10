import { deletePage, getPage, savePage } from "@/lib/pages";
import { requireRole } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) {
    return Response.json({ error: "Page introuvable" }, { status: 404 });
  }
  return Response.json(page);
}

// Sauvegarde (brouillon) ou publication — réservé aux administrateurs.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;
  const { slug } = await params;
  const body = await request.json();
  if (!Array.isArray(body?.blocks)) {
    return Response.json({ error: "blocks (tableau) requis" }, { status: 400 });
  }
  const page = await savePage(slug, {
    title: body.title,
    blocks: body.blocks,
    publish: body.publish,
  });
  return Response.json(page);
}

// Suppression d'une page — réservé aux administrateurs.
// La page d'accueil composée ne peut pas être supprimée.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;
  const { slug } = await params;
  if (slug === "accueil") {
    return Response.json(
      { error: "La page d'accueil ne peut pas être supprimée" },
      { status: 400 }
    );
  }
  const ok = await deletePage(slug);
  if (!ok) {
    return Response.json({ error: "Page introuvable" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
