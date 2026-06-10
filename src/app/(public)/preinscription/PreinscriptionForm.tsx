"use client";

import { useState } from "react";

const LEVELS = [
  "1re commune",
  "2e commune",
  "3e année",
  "4e année",
  "5e année",
  "6e année",
  "7e préparatoire",
  "DASPA",
];

export default function PreinscriptionForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/preinscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    setBusy(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Envoi impossible, réessayez plus tard.");
    }
  }

  if (sent) {
    return (
      <div className="form-ok reveal in">
        ✓ Demande de préinscription bien reçue ! Nous vous recontactons très
        vite pour convenir d&apos;un rendez-vous.
      </div>
    );
  }

  return (
    <form className="form-card reveal in" onSubmit={submit}>
      {error && <div className="form-err">{error}</div>}
      <div className="form-grid2">
        <div className="field">
          <label>Nom de l&apos;élève</label>
          <input name="lastName" required placeholder="Nom" />
        </div>
        <div className="field">
          <label>Prénom de l&apos;élève</label>
          <input name="firstName" required placeholder="Prénom" />
        </div>
      </div>
      <div className="form-grid2">
        <div className="field">
          <label>E-mail de contact</label>
          <input name="email" type="email" required placeholder="parent@exemple.be" />
        </div>
        <div className="field">
          <label>Téléphone (facultatif)</label>
          <input name="phone" type="tel" placeholder="04xx xx xx xx" />
        </div>
      </div>
      <div className="field">
        <label>Année / filière souhaitée</label>
        <select name="level" required defaultValue="">
          <option value="" disabled>
            Choisissez…
          </option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Remarques (facultatif)</label>
        <textarea
          name="message"
          style={{ minHeight: 100 }}
          placeholder="Questions, situation particulière…"
        />
      </div>
      <button className="btn btn-orange" disabled={busy}>
        {busy ? "Envoi…" : "Envoyer la demande →"}
      </button>
    </form>
  );
}
