import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
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
        <div>
          <h4>Le site</h4>
          <Link href="/actualites">Actualités</Link>
          <Link href="/calendrier">Calendrier scolaire</Link>
          <Link href="/preinscription">Inscription</Link>
          <Link href="/applis">Applis</Link>
        </div>
        <div>
          <h4>L&apos;école</h4>
          <Link href="/filieres">Nos options</Link>
          <Link href="/restaurant">Restaurant scolaire</Link>
          <Link href="/p/notre-projet">Notre projet</Link>
        </div>
        <div>
          <h4>Contact</h4>
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
