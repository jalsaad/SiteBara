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

// Affiche la semaine en cours et, si plusieurs sont publiées, des onglets pour
// consulter les semaines suivantes.
export default function MenuWeeks({ weeks }: { weeks: PublicWeek[] }) {
  const [active, setActive] = useState(0);

  if (weeks.length === 0) {
    return (
      <p className="lead" style={{ textAlign: "center" }}>
        Le menu de la semaine sera publié prochainement.
      </p>
    );
  }

  const week = weeks[Math.min(active, weeks.length - 1)];
  const jours = week.days.filter((d) => d.potage || d.plat || d.veggie || d.dessert);

  return (
    <div className="menu-public">
      {weeks.length > 1 && (
        <div className="menu-tabs" role="tablist">
          {weeks.map((w, i) => (
            <button
              key={w.id}
              role="tab"
              aria-selected={i === active}
              className={`menu-tab ${i === active ? "active" : ""}`}
              onClick={() => setActive(i)}
            >
              {i === 0 ? "Cette semaine" : w.label}
            </button>
          ))}
        </div>
      )}

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
    </div>
  );
}
