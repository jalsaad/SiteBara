"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

interface MenuDay {
  day: string;
  potage: string;
  plat: string;
  veggie: string;
  dessert: string;
}

interface WeeklyMenu {
  id: string;
  weekStart: string;
  weekLabel: string;
  label: string;
  days: MenuDay[];
  updatedAt: string;
}

const FIELDS: { key: keyof Omit<MenuDay, "day">; label: string; placeholder: string }[] = [
  { key: "potage", label: "Potage", placeholder: "ex. Velouté de potiron" },
  { key: "plat", label: "Plat du jour", placeholder: "ex. Boulettes sauce tomate, purée" },
  { key: "veggie", label: "Alternative végé", placeholder: "ex. Boulettes végétales, purée" },
  { key: "dessert", label: "Dessert", placeholder: "ex. Compote de pommes" },
];

// AAAA-MM-JJ en fuseau local.
function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Lundi de la semaine en cours.
function currentMonday(): string {
  const n = new Date();
  const dow = (n.getDay() + 6) % 7;
  n.setDate(n.getDate() - dow);
  return localISO(n);
}

// Lundi suivant une date ISO.
function nextMonday(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
}

// Index de la semaine en cours (1re dont la fin n'est pas passée), sinon la dernière.
function currentIndex(list: WeeklyMenu[]): number {
  const cutoff = currentMonday();
  const i = list.findIndex((m) => m.weekStart >= cutoff);
  return i === -1 ? Math.max(0, list.length - 1) : i;
}

export default function MenuPage() {
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [idx, setIdx] = useState(0);
  const [draft, setDraft] = useState<WeeklyMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  function applyList(list: WeeklyMenu[], select: number) {
    setMenus(list);
    const clamped = Math.max(0, Math.min(select, list.length - 1));
    setIdx(clamped);
    const found = list[clamped] ?? null;
    setDraft(found ? { ...found, days: found.days.map((d) => ({ ...d })) } : null);
  }

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: WeeklyMenu[]) => {
        applyList(list, currentIndex(list));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function go(to: number) {
    if (to < 0 || to >= menus.length) return;
    setIdx(to);
    const m = menus[to];
    setDraft({ ...m, days: m.days.map((d) => ({ ...d })) });
  }

  function setField(i: number, key: keyof Omit<MenuDay, "day">, value: string) {
    setDraft((prev) =>
      prev ? { ...prev, days: prev.days.map((d, n) => (n === i ? { ...d, [key]: value } : d)) } : prev
    );
  }

  async function addWeek() {
    const last = menus[menus.length - 1];
    const weekStart = last ? nextMonday(last.weekStart) : currentMonday();
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart }),
    });
    if (res.ok) {
      const created: WeeklyMenu = await res.json();
      const list: WeeklyMenu[] = await (await fetch("/api/menu")).json();
      applyList(list, list.findIndex((m) => m.id === created.id));
      toast("Nouvelle semaine ajoutée");
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Création impossible");
    }
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    const res = await fetch(`/api/menu/${draft.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart: draft.weekStart, weekLabel: draft.weekLabel, days: draft.days }),
    });
    setSaving(false);
    if (res.ok) {
      const list: WeeklyMenu[] = await (await fetch("/api/menu")).json();
      applyList(list, list.findIndex((m) => m.id === draft.id));
      toast("Semaine enregistrée");
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Enregistrement impossible");
    }
  }

  async function remove() {
    if (!draft) return;
    if (!confirm(`Supprimer définitivement « ${draft.label} » ?`)) return;
    const res = await fetch(`/api/menu/${draft.id}`, { method: "DELETE" });
    if (res.ok) {
      const list: WeeklyMenu[] = await (await fetch("/api/menu")).json();
      applyList(list, Math.min(idx, list.length - 1));
      toast("Semaine supprimée");
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Suppression impossible");
    }
  }

  const isLast = idx >= menus.length - 1;

  return (
    <div className="actus-wrap">
      <div className="actus-head">
        <div>
          <h2 className="serif">Menus de la semaine</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            Naviguez avec les flèches ; la flèche droite au-delà de la dernière
            semaine ajoute un nouveau tableau. La page publique{" "}
            <a href="/restaurant" target="_blank" style={{ color: "var(--royal)" }}>
              Restaurant scolaire
            </a>{" "}
            affiche la semaine en cours par défaut.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>Chargement…</div>
      ) : menus.length === 0 || !draft ? (
        <div style={{ padding: 30, textAlign: "center" }}>
          <p style={{ color: "#959cb3", marginBottom: 14 }}>Aucune semaine pour l&apos;instant.</p>
          <button className="menu-nav add big" onClick={addWeek} title="Créer une première semaine">
            Créer une semaine →
          </button>
        </div>
      ) : (
        <>
          <div className="menu-carousel-head">
            <button className="menu-nav" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label="Semaine précédente">
              ‹
            </button>
            <div className="menu-carousel-title">
              <strong>{draft.label}</strong>
              <span className="menu-pos">
                Semaine {idx + 1} / {menus.length}
              </span>
            </div>
            {isLast ? (
              <button className="menu-nav add" onClick={addWeek} title="Ajouter une nouvelle semaine" aria-label="Ajouter une semaine">
                +→
              </button>
            ) : (
              <button className="menu-nav" onClick={() => go(idx + 1)} aria-label="Semaine suivante">
                ›
              </button>
            )}
          </div>

          <div className="menu-anim" key={draft.id}>
          <div className="menu-editor-head">
            <div className="field" style={{ maxWidth: 220 }}>
              <label>Lundi de la semaine</label>
              <input
                type="date"
                value={draft.weekStart}
                onChange={(e) => setDraft({ ...draft, weekStart: e.target.value })}
              />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 220 }}>
              <label>Intitulé (facultatif — sinon dérivé des dates)</label>
              <input
                value={draft.weekLabel}
                onChange={(e) => setDraft({ ...draft, weekLabel: e.target.value })}
                placeholder={draft.label}
              />
            </div>
          </div>

          <div className="menu-days">
            {draft.days.map((d, i) => (
              <div className="menu-day" key={d.day}>
                <h3 className="serif">{d.day}</h3>
                {FIELDS.map((f) => (
                  <div className="field" key={f.key}>
                    <label>{f.label}</label>
                    <input
                      value={d[f.key]}
                      onChange={(e) => setField(i, f.key, e.target.value)}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="actions" style={{ marginTop: 18 }}>
            <button className="abtn ghost danger" onClick={remove}>
              🗑 Supprimer cette semaine
            </button>
            <button className="abtn primary" onClick={save} disabled={saving}>
              {saving ? "…" : "Enregistrer"}
            </button>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
