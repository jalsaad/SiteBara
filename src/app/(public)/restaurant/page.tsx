import type { Metadata } from "next";
import type { CSSProperties } from "react";
import ContentHero from "@/components/ContentHero";

export const metadata: Metadata = {
  title: "Restaurant scolaire",
  description:
    "Menus de la semaine, horaires, tarifs et informations pratiques du restaurant scolaire de l'Athénée Royal Jules Bara à Tournai.",
};

// Menu hebdomadaire (exemple — mis à jour chaque semaine par l'établissement).
const MENU = [
  {
    jour: "Lundi",
    potage: "Velouté de potiron",
    plat: "Boulettes sauce tomate, purée maison",
    veggie: "Boulettes végétales, purée maison",
    dessert: "Compote de pommes",
  },
  {
    jour: "Mardi",
    potage: "Julienne de légumes",
    plat: "Filet de poulet, riz, ratatouille",
    veggie: "Curry de pois chiches, riz",
    dessert: "Yaourt nature",
  },
  {
    jour: "Mercredi",
    potage: "Tomate-basilic",
    plat: "Spaghetti bolognaise",
    veggie: "Spaghetti aux lentilles",
    dessert: "Fruit de saison",
  },
  {
    jour: "Jeudi",
    potage: "Poireaux-pommes de terre",
    plat: "Poisson pané, frites, salade",
    veggie: "Galette de légumes, frites, salade",
    dessert: "Mousse au chocolat",
  },
  {
    jour: "Vendredi",
    potage: "Carottes-coriandre",
    plat: "Gratin de chou-fleur, jambon",
    veggie: "Gratin de chou-fleur (sans jambon)",
    dessert: "Salade de fruits",
  },
];

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

export default function RestaurantPage() {
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
            Au menu <em>cette semaine</em>
          </h2>
          <p className="lead">
            Menus indicatifs, susceptibles d&apos;évoluer selon les
            approvisionnements. Une alternative végétarienne est proposée chaque
            jour.
          </p>
        </div>
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
              {MENU.map((m) => (
                <tr key={m.jour}>
                  <td style={{ fontWeight: 600, color: "var(--royal)" }}>{m.jour}</td>
                  <td>{m.potage}</td>
                  <td>{m.plat}</td>
                  <td>{m.veggie}</td>
                  <td>{m.dessert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
