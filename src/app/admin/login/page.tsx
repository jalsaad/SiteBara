"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const next = params.get("next");
      router.push(next && next.startsWith("/admin") ? next : "/admin/actus");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Connexion impossible");
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <form
        className="modal"
        style={{ maxWidth: 420 }}
        onSubmit={submit}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-dark.png"
          alt="Athénée Royal Jules Bara"
          style={{ height: 64, width: "auto", margin: "0 auto 18px" }}
        />
        <h3 style={{ textAlign: "center" }}>Espace d&apos;administration</h3>
        <div className="field">
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom.nom@atheneejulesbara.be"
            autoComplete="username"
            required
          />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <div
            className="field"
            style={{
              color: "#c0392b",
              background: "#fdecea",
              padding: 11,
              borderRadius: 9,
              fontSize: 13.5,
            }}
          >
            {error}
          </div>
        )}
        <button
          className="abtn primary"
          style={{ width: "100%", justifyContent: "center" }}
          disabled={busy}
        >
          {busy ? "Connexion…" : "Se connecter"}
        </button>
        <p
          style={{
            fontSize: 12,
            color: "#959cb3",
            marginTop: 16,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Comptes de démonstration : admin@atheneejulesbara.be / admin2026
          (éditeur + actus) · communication@atheneejulesbara.be / comm2026
          (actus uniquement)
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
