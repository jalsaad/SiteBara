import {
  createPreRegistration,
  listPreRegistrations,
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
  const reg = await createPreRegistration({
    lastName,
    firstName,
    email,
    phone,
    level,
    message,
  });
  // Notification best-effort : un échec d'e-mail ne doit pas faire échouer la
  // demande (elle reste consultable dans /admin/messages).
  await notifyPreRegistration(reg).catch(() => {});
  return Response.json({ ok: true, id: reg.id }, { status: 201 });
}

export async function GET(request: Request) {
  const auth = await requireRole(request, "ADMIN", "COMM");
  if (auth instanceof Response) return auth;
  return Response.json(await listPreRegistrations());
}
