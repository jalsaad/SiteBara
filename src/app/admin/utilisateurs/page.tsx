"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

type Role = "ADMIN" | "COMM" | "CUISINE";

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  codes: string[];
  createdAt: string;
}

interface Draft {
  id?: string;
  email: string;
  name: string;
  role: Role;
  password: string;
  codes: string[];
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrateur",
  COMM: "Communication",
  CUISINE: "Cuisine",
};

const EMPTY: Draft = { email: "", name: "", role: "COMM", password: "", codes: [] };

function dateFr(iso: string) {
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Génère un code du type : chiffre 0–9 + 5 caractères alphanumériques. */
function genCode(startDigit: number): string {
  let s = String(startDigit);
  for (let i = 0; i < 5; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
  return s;
}

/** Génère N codes couvrant tous les chiffres 0–9 (au moins 1 par chiffre). */
function genCodes(total = 20): string[] {
  const codes: string[] = [];
  for (let d = 0; d <= 9; d++) codes.push(genCode(d));
  while (codes.length < total) codes.push(genCode(Math.floor(Math.random() * 10)));
  return codes;
}

const COLS = "1fr 150px 160px 110px";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [newCode, setNewCode] = useState("");
  const toast = useToast();

  async function refresh() {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetch("/api/users")
      .then((r) => (r.ok ? r.json() : null))
      .then((list) => { if (list) setUsers(list); setLoading(false); })
      .catch(() => setLoading(false));
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => setMe(m?.email ?? null))
      .catch(() => {});
  }, []);

  function edit(u: User) {
    setDraft({ id: u.id, email: u.email, name: u.name, role: u.role, password: "", codes: u.codes ?? [] });
    setNewCode("");
  }

  function addCodeToDraft() {
    const c = newCode.trim().toUpperCase();
    if (!c) return;
    if (!/^\d/.test(c)) { toast("Le code doit commencer par un chiffre"); return; }
    if (draft!.codes.includes(c)) { toast("Ce code existe déjà"); return; }
    setDraft({ ...draft!, codes: [...draft!.codes, c] });
    setNewCode("");
  }

  function removeCodeFromDraft(c: string) {
    setDraft({ ...draft!, codes: draft!.codes.filter((x) => x !== c) });
  }

  function generateCodes() {
    const fresh = genCodes(20);
    setDraft({ ...draft!, codes: [...draft!.codes, ...fresh] });
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    const isEdit = !!draft.id;
    const res = await fetch(
      isEdit ? `/api/users/${draft.id}` : "/api/users",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit
            ? {
                name: draft.name,
                role: draft.role,
                codes: draft.codes,
                ...(draft.password ? { password: draft.password } : {}),
              }
            : { ...draft }
        ),
      }
    );
    setSaving(false);
    if (res.ok) {
      toast(isEdit ? "Compte mis à jour" : "Compte créé");
      setDraft(null);
      refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Enregistrement impossible");
    }
  }

  async function remove(u: User) {
    if (!confirm(`Supprimer définitivement le compte « ${u.email} » ?`)) return;
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Compte supprimé");
      refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Suppression impossible");
    }
  }

  return (
    <div className="actus-wrap">
      <div className="actus-head">
        <div>
          <h2 className="serif">Utilisateurs</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            Comptes d&apos;accès à l&apos;espace d&apos;administration. Chaque admin dispose
            d&apos;une liste de codes à usage unique pour la double vérification.
          </p>
        </div>
        <button className="abtn primary" onClick={() => setDraft({ ...EMPTY })}>
          + Nouvel utilisateur
        </button>
      </div>

      <div className="atable">
        <div className="ahead-row" style={{ gridTemplateColumns: COLS }}>
          <span>Nom &amp; e-mail</span>
          <span>Rôle</span>
          <span>Créé le</span>
          <span>Actions</span>
        </div>
        {loading && (
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>Chargement…</div>
        )}
        {!loading && users.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>Aucun compte.</div>
        )}
        {users.map((u) => (
          <div className="arow" key={u.id} style={{ gridTemplateColumns: COLS }}>
            <div>
              <div className="ti2">
                {u.name}
                {u.email === me && (
                  <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}> · vous</span>
                )}
              </div>
              <div className="ds">{u.email}</div>
              <div style={{ fontSize: 12, color: "#959cb3", marginTop: 2 }}>
                {(u.codes ?? []).length} code{(u.codes ?? []).length !== 1 ? "s" : ""} restant{(u.codes ?? []).length !== 1 ? "s" : ""}
              </div>
            </div>
            <div>
              <span className={`badge ${u.role === "ADMIN" ? "pub" : "draft"}`}>
                {ROLE_LABEL[u.role]}
              </span>
            </div>
            <div className="dt">{dateFr(u.createdAt)}</div>
            <div className="acts">
              <button title="Modifier / gérer les codes" onClick={() => edit(u)}>✏️</button>
              <button
                title={u.email === me ? "Vous ne pouvez pas supprimer votre propre compte" : "Supprimer"}
                onClick={() => remove(u)}
                disabled={u.email === me}
                style={u.email === me ? { opacity: 0.4, cursor: "default" } : undefined}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {draft && (
        <div className="modal-veil" onClick={() => setDraft(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 520, width: "100%" }}
          >
            <h3>{draft.id ? "Modifier le compte" : "Nouvel utilisateur"}</h3>

            {/* Champs identité */}
            <div className="field">
              <label>Nom</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Prénom Nom"
              />
            </div>
            <div className="field">
              <label>E-mail</label>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                placeholder="prenom.nom@atheneejulesbara.be"
                disabled={!!draft.id}
                style={draft.id ? { opacity: 0.6 } : undefined}
              />
              {draft.id && (
                <span style={{ fontSize: 12, color: "#959cb3" }}>
                  L&apos;e-mail d&apos;un compte ne peut pas être modifié.
                </span>
              )}
            </div>
            <div className="field">
              <label>Rôle</label>
              <select
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}
              >
                <option value="COMM">Communication (actus + messages)</option>
                <option value="CUISINE">Cuisine (menu de la semaine)</option>
                <option value="ADMIN">Administrateur (accès complet)</option>
              </select>
            </div>
            <div className="field">
              <label>{draft.id ? "Nouveau mot de passe" : "Mot de passe"}</label>
              <input
                type="password"
                value={draft.password}
                onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                placeholder={draft.id ? "Laisser vide pour ne pas changer" : "8 caractères minimum"}
                autoComplete="new-password"
              />
            </div>

            {/* Codes de connexion */}
            <div style={{ borderTop: "1px solid var(--line)", marginTop: 18, paddingTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>
                  Codes de connexion ({draft.codes.length})
                </label>
                <button
                  type="button"
                  className="abtn ghost"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={generateCodes}
                  title="Génère 20 nouveaux codes (2 par chiffre 0–9)"
                >
                  ✨ Générer 20 codes
                </button>
              </div>

              {draft.codes.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    maxHeight: 160,
                    overflowY: "auto",
                    background: "var(--cream)",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 10,
                    fontFamily: "monospace",
                  }}
                >
                  {draft.codes.map((c) => (
                    <span
                      key={c}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        background: "#fff",
                        border: "1px solid var(--line)",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 13,
                      }}
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => removeCodeFromDraft(c)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#c0392b",
                          fontSize: 14,
                          lineHeight: 1,
                          padding: 0,
                        }}
                        title="Supprimer ce code"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCodeToDraft(); } }}
                  placeholder="ex: 5KJ8MN"
                  style={{ fontFamily: "monospace", flex: 1 }}
                />
                <button type="button" className="abtn ghost" onClick={addCodeToDraft}>
                  Ajouter
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#959cb3", marginTop: 6 }}>
                Chaque code commence par un chiffre (0–9). Usage unique — imprimez la liste et remettez-la à l&apos;utilisateur.
              </p>
            </div>

            <div className="actions" style={{ marginTop: 18 }}>
              <button className="abtn ghost" onClick={() => setDraft(null)}>Annuler</button>
              <button className="abtn primary" onClick={save} disabled={saving}>
                {saving ? "…" : draft.id ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
