import { requireRole } from "@/lib/auth";
import { countAdmins, deleteUser, getUser, updateUser } from "@/lib/users";

const ROLES = ["ADMIN", "COMM", "CUISINE"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const target = await getUser(id);
  if (!target) {
    return Response.json({ error: "Compte introuvable" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const { name, role, password, codes } = body;
  if (role !== undefined && !ROLES.includes(role)) {
    return Response.json({ error: "Rôle invalide" }, { status: 400 });
  }
  if (password !== undefined && String(password).length < 8) {
    return Response.json(
      { error: "Le mot de passe doit faire au moins 8 caractères" },
      { status: 400 }
    );
  }
  if (codes !== undefined && !Array.isArray(codes)) {
    return Response.json({ error: "Format de codes invalide" }, { status: 400 });
  }
  // Empêche de rétrograder le dernier administrateur.
  if (role !== undefined && role !== "ADMIN" && target.role === "ADMIN" && (await countAdmins()) <= 1) {
    return Response.json(
      { error: "Impossible : c'est le dernier administrateur" },
      { status: 409 }
    );
  }

  const user = await updateUser(id, { name, role, password, codes });
  if (!user) {
    return Response.json({ error: "Mise à jour impossible" }, { status: 400 });
  }
  return Response.json(user);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const target = await getUser(id);
  if (!target) {
    return Response.json({ error: "Compte introuvable" }, { status: 404 });
  }
  // On ne supprime ni son propre compte ni le dernier administrateur.
  if (target.email === auth.email) {
    return Response.json(
      { error: "Vous ne pouvez pas supprimer votre propre compte" },
      { status: 409 }
    );
  }
  if (target.role === "ADMIN" && (await countAdmins()) <= 1) {
    return Response.json(
      { error: "Impossible : c'est le dernier administrateur" },
      { status: 409 }
    );
  }

  const ok = await deleteUser(id);
  if (!ok) {
    return Response.json({ error: "Suppression impossible" }, { status: 400 });
  }
  return Response.json({ ok: true });
}
