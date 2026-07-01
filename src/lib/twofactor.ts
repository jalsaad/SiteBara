// Authentification par liste de codes prédéfinis — CÔTÉ SERVEUR.
//
// Après vérification du mot de passe, un chiffre aléatoire (0–9) est tiré.
// L'admin doit saisir n'importe quel code de sa liste commençant par ce chiffre.
// La vérification de l'existence dans la liste est faite dans le route login.

import "server-only";
import { randomInt } from "node:crypto";
import type { Role } from "./auth";

interface PendingChallenge {
  digit: number;
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

/**
 * Génère un challenge à partir des premières lettres des codes disponibles.
 * Retourne le chiffre requis, ou null si la liste de codes est vide.
 */
export function setPendingChallenge(
  email: string,
  role: Role,
  availableCodes: string[]
): number | null {
  const digits = [...new Set(
    availableCodes.map((c) => c[0]).filter((ch) => /\d/.test(ch))
  )].map(Number);
  if (digits.length === 0) return null;
  const digit = digits[randomInt(0, digits.length)];
  store().set(key(email), {
    digit,
    role,
    expires: Date.now() + CHALLENGE_TTL_MS,
    attempts: 0,
  });
  return digit;
}

/**
 * Vérifie que le code soumis commence par le chiffre attendu.
 * Retourne le rôle si le challenge est valide, null sinon.
 * Ne vérifie PAS que le code est dans la liste de l'utilisateur — c'est fait
 * dans le route /api/auth/login.
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
  if (!code.startsWith(String(pending.digit))) return null;
  store().delete(k);
  return pending.role;
}
