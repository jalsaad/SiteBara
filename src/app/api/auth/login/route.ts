import { createSessionToken, sessionCookie } from "@/lib/auth";
import { authenticate } from "@/lib/users";
import { setPendingChallenge, verifyChallenge } from "@/lib/twofactor";
import { sendLoginCode } from "@/lib/email";

export async function POST(request: Request) {
  const { email, password, code, remember } = await request
    .json()
    .catch(() => ({}));

  // ── Étape 2 : vérification du code reçu par e-mail ──
  if (email && code !== undefined) {
    const normalized = String(email).trim().toLowerCase();
    const role = verifyChallenge(normalized, String(code));

    if (!role) {
      return Response.json(
        { error: "Code invalide ou expiré" },
        { status: 401 }
      );
    }

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

  const otp = setPendingChallenge(user.email, user.role);
  const mail = await sendLoginCode(user.email, otp);
  if (mail.status === "FAILED") {
    return Response.json(
      { error: "Impossible d'envoyer le code par e-mail. Contactez un administrateur." },
      { status: 502 }
    );
  }

  return Response.json({ challenge: true });
}
