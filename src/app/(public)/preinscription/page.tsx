import type { Metadata } from "next";
import PreinscriptionForm from "./PreinscriptionForm";

export const metadata: Metadata = {
  title: "Préinscription",
  description:
    "Préinscrivez votre enfant à l'Athénée Royal Jules Bara de Tournai pour la prochaine rentrée scolaire.",
};

export default function PreinscriptionPage() {
  return (
    <main className="wrap section">
      <div className="form-band">
        <div className="shead reveal in" style={{ marginBottom: 36 }}>
          <span className="eyebrow">Inscriptions</span>
          <h2 className="serif">
            Préinscription pour la <em>prochaine rentrée</em>
          </h2>
          <p className="lead">
            Complétez ce formulaire : l&apos;équipe administrative vous
            recontacte pour fixer un rendez-vous et finaliser
            l&apos;inscription.
          </p>
        </div>
        <PreinscriptionForm />
      </div>
    </main>
  );
}
