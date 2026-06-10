import { createContactMessage, listContactMessages } from "@/lib/messages";
import { requireRole } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name, email, subject, message } = body;
  if (!name || !email || !subject || !message) {
    return Response.json(
      { error: "Tous les champs sont requis" },
      { status: 400 }
    );
  }
  const msg = await createContactMessage({ name, email, subject, message });
  return Response.json({ ok: true, id: msg.id }, { status: 201 });
}

export async function GET(request: Request) {
  const auth = await requireRole(request, "ADMIN", "COMM");
  if (auth instanceof Response) return auth;
  return Response.json(await listContactMessages());
}
