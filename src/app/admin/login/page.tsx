"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Stage = "credentials" | "code";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [stage, setStage] = useState<Stage>("credentials");
  const [code, setCode] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  function goToAdmin() {
    const next = params.get("next");
    router.push(next && next.startsWith("/admin") ? next : "/admin/actus");
    router.refresh();
  }

  // Étape 1 : e-mail + mot de passe → déclenche l'envoi du code.
  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, remember }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.twoFactor) {
      setStage("code");
      setInfo(
        data.delivery === "SENT"
          ? `Un code de sécurité a été envoyé à ${email}.`
          : "Mode démo : le code de sécurité est affiché dans la console du serveur."
      );
    } else {
      setError(data.error ?? "Connexion impossible");
    }
    setBusy(false);
  }

  // Étape 2 : vérification du code de sécurité.
  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, remember }),
    });
    if (res.ok) {
      goToAdmin();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Code invalide");
      setBusy(false);
    }
  }

  function backToCredentials() {
    setStage("credentials");
    setCode("");
    setError("");
    setInfo("");
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
        onSubmit={stage === "credentials" ? submitCredentials : submitCode}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-dark.png"
          alt="Athénée Royal Jules Bara"
          style={{ height: 64, width: "auto", margin: "0 auto 18px" }}
        />
        <h3 style={{ textAlign: "center" }}>Espace d&apos;administration</h3>

        {stage === "credentials" ? (
          <>
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
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  aria-pressed={showPassword}
                  title={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    height: "100%",
                    width: 42,
                    display: "grid",
                    placeItems: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 17,
                    color: "#959cb3",
                  }}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            <div className="field tog">
              <label htmlFor="remember">Se souvenir de moi</label>
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: "auto" }}
              />
            </div>
          </>
        ) : (
          <>
            {info && (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  textAlign: "center",
                  lineHeight: 1.5,
                  marginBottom: 16,
                }}
              >
                {info}
              </p>
            )}
            <div className="field">
              <label>Code de sécurité</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                autoFocus
                style={{
                  textAlign: "center",
                  fontSize: 22,
                  letterSpacing: 8,
                }}
                required
              />
            </div>
          </>
        )}

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
          {busy
            ? stage === "credentials"
              ? "Vérification…"
              : "Connexion…"
            : stage === "credentials"
              ? "Continuer"
              : "Se connecter"}
        </button>

        {stage === "code" && (
          <button
            type="button"
            className="abtn ghost"
            onClick={backToCredentials}
            disabled={busy}
            style={{ width: "100%", justifyContent: "center", marginTop: 9 }}
          >
            ← Revenir
          </button>
        )}

        {stage === "credentials" && (
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
        )}
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
