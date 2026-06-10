import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'Athénée Royal Jules Bara : Rue Duquesnoy 24, 7500 Tournai — 069 89 06 02.",
};

export default function ContactPage() {
  return (
    <main className="wrap section">
      <div className="form-band">
        <div className="shead reveal in" style={{ marginBottom: 36 }}>
          <span className="eyebrow">Contact</span>
          <h2 className="serif">
            Une question ? <em>Écrivez-nous</em>
          </h2>
          <p className="lead">
            L&apos;équipe de l&apos;athénée vous répond dans les meilleurs
            délais. Vous pouvez aussi nous joindre au 069 89 06 02.
          </p>
        </div>
        <ContactForm />
        <div className="pub-contact" style={{ marginTop: 32, maxWidth: "none" }}>
          <h2 className="serif" style={{ fontSize: 22 }}>Nous trouver</h2>
          <div className="rowc"><i>📍</i>Rue Duquesnoy 24, 7500 Tournai</div>
          <div className="rowc"><i>📞</i>069 89 06 02</div>
          <div className="rowc">
            <i>✉️</i>
            <a href="mailto:direction@atheneejulesbara.be">
              direction@atheneejulesbara.be
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
