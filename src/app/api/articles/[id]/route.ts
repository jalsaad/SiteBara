import { deleteArticle, updateArticle } from "@/lib/articles";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const article = await updateArticle(id, body);
  if (!article) {
    return Response.json({ error: "Article introuvable" }, { status: 404 });
  }
  return Response.json(article);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deleteArticle(id);
  if (!ok) {
    return Response.json({ error: "Article introuvable" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
