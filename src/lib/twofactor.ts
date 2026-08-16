// Authentification par code à usage unique envoyé par e-mail — CÔTÉ SERVEUR.
//
// Après vérification du mot de passe, un code à 6 chiffres est généré et
// envoyé par e-mail à l'utilisateur (voir lib/email.ts). Il doit le saisir
// pour terminer la connexion.

import "server-only";
import { randomInt } from "node:crypto";
import type { Role } from "./auth";

interface PendingChallenge {
  code: string;
  role: Role;
  expires: number;
  attempts: number;
}

const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const g = globalThis as unknown as {
  __baraLoginChallenges?: Map<string, PendingChallenge>;
};

function store(): Map<string, PendingChallenge> {
  return (g.__baraLoginChallenges ??= new Map());
}

function key(email: string): string {
  return email.trim().toLowerCase();
}

/** Génère un code à 6 chiffres et l'associe à l'e-mail pour vérification. */
export function setPendingChallenge(email: string, role: Role): string {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  store().set(key(email), {
    code,
    role,
    expires: Date.now() + CHALLENGE_TTL_MS,
    attempts: 0,
  });
  return code;
}

/**
 * Vérifie le code reçu par e-mail.
 * Retourne le rôle si le code est valide, null sinon.
 */
export function verifyChallenge(email: string, code: string): Role | null {
  const k = key(email);
  const pending = store().get(k);
  if (!pending) return null;
  if (Date.now() > pending.expires) {
    store().delete(k);
    return null;
  }
  if (++pending.attempts > MAX_ATTEMPTS) {
    store().delete(k);
    return null;
  }
  if (code.trim() !== pending.code) return null;
  store().delete(k);
  return pending.role;
}
