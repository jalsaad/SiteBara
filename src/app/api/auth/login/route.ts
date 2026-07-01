import { createSessionToken, sessionCookie } from "@/lib/auth";
import { authenticate, getUserWithCodes, removeCode } from "@/lib/users";
import { setPendingChallenge, verifyChallenge } from "@/lib/twofactor";

// Connexion en deux temps :
//  1. e-mail + mot de passe → si OK, un chiffre (0–9) est retourné comme défi.
//  2. e-mail + code → si le code est dans la liste de l'utilisateur ET commence
//     par le chiffre demandé, la session est créée et le code consommé.
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

  const digit = setPendingChallenge(user.email, user.role);
  return Response.json({ challenge: true, digit });
}
