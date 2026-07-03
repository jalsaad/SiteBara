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
          <h2 className="serif" style={{ fontSize: 22 }}>Personnes de contact :</h2>
          <div className="rowc"><i>📍</i>Rue Duquesnoy 24, 7500 Tournai</div>
          <div className="pub-contact-persons">
            <div className="pub-contact-person">
              <div className="role">Direction</div>
              <div className="pname">Leandro Anzaldi</div>
              <div className="rowc"><i>📞</i><a href="tel:+3269890600">069/89.06.00</a></div>
              <div className="rowc"><i>✉️</i><a href="mailto:direction@atheneejulesbara.be">direction@atheneejulesbara.be</a></div>
            </div>
            <div className="pub-contact-person">
              <div className="role">Direction adjointe</div>
              <div className="pname">Albano D&apos;Arcangelo</div>
              <div className="rowc"><i>📞</i><a href="tel:+3269890608">069/89.06.08</a></div>
              <div className="rowc"><i>✉️</i><a href="mailto:directionadjointe@atheneejulesbara.be">directionadjointe@atheneejulesbara.be</a></div>
            </div>
            <div className="pub-contact-person">
              <div className="role">Secrétariat de direction</div>
              <div className="pname">Yasmina Bouvry</div>
              <div className="rowc"><i>📞</i><a href="tel:+3269890602">069/89.06.02</a></div>
              <div className="rowc"><i>✉️</i><a href="mailto:Bouvry.y@atheneejulesbara.be">Bouvry.y@atheneejulesbara.be</a></div>
            </div>
            <div className="pub-contact-person">
              <div className="role">Secrétariat élèves</div>
              <div className="pname">Dorothée Lecomte</div>
              <div className="rowc"><i>📞</i><a href="tel:+3269890603">069/89.06.03</a></div>
              <div className="rowc"><i>✉️</i><a href="mailto:Lecomte.d@atheneejulesbara.be">Lecomte.d@atheneejulesbara.be</a></div>
            </div>
            <div className="pub-contact-person">
              <div className="role">Comptabilité</div>
              <div className="pname">Isabelle Debray</div>
              <div className="rowc"><i>📞</i><a href="tel:+3269890604">069/89.06.04</a></div>
              <div className="rowc"><i>✉️</i><a href="mailto:Debray.i@atheneejulesbara.be">Debray.i@atheneejulesbara.be</a></div>
            </div>
            <div className="pub-contact-person">
              <div className="role">Comptabilité — Assistante</div>
              <div className="pname">Alexandra Daminet</div>
              <div className="rowc"><i>📞</i><a href="tel:+3269890609">069/89.06.09</a></div>
              <div className="rowc"><i>✉️</i><a href="mailto:Daminet.a@atheneejulesbara.be">Daminet.a@atheneejulesbara.be</a></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
