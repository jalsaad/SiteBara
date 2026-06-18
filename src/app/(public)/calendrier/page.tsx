import Link from "next/link";
import type { Metadata } from "next";
import ContentHero from "@/components/ContentHero";

export const metadata: Metadata = {
  title: "Calendrier scolaire 2026-2027",
  description:
    "Congés, vacances et dates clés de l'année scolaire 2026-2027 à l'Athénée Royal Jules Bara, selon le calendrier officiel de la Fédération Wallonie-Bruxelles. PDF à consulter et ajout des vacances à votre agenda.",
};

// Fichiers du calendrier officiel FW-B (dans public/).
const PDF_URL = "/calendrier-2026-2027.pdf";
const ICS_URL = "/calendrier-vacances-2026-2027.ics";

// Calendrier officiel de la Fédération Wallonie-Bruxelles — année 2026-2027
// (source : Cal_Obli_26-27.ics).
const CONGES = [
  ["Rentrée scolaire", "Lundi 24 août 2026"],
  ["Fête de la Communauté française", "Dimanche 27 septembre 2026"],
  ["Congé d'automne (Toussaint)", "Du 19 au 30 octobre 2026"],
  ["Fête des morts", "Lundi 2 novembre 2026"],
  ["Commémoration du 11 novembre (Armistice)", "Mercredi 11 novembre 2026"],
  ["Vacances d'hiver (Noël)", "Du 21 décembre 2026 au 1ᵉʳ janvier 2027"],
  ["Mardi Gras", "Mardi 9 février 2027"],
  ["Congé de détente (Carnaval)", "Du 22 février au 5 mars 2027"],
  ["Lundi de Pâques", "Lundi 29 mars 2027"],
  ["Vacances de printemps (Pâques)", "Du 26 avril au 7 mai 2027"],
  ["Jeudi de l'Ascension", "Jeudi 6 mai 2027"],
  ["Lundi de Pentecôte", "Lundi 17 mai 2027"],
  ["Vacances d'été", "À partir du 2 juillet 2027"],
];

// Temps forts de fin d'année (indicatifs — confirmés par l'établissement).
const EVENEMENTS = [
  {
    date: "Juin 2027",
    titre: "Session d'examens",
    desc: "Évaluations de fin d'année pour l'ensemble des degrés.",
  },
  {
    date: "Fin juin 2027",
    titre: "Remise des bulletins & proclamation",
    desc: "Réunion de parents et proclamation des résultats de la rhétorique.",
  },
  {
    date: "1ᵉʳ juillet 2027",
    titre: "Dernier jour de cours",
    desc: "Clôture de l'année scolaire 2026-2027.",
  },
  {
    date: "Fin août 2027",
    titre: "Rentrée 2027-2028",
    desc: "Reprise des cours pour la nouvelle année scolaire.",
  },
];

export default function CalendrierPage() {
  return (
    <main>
      <ContentHero
        eyebrow="Année scolaire 2026-2027"
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
            2026-2027. Les jours fériés légaux sont inclus dans les périodes de
            congé.
          </p>
        </div>

        {/* actions : consulter le PDF, ajouter à son agenda */}
        <div className="cal-actions reveal">
          <a
            className="btn btn-ghost"
            style={{ borderColor: "var(--line)", color: "var(--royal)" }}
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 Consulter le calendrier (PDF)
          </a>
          <a className="btn btn-orange" href={ICS_URL} download>
            📅 Ajouter les vacances à mon agenda
          </a>
        </div>
        <p className="cal-actions-hint">
          Le fichier « .ics » s&apos;ouvre dans votre application d&apos;agenda
          (Google Agenda, Apple Calendrier, Outlook…) pour importer toutes les
          dates en un clic.
        </p>

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
