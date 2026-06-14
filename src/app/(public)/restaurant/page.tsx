import type { Metadata } from "next";
import type { CSSProperties } from "react";
import ContentHero from "@/components/ContentHero";
import MenuWeeks from "@/components/MenuWeeks";
import { getPublicMenus } from "@/lib/menu";

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
  const weeks = await getPublicMenus();

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
      <section className="section resto-menu">
        <span className="resto-deco d1" aria-hidden="true">🍅</span>
        <span className="resto-deco d2" aria-hidden="true">🥖</span>
        <span className="resto-deco d3" aria-hidden="true">🥕</span>
        <span className="resto-deco d4" aria-hidden="true">🍎</span>
        <span className="resto-deco d5" aria-hidden="true">🧀</span>
        <div className="wrap">
          <div className="shead reveal">
            <span className="eyebrow">Menu de la semaine</span>
            <h2 className="serif">
              Au menu <em>au restaurant</em>
            </h2>
            <div className="menu-garnish" aria-hidden="true">
              <span>🍲</span>
              <span>🥗</span>
              <span>🍮</span>
            </div>
            <p className="lead">
              Menus indicatifs, susceptibles d&apos;évoluer selon les
              approvisionnements. Une alternative végétarienne est proposée chaque
              jour.
            </p>
          </div>
          <div className="reveal">
            <MenuWeeks weeks={weeks} />
          </div>
          <div className="resto-reserve reveal">
            <p>Repas commandés et payés en ligne, sans espèces, via le compte de l&apos;élève.</p>
            <a
              className="btn btn-orange"
              href="https://www.apschool.be"
              target="_blank"
              rel="noopener noreferrer"
            >
              🍽 Réserver vos repas sur APSchool →
            </a>
          </div>
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
