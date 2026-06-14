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

const FIELDS: { key: keyof Omit<MenuDay, "day">; label: string; placeholder: string }[] = [
  { key: "potage", label: "Potage", placeholder: "ex. Velouté de potiron" },
  { key: "plat", label: "Plat du jour", placeholder: "ex. Boulettes sauce tomate, purée" },
  { key: "veggie", label: "Alternative végé", placeholder: "ex. Boulettes végétales, purée" },
  { key: "dessert", label: "Dessert", placeholder: "ex. Compote de pommes" },
];

export default function MenuPage() {
  const [weekLabel, setWeekLabel] = useState("");
  const [days, setDays] = useState<MenuDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (m) {
          setWeekLabel(m.weekLabel ?? "");
          setDays(m.days ?? []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function setField(i: number, key: keyof Omit<MenuDay, "day">, value: string) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, [key]: value } : d)));
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekLabel, days }),
    });
    setSaving(false);
    if (res.ok) {
      const m = await res.json();
      setWeekLabel(m.weekLabel ?? "");
      setDays(m.days ?? []);
      toast("Menu enregistré");
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Enregistrement impossible");
    }
  }

  return (
    <div className="actus-wrap">
      <div className="actus-head">
        <div>
          <h2 className="serif">Menu de la semaine</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            Mis à jour par la cuisine et affiché sur la page publique{" "}
            <a href="/restaurant" target="_blank" style={{ color: "var(--royal)" }}>
              Restaurant scolaire
            </a>
            . Laissez un champ vide pour ne rien afficher ce jour-là.
          </p>
        </div>
        <button className="abtn primary" onClick={save} disabled={saving || loading}>
          {saving ? "…" : "Enregistrer le menu"}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>Chargement…</div>
      ) : (
        <>
          <div className="field" style={{ maxWidth: 460 }}>
            <label>Intitulé de la semaine (facultatif)</label>
            <input
              value={weekLabel}
              onChange={(e) => setWeekLabel(e.target.value)}
              placeholder="ex. Semaine du 16 au 20 juin"
            />
          </div>

          <div className="menu-days">
            {days.map((d, i) => (
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
        </>
      )}
    </div>
  );
}
