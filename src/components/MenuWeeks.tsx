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

function WeekTable({ week }: { week: PublicWeek }) {
  const jours = week.days.filter((d) => d.potage || d.plat || d.veggie || d.dessert);
  if (jours.length === 0) {
    return (
      <p className="lead" style={{ textAlign: "center", paddingTop: 20 }}>
        Menu à venir pour {week.label.toLowerCase()}.
      </p>
    );
  }
  return (
    <div className="menu-table-scroll">
      <table className="pub-table">
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
  );
}

// Carrousel glissant : la semaine en cours (1re de la liste) est affichée par
// défaut. Les tableaux défilent horizontalement ; les boutons ronds ‹ › et les
// pastilles sont regroupés sous le carrousel.
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
  const multi = weeks.length > 1;

  return (
    <div className="menu-carousel">
      <div className="menu-viewport">
        <div className="menu-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {weeks.map((w, n) => (
            <div className="menu-slide" key={w.id} aria-hidden={n !== idx}>
              <div className="menu-slide-title">
                <strong>{w.label}</strong>
                {n === 0 && <span className="menu-now">semaine en cours</span>}
              </div>
              <WeekTable week={w} />
            </div>
          ))}
        </div>
      </div>

      {multi && (
        <div className="menu-controls">
          <button
            className="menu-nav"
            onClick={() => setI(idx - 1)}
            disabled={idx === 0}
            aria-label="Semaine précédente"
          >
            ‹
          </button>
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
          <button
            className="menu-nav"
            onClick={() => setI(idx + 1)}
            disabled={idx >= weeks.length - 1}
            aria-label="Semaine suivante"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
