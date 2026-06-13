import { addShares, getArticleById } from "@/lib/articles";
import type { SocialNetwork } from "@/lib/articles";
import { diffuse } from "@/lib/social";
import { requireRole } from "@/lib/auth";

// POST /api/articles/[id]/share  { networks: ("facebook"|"instagram"|"linkedin")[] }
// Diffuse un article publié vers les réseaux sociaux choisis.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, "ADMIN", "COMM");
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    networks?: SocialNetwork[];
  };
  if (!Array.isArray(body.networks) || body.networks.length === 0) {
    return Response.json(
      { error: "Choisissez au moins un réseau" },
      { status: 400 }
    );
  }
  const article = await getArticleById(id);
  if (!article) {
    return Response.json({ error: "Article introuvable" }, { status: 404 });
  }
  if (article.status !== "PUBLISHED") {
    return Response.json(
      { error: "Publiez l'article avant de le diffuser" },
      { status: 409 }
    );
  }
  const results = await diffuse(article, body.networks);
  const updated = await addShares(id, results);
  return Response.json({ article: updated, results });
}
