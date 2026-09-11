// Vérification anti-spam Cloudflare Turnstile — CÔTÉ SERVEUR UNIQUEMENT.
//
// Sans TURNSTILE_SECRET_KEY configuré (mode démo/dev) : vérification
// ignorée, tout est accepté. Avec la clé : le jeton envoyé par le widget
// côté client est validé auprès de l'API Cloudflare avant d'accepter le
// formulaire.

import "server-only";

const SECRET = process.env.TURNSTILE_SECRET_KEY;

export async function verifyTurnstile(
  token: unknown,
  remoteIp?: string
): Promise<boolean> {
  if (!SECRET) return true; // mode démo/dev : pas de clé, pas de vérification
  if (typeof token !== "string" || !token) return false;

  try {
    const params = new URLSearchParams({ secret: SECRET, response: token });
    if (remoteIp) params.set("remoteip", remoteIp);
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: params }
    );
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch (e) {
    console.error("[turnstile] échec de la vérification :", e);
    return false;
  }
}
