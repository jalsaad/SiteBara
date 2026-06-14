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

// Lundi suivant une date ISO (ou le lundi courant par défaut).
function mondayAfter(iso?: string): string {
  const base = iso ? new Date(iso + "T00:00:00Z") : new Date();
  if (iso) {
    base.setUTCDate(base.getUTCDate() + 7);
    return base.toISOString().slice(0, 10);
  }
  const dow = (base.getUTCDay() + 6) % 7;
  base.setUTCDate(base.getUTCDate() - dow);
  return base.toISOString().slice(0, 10);
}

export default function MenuPage() {
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<WeeklyMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  function load(selectId?: string) {
    return fetch("/api/menu")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: WeeklyMenu[]) => {
        setMenus(list);
        const pick = selectId ?? selectedId ?? list[list.length - 1]?.id ?? null;
        setSelectedId(pick);
        const found = list.find((m) => m.id === pick) ?? null;
        setDraft(found ? { ...found, days: found.days.map((d) => ({ ...d })) } : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(m: WeeklyMenu) {
    setSelectedId(m.id);
    setDraft({ ...m, days: m.days.map((d) => ({ ...d })) });
  }

  function setField(i: number, key: keyof Omit<MenuDay, "day">, value: string) {
    setDraft((prev) =>
      prev ? { ...prev, days: prev.days.map((d, idx) => (idx === i ? { ...d, [key]: value } : d)) } : prev
    );
  }

  async function addWeek() {
    const last = menus[menus.length - 1];
    const weekStart = mondayAfter(last?.weekStart);
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart }),
    });
    if (res.ok) {
      const created: WeeklyMenu = await res.json();
      toast("Nouvelle semaine créée");
      await load(created.id);
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
      toast("Semaine enregistrée");
      await load(draft.id);
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
      toast("Semaine supprimée");
      setSelectedId(null);
      setDraft(null);
      await load(null as never);
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Suppression impossible");
    }
  }

  return (
    <div className="actus-wrap">
      <div className="actus-head">
        <div>
          <h2 className="serif">Menus de la semaine</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            Préparez autant de semaines que nécessaire. La page publique{" "}
            <a href="/restaurant" target="_blank" style={{ color: "var(--royal)" }}>
              Restaurant scolaire
            </a>{" "}
            affiche la semaine en cours et les suivantes. Laissez un champ vide
            pour ne rien afficher ce jour-là.
          </p>
        </div>
        <button className="abtn primary" onClick={addWeek} disabled={loading}>
          + Nouvelle semaine
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>Chargement…</div>
      ) : (
        <div className="menu-layout">
          <aside className="menu-weeks-list">
            {menus.length === 0 && (
              <p style={{ color: "#959cb3", fontSize: 14, padding: "8px 4px" }}>
                Aucune semaine. Créez-en une.
              </p>
            )}
            {menus.map((m) => (
              <button
                key={m.id}
                className={`menu-week-item ${m.id === selectedId ? "active" : ""}`}
                onClick={() => select(m)}
              >
                <span className="mw-label">{m.label}</span>
                <span className="mw-date">{m.weekStart}</span>
              </button>
            ))}
          </aside>

          <section className="menu-editor">
            {!draft ? (
              <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>
                Sélectionnez une semaine ou créez-en une nouvelle.
              </div>
            ) : (
              <>
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
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
