import { requireRole } from "@/lib/auth";
import { updateMenu, deleteMenu } from "@/lib/menu";

export const runtime = "nodejs";

// PUT : met à jour une semaine. Réservé au chef cuisinier et aux admins.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, "ADMIN", "CUISINE");
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Requête invalide" }, { status: 400 });
  }
  const { weekStart, weekLabel, days } = body as Record<string, unknown>;
  const menu = await updateMenu(id, { weekStart, weekLabel, days });
  if (!menu) return Response.json({ error: "Semaine introuvable" }, { status: 404 });
  return Response.json(menu);
}

// DELETE : supprime une semaine.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, "ADMIN", "CUISINE");
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const ok = await deleteMenu(id);
  if (!ok) return Response.json({ error: "Suppression impossible" }, { status: 404 });
  return Response.json({ ok: true });
}
