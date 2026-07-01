import { createSessionToken, sessionCookie } from "@/lib/auth";
import { authenticate, getUserWithCodes, removeCode } from "@/lib/users";
import { setPendingChallenge, verifyChallenge } from "@/lib/twofactor";

export async function POST(request: Request) {
  const { email, password, code, remember } = await request
    .json()
    .catch(() => ({}));

  // ── Étape 2 : vérification du code de la liste ──
  if (email && code !== undefined) {
    const normalized = String(email).trim().toLowerCase();
    const user = await getUserWithCodes(normalized);
    const role = user ? verifyChallenge(normalized, String(code)) : null;

    if (!role || !user || !user.codes.includes(String(code))) {
      return Response.json(
        { error: "Code invalide ou expiré" },
        { status: 401 }
      );
    }

    await removeCode(user.id, String(code));
    const token = await createSessionToken(normalized, role, !!remember);
    return Response.json(
      { email: normalized, role },
      { headers: { "Set-Cookie": sessionCookie(token, !!remember) } }
    );
  }

  // ── Étape 1 : identifiants ──
  if (!email || !password) {
    return Response.json(
      { error: "E-mail et mot de passe requis" },
      { status: 400 }
    );
  }
  const user = await authenticate(email, password);
  if (!user) {
    return Response.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  const userWithCodes = await getUserWithCodes(user.email);
  const digit = setPendingChallenge(
    user.email,
    user.role,
    userWithCodes?.codes ?? []
  );

  if (digit === null) {
    return Response.json(
      { noCodesLeft: true },
      { status: 403 }
    );
  }

  return Response.json({ challenge: true, digit });
}
