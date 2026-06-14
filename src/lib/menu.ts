// Menus de la semaine du restaurant scolaire — CÔTÉ SERVEUR UNIQUEMENT.
//
// Le chef cuisinier (rôle CUISINE) gère PLUSIEURS semaines depuis /admin/menu.
// Chaque semaine est datée (`weekStart` = le lundi) ; la page publique
// /restaurant affiche la semaine en cours et les suivantes.
//
// Persistance Prisma si DATABASE_URL est défini, sinon magasin mémoire (démo).

import "server-only";

export interface MenuDay {
  day: string;
  potage: string;
  plat: string;
  veggie: string;
  dessert: string;
}

export interface WeeklyMenu {
  id: string;
  weekStart: string; // AAAA-MM-JJ (lundi)
  weekLabel: string; // libellé manuel facultatif
  label: string; // libellé d'affichage (weekLabel sinon dérivé de weekStart)
  days: MenuDay[];
  updatedAt: string;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

function emptyDay(day: string): MenuDay {
  return { day, potage: "", plat: "", veggie: "", dessert: "" };
}

function emptyDays(): MenuDay[] {
  return DAYS.map(emptyDay);
}

/* ------------------------------ dates ------------------------------ */

/** Aujourd'hui au format AAAA-MM-JJ (fuseau local). */
function todayISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

/** Décale une date ISO (AAAA-MM-JJ) de n jours, renvoie une date ISO. */
function addDaysISO(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Libellé « Semaine du 16 au 20 juin » dérivé du lundi. */
export function defaultLabel(weekStart: string): string {
  if (!weekStart) return "Semaine";
  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(weekStart + "T12:00:00");
  end.setDate(end.getDate() + 4);
  const dm = (d: Date) =>
    d.toLocaleDateString("fr-BE", { day: "numeric", month: "long" });
  const startStr =
    start.getMonth() === end.getMonth() ? String(start.getDate()) : dm(start);
  return `Semaine du ${startStr} au ${dm(end)}`;
}

/** Lundi de la semaine en cours (utile pour amorcer une nouvelle semaine). */
export function currentMonday(): string {
  const n = new Date();
  const dow = (n.getDay() + 6) % 7; // 0 = lundi
  return addDaysISO(todayISO(), -dow);
}

/* ---------------------------- normalisation ---------------------------- */

function normalizeDays(days: unknown): MenuDay[] {
  const list = Array.isArray(days) ? (days as Partial<MenuDay>[]) : [];
  return DAYS.map((day, i) => {
    const d = list[i] ?? {};
    return {
      day,
      potage: typeof d.potage === "string" ? d.potage.trim() : "",
      plat: typeof d.plat === "string" ? d.plat.trim() : "",
      veggie: typeof d.veggie === "string" ? d.veggie.trim() : "",
      dessert: typeof d.dessert === "string" ? d.dessert.trim() : "",
    };
  });
}

function normalizeWeekStart(value: unknown): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  return currentMonday();
}

interface MenuRecord {
  id: string;
  weekStart: string;
  weekLabel: string;
  days: MenuDay[];
  updatedAt: string;
}

function decorate(m: MenuRecord): WeeklyMenu {
  return { ...m, label: m.weekLabel.trim() || defaultLabel(m.weekStart) };
}

/* ------------------------- magasin mémoire (mode démo) ------------------------- */

const g = globalThis as unknown as { __baraMenus?: MenuRecord[] };

function seed(): MenuRecord[] {
  const now = new Date().toISOString();
  return [
    {
      id: "m1",
      weekStart: currentMonday(),
      weekLabel: "",
      days: [
        { day: "Lundi", potage: "Velouté de potiron", plat: "Boulettes sauce tomate, purée maison", veggie: "Boulettes végétales, purée maison", dessert: "Compote de pommes" },
        { day: "Mardi", potage: "Julienne de légumes", plat: "Filet de poulet, riz, ratatouille", veggie: "Curry de pois chiches, riz", dessert: "Yaourt nature" },
        { day: "Mercredi", potage: "Tomate-basilic", plat: "Spaghetti bolognaise", veggie: "Spaghetti aux lentilles", dessert: "Fruit de saison" },
        { day: "Jeudi", potage: "Poireaux-pommes de terre", plat: "Poisson pané, frites, salade", veggie: "Galette de légumes, frites, salade", dessert: "Mousse au chocolat" },
        { day: "Vendredi", potage: "Carottes-coriandre", plat: "Gratin de chou-fleur, jambon", veggie: "Gratin de chou-fleur (sans jambon)", dessert: "Salade de fruits" },
      ],
      updatedAt: now,
    },
    {
      id: "m2",
      weekStart: addDaysISO(currentMonday(), 7),
      weekLabel: "",
      days: [
        { day: "Lundi", potage: "Velouté de courgettes", plat: "Hachis Parmentier", veggie: "Hachis végétal aux lentilles", dessert: "Yaourt aux fruits" },
        { day: "Mardi", potage: "Potage au cresson", plat: "Chili con carne, riz", veggie: "Chili sin carne, riz", dessert: "Compote de poires" },
        { day: "Mercredi", potage: "Soupe à la tomate", plat: "Vol-au-vent, frites", veggie: "Quiche aux légumes, frites", dessert: "Fruit de saison" },
        { day: "Jeudi", potage: "Velouté de carottes", plat: "Émincé de dinde, pâtes, brocolis", veggie: "Boulettes de pois chiches, pâtes", dessert: "Riz au lait" },
        { day: "Vendredi", potage: "Soupe de potiron", plat: "Filet de poisson sauce citron, purée", veggie: "Gratin de légumes, purée", dessert: "Salade de fruits" },
      ],
      updatedAt: now,
    },
  ];
}

function memStore(): MenuRecord[] {
  if (!g.__baraMenus) g.__baraMenus = seed();
  return g.__baraMenus;
}

function memId(): string {
  return "m" + Math.random().toString(36).slice(2, 10);
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
  id: string;
  weekStart: Date;
  weekLabel: string;
  days: unknown;
  updatedAt: Date;
}

function fromDb(r: MenuRow): MenuRecord {
  return {
    id: r.id,
    weekStart: r.weekStart.toISOString().slice(0, 10),
    weekLabel: r.weekLabel,
    days: normalizeDays(r.days),
    updatedAt: r.updatedAt.toISOString(),
  };
}

async function ensureSeeded() {
  const db = await prisma();
  if ((await db.weeklyMenu.count()) > 0) return;
  for (const s of seed()) {
    await db.weeklyMenu.create({
      data: { weekStart: new Date(s.weekStart + "T00:00:00Z"), weekLabel: s.weekLabel, days: s.days } as never,
    });
  }
}

/* ------------------------------- API ------------------------------- */

/** Toutes les semaines, de la plus ancienne à la plus récente (gestion admin). */
export async function listMenus(): Promise<WeeklyMenu[]> {
  if (useDb) {
    await ensureSeeded();
    const db = await prisma();
    const rows = (await db.weeklyMenu.findMany({
      orderBy: { weekStart: "asc" },
    })) as MenuRow[];
    return rows.map((r) => decorate(fromDb(r)));
  }
  return [...memStore()]
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .map(decorate);
}

/** Semaines visibles publiquement : la semaine en cours et les suivantes. */
export async function getPublicMenus(): Promise<WeeklyMenu[]> {
  const cutoff = addDaysISO(todayISO(), -6); // garde une semaine jusqu'à son dimanche
  const all = await listMenus();
  return all.filter((m) => m.weekStart >= cutoff);
}

export async function getMenu(id: string): Promise<WeeklyMenu | null> {
  if (useDb) {
    const db = await prisma();
    const row = (await db.weeklyMenu.findUnique({ where: { id } })) as MenuRow | null;
    return row ? decorate(fromDb(row)) : null;
  }
  const row = memStore().find((m) => m.id === id);
  return row ? decorate(row) : null;
}

export async function createMenu(input: {
  weekStart: unknown;
  weekLabel?: unknown;
  days?: unknown;
}): Promise<WeeklyMenu> {
  const weekStart = normalizeWeekStart(input.weekStart);
  const weekLabel = typeof input.weekLabel === "string" ? input.weekLabel.trim() : "";
  const days = input.days === undefined ? emptyDays() : normalizeDays(input.days);
  if (useDb) {
    const db = await prisma();
    const row = (await db.weeklyMenu.create({
      data: { weekStart: new Date(weekStart + "T00:00:00Z"), weekLabel, days } as never,
    })) as MenuRow;
    return decorate(fromDb(row));
  }
  const rec: MenuRecord = { id: memId(), weekStart, weekLabel, days, updatedAt: new Date().toISOString() };
  memStore().push(rec);
  return decorate(rec);
}

export async function updateMenu(
  id: string,
  input: { weekStart?: unknown; weekLabel?: unknown; days?: unknown }
): Promise<WeeklyMenu | null> {
  const data: Partial<Pick<MenuRecord, "weekStart" | "weekLabel" | "days">> = {};
  if (input.weekStart !== undefined) data.weekStart = normalizeWeekStart(input.weekStart);
  if (input.weekLabel !== undefined)
    data.weekLabel = typeof input.weekLabel === "string" ? input.weekLabel.trim() : "";
  if (input.days !== undefined) data.days = normalizeDays(input.days);
  if (useDb) {
    const db = await prisma();
    try {
      const row = (await db.weeklyMenu.update({
        where: { id },
        data: {
          ...(data.weekStart ? { weekStart: new Date(data.weekStart + "T00:00:00Z") } : {}),
          ...(data.weekLabel !== undefined ? { weekLabel: data.weekLabel } : {}),
          ...(data.days ? { days: data.days } : {}),
        } as never,
      })) as MenuRow;
      return decorate(fromDb(row));
    } catch {
      return null;
    }
  }
  const row = memStore().find((m) => m.id === id);
  if (!row) return null;
  if (data.weekStart !== undefined) row.weekStart = data.weekStart;
  if (data.weekLabel !== undefined) row.weekLabel = data.weekLabel;
  if (data.days !== undefined) row.days = data.days;
  row.updatedAt = new Date().toISOString();
  return decorate(row);
}

export async function deleteMenu(id: string): Promise<boolean> {
  if (useDb) {
    const db = await prisma();
    try {
      await db.weeklyMenu.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  const store = memStore();
  const i = store.findIndex((m) => m.id === id);
  if (i === -1) return false;
  store.splice(i, 1);
  return true;
}

export { DAYS, emptyDay, emptyDays };
