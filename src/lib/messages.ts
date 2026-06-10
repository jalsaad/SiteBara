// Messages de contact et préinscriptions — CÔTÉ SERVEUR UNIQUEMENT.
// Prisma si DATABASE_URL, sinon magasin mémoire (mode démo).

import "server-only";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
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
}

const g = globalThis as unknown as {
  __baraContacts?: ContactMessage[];
  __baraPrereg?: PreRegistration[];
};

function id(): string {
  return "m" + Math.random().toString(36).slice(2, 10);
}

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

/* --------------------------- contact --------------------------- */

export async function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ContactMessage> {
  if (useDb) {
    const db = await prisma();
    const row = await db.contactMessage.create({ data: input });
    return { ...row, createdAt: row.createdAt.toISOString() };
  }
  if (!g.__baraContacts) g.__baraContacts = [];
  const msg: ContactMessage = {
    id: id(),
    ...input,
    createdAt: new Date().toISOString(),
  };
  g.__baraContacts.unshift(msg);
  return msg;
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  if (useDb) {
    const db = await prisma();
    const rows = await db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  }
  return g.__baraContacts ?? [];
}

/* ------------------------ préinscription ------------------------ */

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
    return { ...row, createdAt: row.createdAt.toISOString() };
  }
  if (!g.__baraPrereg) g.__baraPrereg = [];
  const reg: PreRegistration = {
    id: id(),
    lastName: input.lastName,
    firstName: input.firstName,
    email: input.email,
    phone: input.phone ?? null,
    level: input.level,
    message: input.message ?? null,
    createdAt: new Date().toISOString(),
  };
  g.__baraPrereg.unshift(reg);
  return reg;
}

export async function listPreRegistrations(): Promise<PreRegistration[]> {
  if (useDb) {
    const db = await prisma();
    const rows = await db.preRegistration.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  }
  return g.__baraPrereg ?? [];
}
