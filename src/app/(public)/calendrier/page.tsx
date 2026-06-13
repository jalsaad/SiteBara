import Link from "next/link";
import type { Metadata } from "next";
import ContentHero from "@/components/ContentHero";

export const metadata: Metadata = {
  title: "Calendrier scolaire",
  description:
    "Congés, vacances et dates clés de l'année scolaire à l'Athénée Royal Jules Bara, selon le calendrier officiel de la Fédération Wallonie-Bruxelles.",
};

// Calendrier officiel de la Fédération Wallonie-Bruxelles — année 2025-2026.
const CONGES = [
  ["Rentrée scolaire", "Lundi 25 août 2025"],
  ["Fête de la Communauté française", "Samedi 27 septembre 2025"],
  ["Congé d'automne (Toussaint)", "Du 20 au 31 octobre 2025"],
  ["Vacances d'hiver (Noël)", "Du 22 décembre 2025 au 4 janvier 2026"],
  ["Congé de détente (Carnaval)", "Du 16 au 27 février 2026"],
  ["Vacances de printemps (Pâques)", "Du 20 avril au 1er mai 2026"],
  ["Ascension", "Jeudi 14 & vendredi 15 mai 2026"],
  ["Lundi de Pentecôte", "Lundi 25 mai 2026"],
  ["Vacances d'été", "À partir du 1er juillet 2026"],
];

// Temps forts de fin d'année (indicatifs — confirmés par l'établissement).
const EVENEMENTS = [
  {
    date: "16 → 26 juin",
    titre: "Session d'examens de juin",
    desc: "Évaluations de fin d'année pour l'ensemble des degrés.",
  },
  {
    date: "27 juin",
    titre: "Remise des bulletins & proclamation",
    desc: "Réunion de parents et proclamation des résultats de la rhétorique.",
  },
  {
    date: "30 juin",
    titre: "Dernier jour de cours",
    desc: "Clôture de l'année scolaire 2025-2026.",
  },
  {
    date: "24 août",
    titre: "Rentrée 2026-2027",
    desc: "Reprise des cours pour la nouvelle année scolaire (date indicative FW-B).",
  },
];

export default function CalendrierPage() {
  return (
    <main>
      <ContentHero
        eyebrow="Année scolaire 2025-2026"
        title={
          <>
            Calendrier <em>scolaire</em>
          </>
        }
        sub="Congés, vacances et temps forts de l'année, selon le calendrier officiel de la Fédération Wallonie-Bruxelles."
        color="#f57a20"
      />

      {/* ====== congés & vacances ====== */}
      <section className="wrap section">
        <div className="shead reveal">
          <span className="eyebrow">Congés & vacances</span>
          <h2 className="serif">
            Les dates <em>officielles</em>
          </h2>
          <p className="lead">
            Calendrier de la Fédération Wallonie-Bruxelles pour l&apos;année
            2025-2026. Les jours fériés légaux sont inclus dans les périodes de
            congé.
          </p>
        </div>
        <table className="pub-table reveal">
          <thead>
            <tr>
              <th>Période</th>
              <th>Dates</th>
            </tr>
          </thead>
          <tbody>
            {CONGES.map(([periode, dates]) => (
              <tr key={periode}>
                <td style={{ fontWeight: 600, color: "var(--royal)" }}>{periode}</td>
                <td>{dates}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ====== événements à venir ====== */}
      <section className="news-band">
        <div className="wrap section">
          <div className="shead reveal">
            <span className="eyebrow">Temps forts</span>
            <h2 className="serif">
              Prochains <em>rendez-vous</em>
            </h2>
            <p className="lead">
              Dates indicatives de fin d&apos;année. Le détail des événements de
              l&apos;établissement est publié dans les actualités.
            </p>
          </div>
          <ul className="flist" style={{ maxWidth: 720 }}>
            {EVENEMENTS.map((e) => (
              <li key={e.titre}>
                <span
                  className="ck"
                  style={{
                    width: "auto",
                    padding: "0 12px",
                    fontSize: 12.5,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {e.date}
                </span>
                <div>
                  <b>{e.titre}</b>
                  <span>{e.desc}</span>
                </div>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 28 }}>
            <Link
              className="btn btn-ghost"
              style={{ borderColor: "var(--line)", color: "var(--royal)" }}
              href="/actualites"
            >
              Voir toutes les actualités →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
