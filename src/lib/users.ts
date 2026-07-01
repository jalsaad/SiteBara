// Comptes d'administration — CÔTÉ SERVEUR UNIQUEMENT.
// Remplace les anciens comptes de démonstration codés en dur par le modèle
// `User` (en base via Prisma, ou magasin mémoire en mode démo).
//
// Mots de passe : jamais stockés en clair. Hachés avec scrypt (module natif
// node:crypto, aucune dépendance), au format `scrypt$<sel hex>$<hash hex>`.
//
// Bootstrap : si la table User est vide (premier démarrage en base) ou en mode
// démo, deux comptes par défaut sont semés à partir des variables ADMIN_PASSWORD
// / COMM_PASSWORD — à modifier/supprimer ensuite depuis /admin/utilisateurs.

import "server-only";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import type { Role } from "./auth";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  codes: string[];
  createdAt: string;
}

interface UserRow extends User {
  passwordHash: string;
}

/* ------------------------- hachage des mots de passe ------------------------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/* ---------------------------- comptes par défaut ---------------------------- */

const SEED: { email: string; name: string; role: Role; password: string; codes: string[] }[] = [
  {
    email: "admin@atheneejulesbara.be",
    name: "Administrateur",
    role: "ADMIN",
    password: process.env.ADMIN_PASSWORD ?? "admin2026",
    codes: [],
  },
  {
    email: "communication@atheneejulesbara.be",
    name: "Communication",
    role: "COMM",
    password: process.env.COMM_PASSWORD ?? "comm2026",
    codes: [],
  },
  {
    email: "cuisine@atheneejulesbara.be",
    name: "Cuisine",
    role: "CUISINE",
    password: process.env.CUISINE_PASSWORD ?? "cuisine2026",
    codes: [],
  },
];

function stripUser({ passwordHash: _omit, ...u }: UserRow): User {
  void _omit;
  return u;
}

/* ------------------------- magasin mémoire (mode démo) ------------------------- */

const g = globalThis as unknown as { __baraUsers?: UserRow[] };

function memStore(): UserRow[] {
  if (!g.__baraUsers) {
    g.__baraUsers = SEED.map((s, i) => ({
      id: `u${i + 1}`,
      email: s.email,
      name: s.name,
      role: s.role,
      codes: s.codes,
      passwordHash: hashPassword(s.password),
      createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    }));
  }
  return g.__baraUsers;
}

function memId(): string {
  return "u" + Math.random().toString(36).slice(2, 10);
}

/* ------------------------------ Prisma ------------------------------ */

const useDb = !!process.env.DATABASE_URL;

async function prisma() {
  const { PrismaClient } = await import("@/generated/prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const gp = globalThis as unknown as {
    __baraPrisma?: InstanceType<typeof PrismaClient>;
  };
  if (!gp.__baraPrisma) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    gp.__baraPrisma = new PrismaClient({ adapter });
  }
  return gp.__baraPrisma;
}

type PrismaUser = Omit<User, "createdAt"> & {
  passwordHash: string;
  codes: string[];
  createdAt: Date;
};

function fromDb(u: PrismaUser): UserRow {
  return { ...u, createdAt: u.createdAt.toISOString() };
}

// Sème les comptes par défaut si la table est vide (premier démarrage en base).
async function ensureSeeded() {
  const db = await prisma();
  if ((await db.user.count()) > 0) return;
  for (const s of SEED) {
    await db.user.create({
      data: {
        email: s.email,
        name: s.name,
        role: s.role,
        codes: { set: s.codes },
        passwordHash: hashPassword(s.password),
      },
    });
  }
}

/* ------------------------------- API ------------------------------- */

/** Vérifie les identifiants ; renvoie l'identité de session ou null. */
export async function authenticate(
  email: string,
  password: string
): Promise<{ email: string; role: Role } | null> {
  const normalized = email.trim().toLowerCase();
  if (useDb) {
    await ensureSeeded();
    const db = await prisma();
    const row = (await db.user.findUnique({
      where: { email: normalized },
    })) as PrismaUser | null;
    if (!row || !verifyPassword(password, row.passwordHash)) return null;
    return { email: row.email, role: row.role };
  }
  const row = memStore().find((u) => u.email.toLowerCase() === normalized);
  if (!row || !verifyPassword(password, row.passwordHash)) return null;
  return { email: row.email, role: row.role };
}

export async function listUsers(): Promise<User[]> {
  if (useDb) {
    await ensureSeeded();
    const db = await prisma();
    const rows = (await db.user.findMany({
      orderBy: { createdAt: "asc" },
    })) as PrismaUser[];
    return rows.map((r) => stripUser(fromDb(r)));
  }
  return memStore().map(stripUser);
}

export async function countAdmins(): Promise<number> {
  if (useDb) {
    const db = await prisma();
    return db.user.count({ where: { role: "ADMIN" } });
  }
  return memStore().filter((u) => u.role === "ADMIN").length;
}

/** Crée un compte. Renvoie null si l'e-mail est déjà utilisé. */
export async function createUser(input: {
  email: string;
  name: string;
  role: Role;
  password: string;
  codes?: string[];
}): Promise<User | null> {
  const email = input.email.trim().toLowerCase();
  if (useDb) {
    const db = await prisma();
    if (await db.user.findUnique({ where: { email } })) return null;
    const row = (await db.user.create({
      data: {
        email,
        name: input.name.trim(),
        role: input.role,
        codes: { set: input.codes ?? [] },
        passwordHash: hashPassword(input.password),
      } as never,
    })) as PrismaUser;
    return stripUser(fromDb(row));
  }
  const data = {
    email,
    name: input.name.trim(),
    role: input.role,
    codes: input.codes ?? [],
    passwordHash: hashPassword(input.password),
  };
  const store = memStore();
  if (store.some((u) => u.email.toLowerCase() === email)) return null;
  const row: UserRow = {
    id: memId(),
    email,
    name: data.name,
    role: data.role,
    codes: data.codes,
    passwordHash: data.passwordHash,
    createdAt: new Date().toISOString(),
  };
  store.push(row);
  return stripUser(row);
}

/** Met à jour le nom, le rôle, le mot de passe et/ou la liste de codes (e-mail immuable). */
export async function updateUser(
  id: string,
  input: { name?: string; role?: Role; password?: string; codes?: string[] }
): Promise<User | null> {
  // Données communes aux deux chemins (memStore + DB)
  const name    = input.name !== undefined ? input.name.trim() : undefined;
  const role    = input.role;
  const pwHash  = input.password ? hashPassword(input.password) : undefined;
  const codes   = input.codes;

  if (useDb) {
    const db = await prisma();
    // Prisma 7 : les champs tableau PostgreSQL exigent { set: [...] }
    const dbData: Record<string, unknown> = {};
    if (name    !== undefined) dbData.name         = name;
    if (role    !== undefined) dbData.role         = role;
    if (pwHash  !== undefined) dbData.passwordHash = pwHash;
    if (codes   !== undefined) dbData.codes        = { set: codes };
    try {
      const row = (await db.user.update({ where: { id }, data: dbData as never })) as PrismaUser;
      return stripUser(fromDb(row));
    } catch {
      return null;
    }
  }
  const row = memStore().find((u) => u.id === id);
  if (!row) return null;
  if (name   !== undefined) row.name         = name;
  if (role   !== undefined) row.role         = role;
  if (pwHash !== undefined) row.passwordHash = pwHash;
  if (codes  !== undefined) row.codes        = codes;
  return stripUser(row);
}

export async function deleteUser(id: string): Promise<boolean> {
  if (useDb) {
    const db = await prisma();
    try {
      await db.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  const store = memStore();
  const i = store.findIndex((u) => u.id === id);
  if (i === -1) return false;
  store.splice(i, 1);
  return true;
}

export async function getUser(id: string): Promise<User | null> {
  if (useDb) {
    const db = await prisma();
    const row = (await db.user.findUnique({ where: { id } })) as PrismaUser | null;
    return row ? stripUser(fromDb(row)) : null;
  }
  return memStore().map(stripUser).find((u) => u.id === id) ?? null;
}

/** Retourne l'utilisateur avec sa liste de codes (pour la vérification au login). */
export async function getUserWithCodes(
  email: string
): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  if (useDb) {
    await ensureSeeded();
    const db = await prisma();
    const row = (await db.user.findUnique({ where: { email: normalized } })) as PrismaUser | null;
    return row ? stripUser(fromDb(row)) : null;
  }
  return memStore().map(stripUser).find((u) => u.email === normalized) ?? null;
}

/** Supprime un code de la liste de l'utilisateur (usage unique après vérification). */
export async function removeCode(id: string, code: string): Promise<void> {
  if (useDb) {
    const db = await prisma();
    const row = (await db.user.findUnique({ where: { id } })) as PrismaUser | null;
    if (!row) return;
    await db.user.update({
      where: { id },
      data: { codes: { set: row.codes.filter((c) => c !== code) } } as never,
    });
    return;
  }
  const row = memStore().find((u) => u.id === id);
  if (row) row.codes = row.codes.filter((c) => c !== code);
}
