import Link from "next/link";
import JulesBaraLink from "@/components/JulesBaraModal";

type NavLink = { href: string; label: string };

function pageLink(pages: NavLink[], label: string, fallback: string): string {
  return pages.find((p) => p.label === label)?.href ?? fallback;
}

export default function Footer({ pages = [] }: { pages?: NavLink[] }) {
  const notreProjetHref = pageLink(pages, "Notre projet", "/p/notre-projet");

  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        {/* Colonne 1 : identité */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="footer-logo"
            src="/logo-white.png"
            alt="Athénée Royal Jules Bara"
          />
          <p className="desc">
            Apprendre, s&apos;ouvrir, s&apos;accomplir. Un enseignement de
            qualité au cœur de Tournai depuis 1595.
          </p>
          <div className="social">
            <a aria-label="Facebook" href="#">f</a>
            <a aria-label="Instagram" href="#">◉</a>
            <a aria-label="LinkedIn" href="#">in</a>
          </div>
        </div>

        {/* Colonne 2 : navigation principale */}
        <div>
          <Link href="/actualites">Actualités</Link>
          <Link href="/calendrier">Calendrier scolaire</Link>
          <Link href="/preinscription">Inscription</Link>
          <Link href="/applis">Applis</Link>
          <Link href="/filieres">Nos options</Link>
          <Link href="/restaurant">Restaurant scolaire</Link>
          <Link href="/p/projet-pedagogique">Documents</Link>
        </div>

        {/* Colonne 3 : l'école */}
        <div>
          <JulesBaraLink />
          <Link href="/p/historique">Historique</Link>
          <Link href="/p/projets">Projets</Link>
          <Link href="/p/projet-detablissement">Projet d&apos;établissement</Link>
          <Link href="/p/reglement-dordre-interieur">Règlement d&apos;ordre intérieur</Link>
        </div>

        {/* Colonne 4 : services & communauté */}
        <div>
          <Link href="/p/ecole-des-devoirs">École des devoirs</Link>
          <Link href="/p/ecole-numerique">École numérique</Link>
          <Link href="/p/troubles-dapprentissage">Troubles d&apos;apprentissage</Link>
          <Link href="/p/union-des-anciens">Union des Anciens</Link>
          <Link href="/p/association-des-parents">Association des parents</Link>
          <Link href="/p/internat">Internat</Link>
        </div>

        {/* Colonne 5 : contact */}
        <div>
          <p>
            Rue Duquesnoy 24
            <br />
            7500 Tournai
          </p>
          <p>069 89 06 02</p>
          <a href="mailto:direction@atheneejulesbara.be">
            direction@atheneejulesbara.be
          </a>
        </div>

        {/* Colonne 6 : partenaires */}
        <div className="footer-partners">
          <a href="https://www.wbe.be/" target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/wbe.svg" alt="Wallonie-Bruxelles Enseignement" className="footer-partner-logo" />
          </a>
          <div className="footer-eu">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/union-europeenne.svg" alt="Union Européenne" className="footer-eu-logo" />
            <span>Cofinancé par l&apos;UE</span>
          </div>
        </div>
      </div>
      <div className="copy wrap">
        © 2026 Athénée Royal Jules Bara · Apprendre · S&apos;ouvrir ·
        S&apos;accomplir
        <div className="credit">
          <span>Réalisation signée&nbsp;:</span>
          <a
            href="https://www.jas-dw.be"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="JAS Digital Works"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/jas-digital-works.png" alt="JAS Digital Works" />
          </a>
        </div>
      </div>
    </footer>
  );
}
