// Messages de contact et préinscriptions — CÔTÉ SERVEUR UNIQUEMENT.
// Prisma si DATABASE_URL, sinon persistance fichier data/messages.json.

import "server-only";
import fs from "fs";
import path from "path";

export type MessageStatus = "active" | "archived" | "trash";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: MessageStatus;
}

export interface PreRegistration {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string | null;
  level: string;
  message: string | null;
  createdAt: string;
  status: MessageStatus;
}

interface Store {
  contacts: ContactMessage[];
  preregs: PreRegistration[];
}

/* ─────────── persistance fichier ─────────── */

const DATA_FILE = path.join(process.cwd(), "data", "messages.json");

const g = globalThis as unknown as { __baraMessages?: Store };

function memStore(): Store {
  if (!g.__baraMessages) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw) as Store;
      // migration : ajoute status manquant sur anciens enregistrements
      parsed.contacts = (parsed.contacts ?? []).map((m) => ({
        ...m,
        status: m.status ?? "active",
      }));
      parsed.preregs = (parsed.preregs ?? []).map((m) => ({
        ...m,
        status: m.status ?? "active",
      }));
      g.__baraMessages = parsed;
    } catch {
      g.__baraMessages = { contacts: [], preregs: [] };
      saveStore(g.__baraMessages);
    }
  }
  return g.__baraMessages!;
}

function saveStore(store: Store): void {
  g.__baraMessages = store;
  const data = JSON.stringify(store, null, 2);
  fs.promises
    .mkdir(path.dirname(DATA_FILE), { recursive: true })
    .then(() => fs.promises.writeFile(DATA_FILE, data, "utf8"))
    .catch((e) => console.error("[messages] Impossible de sauvegarder messages.json :", e));
}

function newId(): string {
  return "m" + Math.random().toString(36).slice(2, 10);
}

/* ─────────── Prisma (si DATABASE_URL) ─────────── */

const useDb = !!process.env.DATABASE_URL;

async function prisma() {
  const { PrismaClient } = await import("@/generated/prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const gp = globalThis as unknown as {
    __baraPrisma?: InstanceType<typeof PrismaClient>;
  };
  if (!gp.__baraPrisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    gp.__baraPrisma = new PrismaClient({ adapter });
  }
  return gp.__baraPrisma;
}

/* ═══════════════ contact ═══════════════ */

export async function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ContactMessage> {
  if (useDb) {
    const db = await prisma();
    const row = await db.contactMessage.create({ data: input });
    return { ...row, createdAt: row.createdAt.toISOString(), status: "active" };
  }
  const store = memStore();
  const msg: ContactMessage = {
    id: newId(),
    ...input,
    createdAt: new Date().toISOString(),
    status: "active",
  };
  store.contacts.unshift(msg);
  saveStore(store);
  return msg;
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  if (useDb) {
    const db = await prisma();
    const rows = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), status: "active" as MessageStatus }));
  }
  return memStore().contacts;
}

export async function updateContactStatus(id: string, status: MessageStatus): Promise<boolean> {
  const store = memStore();
  const msg = store.contacts.find((m) => m.id === id);
  if (!msg) return false;
  msg.status = status;
  saveStore(store);
  return true;
}

export async function deleteContactForever(id: string): Promise<boolean> {
  const store = memStore();
  const idx = store.contacts.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  store.contacts.splice(idx, 1);
  saveStore(store);
  return true;
}

/* ═══════════════ préinscription ═══════════════ */

export async function createPreRegistration(input: {
  lastName: string;
  firstName: string;
  email: string;
  phone?: string;
  level: string;
  message?: string;
}): Promise<PreRegistration> {
  if (useDb) {
    const db = await prisma();
    const row = await db.preRegistration.create({
      data: {
        lastName: input.lastName,
        firstName: input.firstName,
        email: input.email,
        phone: input.phone ?? null,
        level: input.level,
        message: input.message ?? null,
      },
    });
    return { ...row, createdAt: row.createdAt.toISOString(), status: "active" };
  }
  const store = memStore();
  const reg: PreRegistration = {
    id: newId(),
    lastName: input.lastName,
    firstName: input.firstName,
    email: input.email,
    phone: input.phone ?? null,
    level: input.level,
    message: input.message ?? null,
    createdAt: new Date().toISOString(),
    status: "active",
  };
  store.preregs.unshift(reg);
  saveStore(store);
  return reg;
}

export async function listPreRegistrations(): Promise<PreRegistration[]> {
  if (useDb) {
    const db = await prisma();
    const rows = await db.preRegistration.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), status: "active" as MessageStatus }));
  }
  return memStore().preregs;
}

export async function updatePreRegStatus(id: string, status: MessageStatus): Promise<boolean> {
  const store = memStore();
  const reg = store.preregs.find((m) => m.id === id);
  if (!reg) return false;
  reg.status = status;
  saveStore(store);
  return true;
}

export async function deletePreRegForever(id: string): Promise<boolean> {
  const store = memStore();
  const idx = store.preregs.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  store.preregs.splice(idx, 1);
  saveStore(store);
  return true;
}
