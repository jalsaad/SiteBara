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
  return { day, potage: "", plat: "", dessert: "" };
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
  const w = (id: string, weekStart: string, days: Omit<MenuDay, never>[]) =>
    ({ id, weekStart, weekLabel: "", days, updatedAt: now }) satisfies MenuRecord;
  const e = (day: string): MenuDay => ({ day, potage: "", plat: "", dessert: "" });
  return [
    w("w01", "2026-08-24", [
      { day: "Lundi",    potage: "Potage cultivateur", plat: "Spaghetti bolognaise", dessert: "Biscuit" },
      { day: "Mardi",    potage: "Potage carotte", plat: "Sandwich / Hachis parmentier aux carottes", dessert: "Muffins choco" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage tomate", plat: "Américain, salade, crudités, frites", dessert: "Ananas, raisin" },
      { day: "Vendredi", potage: "Potage poireaux", plat: "Cordon bleu, ratatouille niçoise, riz", dessert: "Yaourt fraise" },
    ]),
    w("w02", "2026-08-31", [
      { day: "Lundi",    potage: "Potage cerfeuil", plat: "Spaghetti bolognaise", dessert: "Biscuit" },
      { day: "Mardi",    potage: "Potage céleri", plat: "Saucisse sauce brune, pois et carottes, purée", dessert: "Pâtisserie" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage asperge", plat: "Pita de porc, salade, frites", dessert: "Glace" },
      { day: "Vendredi", potage: "Potage chicken", plat: "Filet de poisson pané, sauce béarnaise, tomate suisse, PDT", dessert: "Mousse chocolat" },
    ]),
    w("w03", "2026-09-07", [
      { day: "Lundi",    potage: "Potage carotte", plat: "Chipolata, compote de pommes, PDT nature", dessert: "Flan caramel" },
      { day: "Mardi",    potage: "Potage courgettes", plat: "Pain de viande sauce poivre, haricots verts, purée", dessert: "Pâtisserie" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage tomate", plat: "Pêche au thon, frites", dessert: "Fruit" },
      { day: "Vendredi", potage: "Potage Dubarry", plat: "Couscous, poulet-merguez", dessert: "Biscuit" },
    ]),
    w("w04", "2026-09-14", [
      { day: "Lundi",    potage: "Potage minestrone", plat: "Macaroni jambon fromage", dessert: "Yaourt grec, framboises" },
      { day: "Mardi",    potage: "Potage Saint-Germain", plat: "Hachis parmentier aux carottes", dessert: "Pâtisserie" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage parisien", plat: "Boulette sauce tomate, salade, frites", dessert: "Fruit" },
      { day: "Vendredi", potage: "Potage chicken", plat: "Blanquette de veau à l'ancienne, riz", dessert: "Crêpes" },
    ]),
    w("w05", "2026-09-21", [
      { day: "Lundi",    potage: "Potage courgettes", plat: "Steak haché de porc, chou-fleur au gratin, purée", dessert: "Biscuit" },
      { day: "Mardi",    potage: "Potage cresson", plat: "Lasagnes", dessert: "Pâtisserie" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage tomate", plat: "Escalope de poulet croustillante, salade, frites", dessert: "Fruit" },
      { day: "Vendredi", potage: "Potage céleri", plat: "Omelette au fromage, haricots verts, PDT persillée", dessert: "Donuts" },
    ]),
    w("w06", "2026-09-28", [
      { day: "Lundi",    potage: "Potage minestrone", plat: "Spaghetti carbonara", dessert: "Chocolat liégeois" },
      { day: "Mardi",    potage: "Potage poireaux", plat: "Poupiette ardennaise, sauce poivre, salade, PDT mousseline", dessert: "Pâtisserie" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage carotte", plat: "Tomate farcie, frites", dessert: "Glace" },
      { day: "Vendredi", potage: "Potage cerfeuil", plat: "Chicon au gratin, PDT", dessert: "Boule de Berlin" },
    ]),
    w("w07", "2026-10-05", [
      { day: "Lundi",    potage: "Potage brocoli", plat: "Hachis parmentier", dessert: "Biscuit" },
      { day: "Mardi",    potage: "Potage chicon", plat: "Couscous, poulet-merguez", dessert: "Pâtisserie" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage asperge", plat: "Boulette liégeoise, salade, frites", dessert: "Fruit" },
      { day: "Vendredi", potage: "Potage tomate", plat: "Filet de colin pané, brocoli sauce blanche, PDT", dessert: "Glace" },
    ]),
    w("w08", "2026-10-12", [
      { day: "Lundi",    potage: "Potage poireaux", plat: "Steak haché de bœuf, carottes au beurre, gratin dauphinois", dessert: "Mousse chocolat" },
      { day: "Mardi",    potage: "Potage chicken", plat: "Vol-au-vent champignons, PDT en cubes", dessert: "Pâtisserie" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage cerfeuil", plat: "Boudin blanc sauce brune, compote ou salade, frites", dessert: "Fruits" },
      { day: "Vendredi", potage: "Potage tomate", plat: "Lasagnes", dessert: "Salade de fruits" },
    ]),
    w("w09", "2026-11-02", [
      e("Lundi"),
      { day: "Mardi",    potage: "Potage asperge", plat: "Paella au poulet", dessert: "Pâtisserie" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage poireaux", plat: "Filet américain, salade, frites", dessert: "Fruit" },
      { day: "Vendredi", potage: "Potage tomate", plat: "Dos de cabillaud, épinards à la crème, riz", dessert: "Crêpe" },
    ]),
    w("w10", "2026-11-09", [
      { day: "Lundi",    potage: "Potage cultivateur", plat: "Spaghetti bolognaise", dessert: "Biscuit" },
      { day: "Mardi",    potage: "Potage carotte", plat: "Oiseau sans tête, sauce brune, pois et carottes, purée", dessert: "Pâtisserie" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage brocoli", plat: "Chipolata, pêche au sirop et salade, frites", dessert: "Salade de fruits" },
      { day: "Vendredi", potage: "Potage cerfeuil", plat: "Saucisse sauce moutarde, poireaux à la crème, PDT", dessert: "Mousse au café" },
    ]),
    w("w11", "2026-11-16", [
      { day: "Lundi",    potage: "Potage tomate", plat: "Escalope de porc à la milanaise, fusilli", dessert: "Glace" },
      { day: "Mardi",    potage: "Potage poireaux", plat: "Lasagnes", dessert: "Pâtisserie" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage chicon", plat: "Rôti de porc Orloff, salade, frites", dessert: "Pomme" },
      { day: "Vendredi", potage: "Potage cresson", plat: "Émincé de poulet à la paysanne, riz", dessert: "Crêpe" },
    ]),
    w("w12", "2026-11-23", [
      { day: "Lundi",    potage: "Potage chou-fleur", plat: "Saucisse, sauce brune, pois et macaroni", dessert: "Chocolat liégeois" },
      { day: "Mardi",    potage: "Potage tomate", plat: "Vol-au-vent champignons, boulette, purée", dessert: "Pâtisserie" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage céleri", plat: "Boulette sauce tomate, salade, frites", dessert: "Fruit" },
      { day: "Vendredi", potage: "Potage cerfeuil", plat: "Filet de colin pané, sauce tartare, salade chicon-haricot blanc, PDT nature", dessert: "Biscuit" },
    ]),
    w("w13", "2026-11-30", [
      { day: "Lundi",    potage: "Potage asperge", plat: "", dessert: "Crème vanille, spéculoos" },
      { day: "Mardi",    potage: "Potage tomate", plat: "Boudin blanc, sauce brune, pois et carottes, purée", dessert: "Pâtisserie" },
      e("Mercredi"),
      { day: "Jeudi",    potage: "Potage poireaux", plat: "Nuggets, compote et salade, frites", dessert: "Cornet d'amour" },
      { day: "Vendredi", potage: "Potage minestrone", plat: "Bûchette de volaille, sauce poivre, haricots verts, gratin dauphinois", dessert: "Brownie chocolat" },
    ]),
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
