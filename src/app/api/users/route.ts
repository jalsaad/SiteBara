import { requireRole } from "@/lib/auth";
import { createUser, listUsers } from "@/lib/users";

const ROLES = ["ADMIN", "COMM", "CUISINE"] as const;

export async function GET(request: Request) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;
  return Response.json(await listUsers());
}

export async function POST(request: Request) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;

  const body = await request.json().catch(() => ({}));
  const { email, name, role, password } = body;
  if (!email || !name || !password) {
    return Response.json(
      { error: "Nom, e-mail et mot de passe requis" },
      { status: 400 }
    );
  }
  if (!ROLES.includes(role)) {
    return Response.json({ error: "Rôle invalide" }, { status: 400 });
  }
  if (String(password).length < 8) {
    return Response.json(
      { error: "Le mot de passe doit faire au moins 8 caractères" },
      { status: 400 }
    );
  }
  const user = await createUser({ email, name, role, password });
  if (!user) {
    return Response.json(
      { error: "Un compte existe déjà avec cet e-mail" },
      { status: 409 }
    );
  }
  return Response.json(user, { status: 201 });
}
