"use client";

import { useEffect, useState } from "react";
import type { Article, ArticleStatus } from "@/lib/article-types";
import { formatDateFr } from "@/lib/article-types";
import { shade, ACCENT_COLORS } from "@/lib/colors";
import { useToast } from "@/components/Toast";

const CATEGORIES = ["Événement", "Projet", "Inscription", "Sortie", "Info"];

interface Draft {
  id?: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  color: string;
  status: ArticleStatus;
}

const EMPTY: Draft = {
  title: "",
  category: "Événement",
  excerpt: "",
  body: "",
  color: "#284193",
  status: "DRAFT",
};

export default function ActusManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const toast = useToast();

  async function refresh() {
    const res = await fetch("/api/articles");
    setArticles(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function save() {
    if (!draft) return;
    if (!draft.title.trim() || !draft.excerpt.trim()) {
      toast("Titre et résumé sont requis");
      return;
    }
    const isNew = !draft.id;
    const res = await fetch(
      isNew ? "/api/articles" : `/api/articles/${draft.id}`,
      {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          category: draft.category,
          excerpt: draft.excerpt,
          body: draft.body,
          color: draft.color,
          status: draft.status,
        }),
      }
    );
    if (res.ok) {
      toast(isNew ? "Article créé" : "Article enregistré");
      setDraft(null);
      refresh();
    } else {
      toast("Erreur lors de l'enregistrement");
    }
  }

  async function togglePublish(a: Article) {
    const status = a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await fetch(`/api/articles/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast(status === "PUBLISHED" ? "Article publié ✓" : "Article dépublié");
    refresh();
  }

  async function remove(a: Article) {
    if (!confirm(`Supprimer « ${a.title} » ?`)) return;
    await fetch(`/api/articles/${a.id}`, { method: "DELETE" });
    toast("Article supprimé");
    refresh();
  }

  function edit(a: Article) {
    setDraft({
      id: a.id,
      title: a.title,
      category: a.category,
      excerpt: a.excerpt,
      body: a.body,
      color: a.color,
      status: a.status,
    });
  }

  return (
    <div className="actus-wrap">
      <div className="actus-head">
        <div>
          <h2 className="serif">Gestion des actualités</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            Créez et publiez les nouvelles de l&apos;école — visibles
            automatiquement en page d&apos;accueil.
          </p>
        </div>
        <button className="abtn primary" onClick={() => setDraft({ ...EMPTY })}>
          + Nouvel article
        </button>
      </div>

      <div className="atable">
        <div className="ahead-row">
          <span></span>
          <span>Titre</span>
          <span>Catégorie</span>
          <span>Date</span>
          <span>Statut</span>
          <span>Actions</span>
        </div>
        {loading && (
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>
            Chargement…
          </div>
        )}
        {!loading && articles.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>
            Aucun article pour le moment.
          </div>
        )}
        {articles.map((a) => (
          <div className="arow" key={a.id}>
            <div
              className="thumb"
              style={{
                background: `linear-gradient(135deg,${a.color},${shade(a.color)})`,
              }}
            />
            <div>
              <div className="ti2">{a.title}</div>
              <div className="ds">{a.excerpt.slice(0, 52)}…</div>
            </div>
            <div className="dt">{a.category}</div>
            <div className="dt">
              {a.status === "PUBLISHED" ? formatDateFr(a.publishedAt) : "—"}
            </div>
            <div>
              <span className={`badge ${a.status === "PUBLISHED" ? "pub" : "draft"}`}>
                {a.status === "PUBLISHED" ? "Publié" : "Brouillon"}
              </span>
            </div>
            <div className="acts">
              <button title="Modifier" onClick={() => edit(a)}>✏️</button>
              <button
                title={a.status === "PUBLISHED" ? "Dépublier" : "Publier"}
                onClick={() => togglePublish(a)}
              >
                {a.status === "PUBLISHED" ? "⏸" : "🚀"}
              </button>
              <button title="Supprimer" onClick={() => remove(a)}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {draft && (
        <div className="modal-veil" onClick={() => setDraft(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{draft.id ? "Modifier l'article" : "Nouvel article"}</h3>
            <div className="field">
              <label>Titre</label>
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Titre de l'article"
              />
            </div>
            <div className="field">
              <label>Catégorie</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Résumé</label>
              <textarea
                value={draft.excerpt}
                onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                placeholder="Une ou deux phrases affichées sur la carte"
              />
            </div>
            <div className="field">
              <label>Contenu</label>
              <textarea
                style={{ minHeight: 130 }}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                placeholder="Texte complet de l'article"
              />
            </div>
            <div className="field">
              <label>Couleur d&apos;accent</label>
              <div className="swatches">
                {ACCENT_COLORS.map((c) => (
                  <span
                    key={c}
                    className={`swatch${c === draft.color ? " on" : ""}`}
                    style={{ background: c }}
                    onClick={() => setDraft({ ...draft, color: c })}
                  />
                ))}
              </div>
            </div>
            <div className="field tog">
              <label>Publier immédiatement</label>
              <button
                className={`switch${draft.status === "PUBLISHED" ? " on" : ""}`}
                onClick={() =>
                  setDraft({
                    ...draft,
                    status: draft.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                  })
                }
                aria-label="Publier immédiatement"
              >
                <span></span>
              </button>
            </div>
            <div className="actions">
              <button className="abtn ghost" onClick={() => setDraft(null)}>
                Annuler
              </button>
              <button className="abtn primary" onClick={save}>
                {draft.id ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
