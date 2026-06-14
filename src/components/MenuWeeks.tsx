"use client";

import { useState } from "react";

interface MenuDay {
  day: string;
  potage: string;
  plat: string;
  veggie: string;
  dessert: string;
}

export interface PublicWeek {
  id: string;
  label: string;
  days: MenuDay[];
}

// Carrousel de semaines : la semaine en cours (première de la liste) est
// affichée par défaut ; les flèches ‹ › font défiler les semaines suivantes.
export default function MenuWeeks({ weeks }: { weeks: PublicWeek[] }) {
  const [i, setI] = useState(0);

  if (weeks.length === 0) {
    return (
      <p className="lead" style={{ textAlign: "center" }}>
        Le menu de la semaine sera publié prochainement.
      </p>
    );
  }

  const idx = Math.min(i, weeks.length - 1);
  const week = weeks[idx];
  const jours = week.days.filter((d) => d.potage || d.plat || d.veggie || d.dessert);

  return (
    <div className="menu-carousel">
      <div className="menu-carousel-head">
        <button
          className="menu-nav"
          onClick={() => setI(idx - 1)}
          disabled={idx === 0}
          aria-label="Semaine précédente"
        >
          ‹
        </button>
        <div className="menu-carousel-title">
          <strong>{week.label}</strong>
          {idx === 0 && <span className="menu-now">semaine en cours</span>}
        </div>
        <button
          className="menu-nav"
          onClick={() => setI(idx + 1)}
          disabled={idx >= weeks.length - 1}
          aria-label="Semaine suivante"
        >
          ›
        </button>
      </div>

      {jours.length === 0 ? (
        <p className="lead" style={{ textAlign: "center" }}>
          Menu à venir pour {week.label.toLowerCase()}.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="pub-table" style={{ maxWidth: "100%", minWidth: 720 }}>
            <thead>
              <tr>
                <th>Jour</th>
                <th>Potage</th>
                <th>Plat du jour</th>
                <th>Alternative végé</th>
                <th>Dessert</th>
              </tr>
            </thead>
            <tbody>
              {jours.map((m) => (
                <tr key={m.day}>
                  <td style={{ fontWeight: 600, color: "var(--royal)" }}>{m.day}</td>
                  <td>{m.potage}</td>
                  <td>{m.plat}</td>
                  <td>{m.veggie}</td>
                  <td>{m.dessert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {weeks.length > 1 && (
        <div className="menu-dots">
          {weeks.map((w, n) => (
            <button
              key={w.id}
              className={`menu-dot ${n === idx ? "active" : ""}`}
              onClick={() => setI(n)}
              aria-label={`Aller à ${w.label}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
