// Double authentification de connexion par code à usage unique — CÔTÉ SERVEUR.
//
// Après vérification du mot de passe, un code à 6 chiffres est généré, envoyé
// par e-mail (voir `sendLoginCode` dans `@/lib/email`) et conservé ici en
// mémoire (haché, jamais en clair) le temps que l'utilisateur le saisisse.
//
// Le magasin vit dans `globalThis` : il survit au hot-reload en dev et tient
// sur un serveur Node persistant (cible d'hébergement du projet). Les codes
// sont éphémères (10 min) : une perte au redémarrage oblige simplement à
// recommencer la connexion.

import "server-only";
import { randomInt, createHash, timingSafeEqual } from "node:crypto";
import type { Role } from "./auth";

interface PendingCode {
  codeHash: string;
  role: Role;
  expires: number; // epoch ms
  attempts: number;
}

const CODE_TTL_MS = 10 * 60 * 1000; // 10 min
const MAX_ATTEMPTS = 5;

const g = globalThis as unknown as { __baraLoginCodes?: Map<string, PendingCode> };

function store(): Map<string, PendingCode> {
  return (g.__baraLoginCodes ??= new Map());
}

function key(email: string): string {
  return email.trim().toLowerCase();
}

function hash(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/** Génère un code à 6 chiffres (zéros de tête conservés). */
export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Mémorise (haché) le code attendu pour un e-mail, en écrasant tout code en cours. */
export function setPendingCode(email: string, role: Role, code: string): void {
  store().set(key(email), {
    codeHash: hash(code),
    role,
    expires: Date.now() + CODE_TTL_MS,
    attempts: 0,
  });
}

/**
 * Vérifie le code saisi. Renvoie le rôle si valide (et consomme le code),
 * sinon null. Le code est invalidé après expiration ou trop d'essais.
 */
export function verifyPendingCode(email: string, code: string): Role | null {
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
  const given = Buffer.from(hash(code));
  const expected = Buffer.from(pending.codeHash);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }
  store().delete(k); // usage unique
  return pending.role;
}
