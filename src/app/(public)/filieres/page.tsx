import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import ContentHero from "@/components/ContentHero";

export const metadata: Metadata = {
  title: "Nos filières & options",
  description:
    "Du premier au troisième degré, enseignement général de transition, DASPA et 7ᵉ préparatoire : découvrez les filières et options de l'Athénée Royal Jules Bara à Tournai.",
};

// Degrés de l'enseignement secondaire (Fédération Wallonie-Bruxelles).
const DEGRES = [
  {
    color: "var(--royal)",
    icon: "🧭",
    titre: "Premier degré",
    annees: "1re & 2e — commun et différencié",
    desc: "Tronc commun pour consolider les acquis du fondamental, activités complémentaires au choix et dispositif différencié (1D/2D) pour les élèves sans CEB.",
  },
  {
    color: "var(--teal)",
    icon: "🔬",
    titre: "Deuxième degré",
    annees: "3e & 4e — transition générale",
    desc: "Première orientation : renforcement en sciences, langues modernes, sciences économiques et sciences humaines, avec une formation commune solide.",
  },
  {
    color: "var(--orange)",
    icon: "🎓",
    titre: "Troisième degré",
    annees: "5e & 6e — transition générale",
    desc: "Approfondissement des options en vue des études supérieures : sciences fortes, mathématiques, langues, sciences économiques et sociales.",
  },
];

// Grille horaire indicative du premier degré commun (périodes/semaine).
const GRILLE_1D = [
  ["Formation religieuse / morale", "2"],
  ["Français", "6"],
  ["Mathématiques", "4"],
  ["Langue moderne I (néerlandais / anglais)", "4"],
  ["Étude du milieu (histoire-géographie)", "4"],
  ["Sciences", "3"],
  ["Éducation physique", "3"],
  ["Éducation artistique & technologique", "2"],
  ["Activités complémentaires au choix", "4"],
];

const OPTIONS = [
  "Sciences (sciences générales)",
  "Mathématiques renforcées",
  "Langues modernes (néerlandais · anglais · espagnol)",
  "Sciences économiques",
  "Sciences sociales & humaines",
  "Latin",
];

export default function FilieresPage() {
  return (
    <main>
      <ContentHero
        eyebrow="Enseignement secondaire · Tournai"
        title={
          <>
            Nos filières <em>& options</em>
          </>
        }
        sub="Un parcours général de transition, du premier au troisième degré, pour préparer chaque élève aux études supérieures dans un cadre exigeant et bienveillant."
        color="#284193"
      />

      {/* ====== les trois degrés ====== */}
      <section className="wrap section">
        <div className="shead reveal">
          <span className="eyebrow">Les trois degrés</span>
          <h2 className="serif">
            Un parcours <em>progressif</em>
          </h2>
          <p className="lead">
            De l&apos;entrée en secondaire jusqu&apos;à la rhétorique, chaque
            degré construit l&apos;autonomie et affine l&apos;orientation de
            l&apos;élève.
          </p>
        </div>
        <div className="access">
          {DEGRES.map((d) => (
            <div
              key={d.titre}
              className="acard reveal"
              style={{ "--c": d.color } as CSSProperties}
            >
              <div className="ic">{d.icon}</div>
              <h3 className="serif">{d.titre}</h3>
              <p style={{ fontWeight: 600, color: "var(--royal)", marginBottom: 6 }}>
                {d.annees}
              </p>
              <p>{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ====== grille horaire ====== */}
      <section className="news-band">
        <div className="wrap section">
          <div className="shead reveal">
            <span className="eyebrow">Grille horaire</span>
            <h2 className="serif">
              Premier degré <em>commun</em>
            </h2>
            <p className="lead">
              Répartition indicative des périodes hebdomadaires de la formation
              commune. Les grilles complètes des 2e et 3e degrés sont
              disponibles au secrétariat.
            </p>
          </div>
          <table className="pub-table reveal">
            <thead>
              <tr>
                <th>Cours</th>
                <th>Périodes / semaine</th>
              </tr>
            </thead>
            <tbody>
              {GRILLE_1D.map(([cours, p]) => (
                <tr key={cours}>
                  <td>{cours}</td>
                  <td>{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ====== options + dispositifs ====== */}
      <section className="wrap section">
        <div className="split">
          <div className="reveal">
            <span className="eyebrow">Options aux 2e & 3e degrés</span>
            <h2
              className="serif"
              style={{ fontSize: "clamp(28px,3.6vw,40px)", lineHeight: 1.1 }}
            >
              Construire son <em>orientation</em>
            </h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 16, margin: "16px 0 8px" }}>
              À partir du deuxième degré, l&apos;élève compose son parcours
              autour d&apos;options de transition qui le préparent aux études
              supérieures :
            </p>
            <ul className="flist">
              {OPTIONS.map((o) => (
                <li key={o}>
                  <span className="ck">✓</span>
                  <div>
                    <b>{o}</b>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="split-visual reveal">
            <div className="ic">🎓</div>
            <div className="tags">
              <span>Sciences</span>
              <span>Langues</span>
              <span>Mathématiques</span>
              <span>Sciences économiques</span>
              <span>Latin</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== DASPA + 7e préparatoire ====== */}
      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="access" style={{ marginTop: 0 }}>
          <div
            className="acard reveal"
            style={{ "--c": "var(--teal)" } as CSSProperties}
          >
            <div className="ic">🌍</div>
            <h3 className="serif">DASPA</h3>
            <p>
              Le Dispositif d&apos;Accueil et de Scolarisation des élèves
              Primo-Arrivants accompagne les jeunes nouvellement arrivés vers
              une intégration progressive, avec un apprentissage intensif du
              français.
            </p>
          </div>
          <div
            className="acard reveal"
            style={{ "--c": "var(--gold)" } as CSSProperties}
          >
            <div className="ic">📚</div>
            <h3 className="serif">7ᵉ préparatoire</h3>
            <p>
              Une année préparatoire à l&apos;enseignement supérieur pour
              renforcer les prérequis (mathématiques, sciences, langues) et
              aborder sereinement le post-secondaire.
            </p>
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="wrap cta-band">
        <div className="banner reveal">
          <div className="bc">
            <h2 className="serif">Une question sur l&apos;orientation ?</h2>
            <p>
              L&apos;équipe pédagogique vous reçoit pour construire le parcours
              le mieux adapté à votre enfant.
            </p>
          </div>
          <Link
            className="btn btn-light"
            style={{ position: "relative", zIndex: 2 }}
            href="/preinscription"
          >
            Préinscription →
          </Link>
        </div>
      </section>
    </main>
  );
}
