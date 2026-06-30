import { requireRole } from "@/lib/auth";
import { reorderArticles } from "@/lib/articles";

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "ADMIN", "COMM");
  if (auth instanceof Response) return auth;
  const items = await request.json();
  if (!Array.isArray(items)) {
    return Response.json({ error: "Tableau attendu" }, { status: 400 });
  }
  await reorderArticles(items);
  return Response.json({ ok: true });
}
