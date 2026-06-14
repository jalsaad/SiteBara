import { createSessionToken, sessionCookie } from "@/lib/auth";
import { authenticate } from "@/lib/users";
import { generateCode, setPendingCode, verifyPendingCode } from "@/lib/twofactor";
import { sendLoginCode } from "@/lib/email";

// Connexion en deux temps :
//  1. e-mail + mot de passe → si OK, un code à 6 chiffres est envoyé par e-mail
//     (aucune session n'est encore ouverte) ; réponse { twoFactor: true }.
//  2. e-mail + code → si OK, la session est créée et le cookie posé.
export async function POST(request: Request) {
  const { email, password, code, remember } = await request
    .json()
    .catch(() => ({}));

  // ── Étape 2 : vérification du code de double authentification ──
  if (email && code) {
    const role = verifyPendingCode(email, code);
    if (!role) {
      return Response.json(
        { error: "Code invalide ou expiré" },
        { status: 401 }
      );
    }
    const normalized = String(email).trim().toLowerCase();
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

  const otp = generateCode();
  setPendingCode(user.email, user.role, otp);
  const mail = await sendLoginCode(user.email, otp);

  return Response.json({ twoFactor: true, delivery: mail.status });
}
