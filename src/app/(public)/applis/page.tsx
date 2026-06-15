import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import ContentHero from "@/components/ContentHero";
import QrGenerator from "@/components/QrGenerator";
import PdfBuilder from "@/components/PdfBuilder";

export const metadata: Metadata = {
  title: "Applis & outils",
  description:
    "Accès rapides aux espaces numériques de l'Athénée Royal Jules Bara (Google Classroom, APSchool, École en ligne) et outils pratiques : générateur de QR code, conversion d'images en PDF.",
};

// Accès aux espaces numériques externes.
// NB : URLs à confirmer/ajuster avec l'établissement.
const ACCES: {
  icon: string;
  titre: string;
  desc: string;
  href: string;
  cta: string;
  color: string;
}[] = [
  {
    icon: "🎓",
    titre: "Google Classroom",
    desc: "Cours, travaux et communications entre enseignants et élèves.",
    href: "https://classroom.google.com",
    cta: "Se connecter",
    color: "var(--royal)",
  },
  {
    icon: "🍽️",
    titre: "APSchool",
    desc: "Repas, paiements et gestion du compte de l'élève.",
    href: "https://www.apschool.be",
    cta: "Accéder",
    color: "var(--teal)",
  },
  {
    icon: "💻",
    titre: "École en ligne",
    desc: "Espace de travail en ligne de l'établissement.",
    href: "https://www9.ecoleenligne.be/V01154-3/membres/login.php?action=login&opt=1&id=1&order=desc&language_init=fr&etp=arjulesbara",
    cta: "Se connecter",
    color: "var(--orange)",
  },
];

export default function ApplisPage() {
  return (
    <main>
      <ContentHero
        eyebrow="Espaces numériques & outils"
        title={
          <>
            Applis <em>& outils</em>
          </>
        }
        sub="Retrouvez en un endroit les accès aux plateformes de l'école et quelques outils pratiques, directement utilisables depuis votre navigateur."
        color="#284193"
      />

      {/* ====== accès rapides ====== */}
      <section className="wrap section">
        <div className="shead reveal">
          <span className="eyebrow">Accès rapides</span>
          <h2 className="serif">
            Vos espaces <em>numériques</em>
          </h2>
          <p className="lead">
            Élèves, parents et enseignants accèdent directement aux plateformes
            de l&apos;établissement.
          </p>
        </div>
        <div className="access">
          {ACCES.map((a) => (
            <a
              key={a.titre}
              className="acard reveal"
              style={{ "--c": a.color } as CSSProperties}
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="ic">{a.icon}</div>
              <h3 className="serif">{a.titre}</h3>
              <p>{a.desc}</p>
              <span className="go">{a.cta} →</span>
            </a>
          ))}
        </div>
      </section>

      {/* ====== outils ====== */}
      <section className="news-band">
        <div className="wrap section">
          <div className="shead reveal">
            <span className="eyebrow">Outils pratiques</span>
            <h2 className="serif">
              À utiliser <em>en un clic</em>
            </h2>
            <p className="lead">
              Ces outils fonctionnent entièrement dans votre navigateur : aucune
              donnée n&apos;est envoyée sur un serveur.
            </p>
          </div>
          <div className="tool-grid">
            <QrGenerator />
            <PdfBuilder />
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="wrap cta-band">
        <div className="banner reveal">
          <div className="bc">
            <h2 className="serif">Un accès ne fonctionne pas ?</h2>
            <p>
              Le secrétariat vous aide à récupérer vos identifiants ou à
              configurer votre espace numérique.
            </p>
          </div>
          <Link
            className="btn btn-light"
            style={{ position: "relative", zIndex: 2 }}
            href="/contact"
          >
            Nous contacter →
          </Link>
        </div>
      </section>
    </main>
  );
}
