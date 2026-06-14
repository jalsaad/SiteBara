import { requireRole } from "@/lib/auth";
import { getMenu, saveMenu } from "@/lib/menu";

export const runtime = "nodejs";

// GET public : le menu courant (consommé par /restaurant et /admin/menu).
export async function GET() {
  return Response.json(await getMenu());
}

// PUT : enregistre le menu. Réservé au chef cuisinier et aux administrateurs.
export async function PUT(request: Request) {
  const auth = await requireRole(request, "ADMIN", "CUISINE");
  if (auth instanceof Response) return auth;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Requête invalide" }, { status: 400 });
  }
  const { weekLabel, days } = body as { weekLabel?: unknown; days?: unknown };
  const menu = await saveMenu({ weekLabel, days });
  return Response.json(menu);
}
