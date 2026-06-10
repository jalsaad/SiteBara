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
            <a aria-label="X" href="#">𝕏</a>
            <a aria-label="Facebook" href="#">f</a>
            <a aria-label="Instagram" href="#">◉</a>
            <a aria-label="YouTube" href="#">▶</a>
          </div>
        </div>
        <div>
          <h4>Le site</h4>
          <Link href="/actualites">Actualités</Link>
          <a href="#">Calendrier scolaire</a>
          <a href="#">Inscription</a>
          <a href="#">Galerie photo</a>
        </div>
        <div>
          <h4>L&apos;école</h4>
          <a href="#">Projet d&apos;établissement</a>
          <a href="#">Historique</a>
          <a href="#">Les professeurs</a>
          <a href="#">Internats</a>
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
      </div>
    </footer>
  );
}
