import { reorderPages } from "@/lib/pages";
import { requireRole } from "@/lib/auth";

// Réordonne les pages (ordre du menu) — réservé aux administrateurs.
export async function POST(request: Request) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;
  const body = await request.json().catch(() => ({}));
  if (!Array.isArray(body?.slugs)) {
    return Response.json({ error: "slugs (tableau) requis" }, { status: 400 });
  }
  await reorderPages(body.slugs as string[]);
  return Response.json({ ok: true });
}
