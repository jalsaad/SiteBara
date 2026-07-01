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
  const [digit, setDigit] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  function goToAdmin() {
    const next = params.get("next");
    router.push(next && next.startsWith("/admin") ? next : "/admin/actus");
    router.refresh();
  }

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
    if (res.ok && data.challenge) {
      setDigit(data.digit);
      setStage("code");
    } else {
      setError(data.error ?? "Connexion impossible");
    }
    setBusy(false);
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: code.trim(), remember }),
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
    setDigit(null);
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
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-pressed={showPassword}
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
            <div
              style={{
                background: "var(--cream-deep)",
                borderRadius: 12,
                padding: "18px 20px",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 8px" }}>
                Consultez votre liste de codes et entrez
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                un code commençant par le chiffre{" "}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: "var(--royal)",
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 700,
                    verticalAlign: "middle",
                    marginLeft: 6,
                  }}
                >
                  {digit}
                </span>
              </p>
            </div>
            <div className="field">
              <label>Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`${digit ?? ""}XXXXXX`}
                autoComplete="off"
                autoFocus
                style={{ fontSize: 20, letterSpacing: 4, textTransform: "uppercase" }}
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
