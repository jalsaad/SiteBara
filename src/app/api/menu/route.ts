import { requireRole } from "@/lib/auth";
import { listMenus, createMenu } from "@/lib/menu";

export const runtime = "nodejs";

// GET public : toutes les semaines (consommé par /admin/menu ; la page publique
// /restaurant lit directement la couche serveur).
export async function GET() {
  return Response.json(await listMenus());
}

// POST : crée une nouvelle semaine. Réservé au chef cuisinier et aux admins.
export async function POST(request: Request) {
  const auth = await requireRole(request, "ADMIN", "CUISINE");
  if (auth instanceof Response) return auth;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Requête invalide" }, { status: 400 });
  }
  const { weekStart, weekLabel, days } = body as Record<string, unknown>;
  const menu = await createMenu({ weekStart, weekLabel, days });
  return Response.json(menu, { status: 201 });
}
