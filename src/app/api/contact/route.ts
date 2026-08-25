import {
  listContactMessages,
  updateContactStatus,
  deleteContactForever,
  type MessageStatus,
} from "@/lib/messages";
import { notifyContactMessage } from "@/lib/email";
import { requireRole } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name, email, subject, message } = body;
  if (!name || !email || !subject || !message) {
    return Response.json({ error: "Tous les champs sont requis" }, { status: 400 });
  }
  const result = await notifyContactMessage({ name, email, subject, message });
  if (result.status === "FAILED") {
    return Response.json(
      { error: "Envoi impossible, réessayez plus tard ou contactez-nous directement." },
      { status: 502 }
    );
  }
  return Response.json({ ok: true }, { status: 201 });
}

export async function GET(request: Request) {
  const auth = await requireRole(request, "ADMIN", "COMM");
  if (auth instanceof Response) return auth;
  return Response.json(await listContactMessages());
}

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "ADMIN", "COMM");
  if (auth instanceof Response) return auth;
  const body = await request.json().catch(() => ({}));
  const { id, status } = body as { id?: string; status?: MessageStatus };
  if (!id || !status) return Response.json({ error: "id et status requis" }, { status: 400 });
  const ok = await updateContactStatus(id, status);
  return Response.json({ ok });
}

export async function DELETE(request: Request) {
  const auth = await requireRole(request, "ADMIN", "COMM");
  if (auth instanceof Response) return auth;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id requis" }, { status: 400 });
  const ok = await deleteContactForever(id);
  return Response.json({ ok });
}
