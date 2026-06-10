"use client";

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
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
        ✓ Merci pour votre message ! Nous vous répondrons à l&apos;adresse
        indiquée dans les meilleurs délais.
      </div>
    );
  }

  return (
    <form className="form-card reveal in" onSubmit={submit}>
      {error && <div className="form-err">{error}</div>}
      <div className="form-grid2">
        <div className="field">
          <label>Votre nom</label>
          <input name="name" required placeholder="Prénom Nom" />
        </div>
        <div className="field">
          <label>Votre e-mail</label>
          <input name="email" type="email" required placeholder="vous@exemple.be" />
        </div>
      </div>
      <div className="field">
        <label>Sujet</label>
        <input name="subject" required placeholder="Objet de votre message" />
      </div>
      <div className="field">
        <label>Message</label>
        <textarea name="message" required style={{ minHeight: 140 }} placeholder="Votre message…" />
      </div>
      <button className="btn btn-orange" disabled={busy}>
        {busy ? "Envoi…" : "Envoyer le message →"}
      </button>
    </form>
  );
}
