// Menu de la semaine du restaurant scolaire — CÔTÉ SERVEUR UNIQUEMENT.
//
// Géré par le chef cuisinier (rôle CUISINE) depuis /admin/menu, affiché sur la
// page publique /restaurant. Un seul menu « courant » est conservé.
//
// Comme le reste de l'app : persistance Prisma si DATABASE_URL est défini,
// sinon magasin mémoire (mode démo) initialisé avec un menu d'exemple.

import "server-only";

export interface MenuDay {
  day: string;
  potage: string;
  plat: string;
  veggie: string;
  dessert: string;
}

export interface WeeklyMenu {
  weekLabel: string;
  days: MenuDay[];
  updatedAt: string;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

function emptyDay(day: string): MenuDay {
  return { day, potage: "", plat: "", veggie: "", dessert: "" };
}

/** Menu d'exemple servant d'amorce (premier démarrage / mode démo). */
const SEED: WeeklyMenu = {
  weekLabel: "",
  days: [
    { day: "Lundi", potage: "Velouté de potiron", plat: "Boulettes sauce tomate, purée maison", veggie: "Boulettes végétales, purée maison", dessert: "Compote de pommes" },
    { day: "Mardi", potage: "Julienne de légumes", plat: "Filet de poulet, riz, ratatouille", veggie: "Curry de pois chiches, riz", dessert: "Yaourt nature" },
    { day: "Mercredi", potage: "Tomate-basilic", plat: "Spaghetti bolognaise", veggie: "Spaghetti aux lentilles", dessert: "Fruit de saison" },
    { day: "Jeudi", potage: "Poireaux-pommes de terre", plat: "Poisson pané, frites, salade", veggie: "Galette de légumes, frites, salade", dessert: "Mousse au chocolat" },
    { day: "Vendredi", potage: "Carottes-coriandre", plat: "Gratin de chou-fleur, jambon", veggie: "Gratin de chou-fleur (sans jambon)", dessert: "Salade de fruits" },
  ],
  updatedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
};

/** Normalise une entrée arbitraire vers exactement 5 jours (Lundi→Vendredi). */
function normalize(weekLabel: unknown, days: unknown): Omit<WeeklyMenu, "updatedAt"> {
  const list = Array.isArray(days) ? (days as Partial<MenuDay>[]) : [];
  return {
    weekLabel: typeof weekLabel === "string" ? weekLabel.trim() : "",
    days: DAYS.map((day, i) => {
      const d = list[i] ?? {};
      return {
        day,
        potage: typeof d.potage === "string" ? d.potage.trim() : "",
        plat: typeof d.plat === "string" ? d.plat.trim() : "",
        veggie: typeof d.veggie === "string" ? d.veggie.trim() : "",
        dessert: typeof d.dessert === "string" ? d.dessert.trim() : "",
      };
    }),
  };
}

/* ------------------------- magasin mémoire (mode démo) ------------------------- */

const g = globalThis as unknown as { __baraMenu?: WeeklyMenu };

function memStore(): WeeklyMenu {
  if (!g.__baraMenu) g.__baraMenu = { ...SEED, days: SEED.days.map((d) => ({ ...d })) };
  return g.__baraMenu;
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
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    gp.__baraPrisma = new PrismaClient({ adapter });
  }
  return gp.__baraPrisma;
}

interface MenuRow {
  weekLabel: string;
  days: unknown;
  updatedAt: Date;
}

/* ------------------------------- API ------------------------------- */

/** Renvoie le menu courant (amorcé avec l'exemple s'il n'en existe pas encore). */
export async function getMenu(): Promise<WeeklyMenu> {
  if (useDb) {
    const db = await prisma();
    const row = (await db.weeklyMenu.findFirst({
      orderBy: { updatedAt: "desc" },
    })) as MenuRow | null;
    if (!row) {
      const created = (await db.weeklyMenu.create({
        data: { weekLabel: SEED.weekLabel, days: SEED.days } as never,
      })) as MenuRow;
      return { ...normalize(created.weekLabel, created.days), updatedAt: created.updatedAt.toISOString() };
    }
    return { ...normalize(row.weekLabel, row.days), updatedAt: row.updatedAt.toISOString() };
  }
  const m = memStore();
  return { ...m, days: m.days.map((d) => ({ ...d })) };
}

/** Remplace le menu courant. */
export async function saveMenu(input: { weekLabel: unknown; days: unknown }): Promise<WeeklyMenu> {
  const clean = normalize(input.weekLabel, input.days);
  if (useDb) {
    const db = await prisma();
    const existing = (await db.weeklyMenu.findFirst()) as { id: string } | null;
    const row = (existing
      ? await db.weeklyMenu.update({ where: { id: existing.id }, data: clean as never })
      : await db.weeklyMenu.create({ data: clean as never })) as MenuRow;
    return { ...normalize(row.weekLabel, row.days), updatedAt: row.updatedAt.toISOString() };
  }
  g.__baraMenu = { ...clean, updatedAt: new Date().toISOString() };
  return { ...g.__baraMenu, days: g.__baraMenu.days.map((d) => ({ ...d })) };
}

export { DAYS, emptyDay };
