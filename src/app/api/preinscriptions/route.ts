import {
  createPreRegistration,
  listPreRegistrations,
  updatePreRegStatus,
  deletePreRegForever,
  type MessageStatus,
} from "@/lib/messages";
import { notifyPreRegistration } from "@/lib/email";
import { requireRole } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { lastName, firstName, email, phone, level, message } = body;
  if (!lastName || !firstName || !email || !level) {
    return Response.json(
      { error: "Nom, prénom, e-mail et année souhaitée sont requis" },
      { status: 400 }
    );
  }
  const reg = await createPreRegistration({ lastName, firstName, email, phone, level, message });
  await notifyPreRegistration(reg).catch(() => {});
  return Response.json({ ok: true, id: reg.id }, { status: 201 });
}

export async function GET(request: Request) {
  const auth = await requireRole(request, "ADMIN", "COMM");
  if (auth instanceof Response) return auth;
  return Response.json(await listPreRegistrations());
}

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "ADMIN", "COMM");
  if (auth instanceof Response) return auth;
  const body = await request.json().catch(() => ({}));
  const { id, status } = body as { id?: string; status?: MessageStatus };
  if (!id || !status) return Response.json({ error: "id et status requis" }, { status: 400 });
  const ok = await updatePreRegStatus(id, status);
  return Response.json({ ok });
}

export async function DELETE(request: Request) {
  const auth = await requireRole(request, "ADMIN", "COMM");
  if (auth instanceof Response) return auth;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id requis" }, { status: 400 });
  const ok = await deletePreRegForever(id);
  return Response.json({ ok });
}
