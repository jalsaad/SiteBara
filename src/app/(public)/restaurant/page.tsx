import type { Metadata } from "next";
import type { CSSProperties } from "react";
import ContentHero from "@/components/ContentHero";
import { getMenu } from "@/lib/menu";

// Le menu est éditable à tout moment depuis /admin/menu : rendu à la demande.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Restaurant scolaire",
  description:
    "Menus de la semaine, horaires, tarifs et informations pratiques du restaurant scolaire de l'Athénée Royal Jules Bara à Tournai.",
};

const INFOS = [
  {
    icon: "🕛",
    titre: "Horaires",
    desc: "Service du midi de 11h45 à 13h15, en deux pauses selon les degrés. Restaurant fermé le mercredi après-midi.",
  },
  {
    icon: "💳",
    titre: "Tarifs & paiement",
    desc: "Repas complet (potage + plat + dessert) à tarif démocratique. Paiement sans espèces via le compte APSchool de l'élève.",
  },
  {
    icon: "🥗",
    titre: "Alternative & allergènes",
    desc: "Une alternative végétarienne chaque jour. Les fiches allergènes sont affichées au self et disponibles au secrétariat.",
  },
];

export default async function RestaurantPage() {
  const menu = await getMenu();
  // N'affiche que les jours renseignés (au moins un champ rempli).
  const jours = menu.days.filter(
    (d) => d.potage || d.plat || d.veggie || d.dessert
  );

  return (
    <main>
      <ContentHero
        eyebrow="Vie quotidienne · Restaurant scolaire"
        title={
          <>
            Le <em>restaurant</em> scolaire
          </>
        }
        sub="Des repas chauds, équilibrés et préparés sur place chaque jour, avec une alternative végétarienne quotidienne."
        color="#c79a4b"
      />

      {/* ====== menu de la semaine ====== */}
      <section className="wrap section">
        <div className="shead reveal">
          <span className="eyebrow">Menu de la semaine</span>
          <h2 className="serif">
            {menu.weekLabel ? (
              <>
                Au menu — <em>{menu.weekLabel}</em>
              </>
            ) : (
              <>
                Au menu <em>cette semaine</em>
              </>
            )}
          </h2>
          <p className="lead">
            Menus indicatifs, susceptibles d&apos;évoluer selon les
            approvisionnements. Une alternative végétarienne est proposée chaque
            jour.
          </p>
        </div>
        {jours.length === 0 ? (
          <p className="lead reveal" style={{ textAlign: "center" }}>
            Le menu de la semaine sera publié prochainement.
          </p>
        ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="pub-table reveal" style={{ maxWidth: "100%", minWidth: 720 }}>
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
      </section>

      {/* ====== infos pratiques ====== */}
      <section className="news-band">
        <div className="wrap section">
          <div className="shead reveal">
            <span className="eyebrow">Infos pratiques</span>
            <h2 className="serif">
              Bon à <em>savoir</em>
            </h2>
          </div>
          <div className="access">
            {INFOS.map((i, idx) => (
              <div
                key={i.titre}
                className="acard reveal"
                style={
                  {
                    "--c": ["var(--royal)", "var(--orange)", "var(--teal)"][idx],
                  } as CSSProperties
                }
              >
                <div className="ic">{i.icon}</div>
                <h3 className="serif">{i.titre}</h3>
                <p>{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
