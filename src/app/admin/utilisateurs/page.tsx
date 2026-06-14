"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

type Role = "ADMIN" | "COMM" | "CUISINE";

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

interface Draft {
  id?: string;
  email: string;
  name: string;
  role: Role;
  password: string;
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrateur",
  COMM: "Communication",
  CUISINE: "Cuisine",
};

const EMPTY: Draft = { email: "", name: "", role: "COMM", password: "" };

function dateFr(iso: string) {
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const COLS = "1fr 150px 160px 110px";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function refresh() {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // Chargement initial — setState dans le .then (asynchrone, pas de rendu en cascade).
    fetch("/api/users")
      .then((r) => (r.ok ? r.json() : null))
      .then((list) => {
        if (list) setUsers(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => setMe(m?.email ?? null))
      .catch(() => {});
  }, []);

  function edit(u: User) {
    setDraft({ id: u.id, email: u.email, name: u.name, role: u.role, password: "" });
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
                ...(draft.password ? { password: draft.password } : {}),
              }
            : draft
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
            Comptes d&apos;accès à l&apos;espace d&apos;administration. Les
            administrateurs gèrent tout le site ; le rôle Communication est
            limité aux actualités et aux messages.
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
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>
            Chargement…
          </div>
        )}
        {!loading && users.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>
            Aucun compte.
          </div>
        )}
        {users.map((u) => (
          <div className="arow" key={u.id} style={{ gridTemplateColumns: COLS }}>
            <div>
              <div className="ti2">
                {u.name}
                {u.email === me && (
                  <span
                    style={{ color: "var(--ink-soft)", fontWeight: 400 }}
                  >
                    {" "}
                    · vous
                  </span>
                )}
              </div>
              <div className="ds">{u.email}</div>
            </div>
            <div>
              <span className={`badge ${u.role === "ADMIN" ? "pub" : "draft"}`}>
                {ROLE_LABEL[u.role]}
              </span>
            </div>
            <div className="dt">{dateFr(u.createdAt)}</div>
            <div className="acts">
              <button title="Modifier" onClick={() => edit(u)}>
                ✏️
              </button>
              <button
                title={
                  u.email === me
                    ? "Vous ne pouvez pas supprimer votre propre compte"
                    : "Supprimer"
                }
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{draft.id ? "Modifier le compte" : "Nouvel utilisateur"}</h3>
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
                onChange={(e) =>
                  setDraft({ ...draft, role: e.target.value as Role })
                }
              >
                <option value="COMM">Communication (actus + messages)</option>
                <option value="CUISINE">Cuisine (menu de la semaine)</option>
                <option value="ADMIN">Administrateur (accès complet)</option>
              </select>
            </div>
            <div className="field">
              <label>
                {draft.id ? "Nouveau mot de passe" : "Mot de passe"}
              </label>
              <input
                type="password"
                value={draft.password}
                onChange={(e) =>
                  setDraft({ ...draft, password: e.target.value })
                }
                placeholder={
                  draft.id
                    ? "Laisser vide pour ne pas changer"
                    : "8 caractères minimum"
                }
                autoComplete="new-password"
              />
            </div>
            <div className="actions">
              <button className="abtn ghost" onClick={() => setDraft(null)}>
                Annuler
              </button>
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
