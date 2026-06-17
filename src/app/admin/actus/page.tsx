"use client";

import { useEffect, useState } from "react";
import type {
  Article,
  ArticleStatus,
  SocialNetwork,
  SocialShare,
} from "@/lib/article-types";
import { formatDateFr, SOCIAL_NETWORKS } from "@/lib/article-types";
import { shade, ACCENT_COLORS } from "@/lib/colors";
import { useToast } from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";

const CATEGORIES = ["Événement", "Projet", "Inscription", "Sortie", "Info"];

interface Draft {
  id?: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  image: string | null;
  video: string | null;
  images: string[];
  color: string;
  status: ArticleStatus;
}

const EMPTY: Draft = {
  title: "",
  category: "Événement",
  excerpt: "",
  body: "",
  image: null,
  video: null,
  images: [],
  color: "#284193",
  status: "DRAFT",
};

const ALL_NETWORKS = SOCIAL_NETWORKS.map((n) => n.id);

/** Dernière diffusion d'un article sur un réseau donné. */
function lastShare(a: Article, network: SocialNetwork): SocialShare | undefined {
  return [...a.shares].reverse().find((s) => s.network === network);
}

export default function ActusManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [shareFor, setShareFor] = useState<Article | null>(null);
  const [shareNets, setShareNets] = useState<SocialNetwork[]>(ALL_NETWORKS);
  const [sharing, setSharing] = useState(false);
  const toast = useToast();

  async function refresh() {
    const res = await fetch("/api/articles");
    setArticles(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // Chargement initial — setState dans le .then (asynchrone, pas de rendu en cascade).
    fetch("/api/articles")
      .then((r) => r.json())
      .then((a) => {
        setArticles(a);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
          image: draft.image,
          video: draft.video,
          images: draft.images,
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

  function openShare(a: Article) {
    if (a.status !== "PUBLISHED") {
      toast("Publiez l'article avant de le diffuser");
      return;
    }
    setShareNets(ALL_NETWORKS);
    setShareFor(a);
  }

  async function doShare() {
    if (!shareFor || sharing) return;
    if (shareNets.length === 0) {
      toast("Choisissez au moins un réseau");
      return;
    }
    setSharing(true);
    const res = await fetch(`/api/articles/${shareFor.id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ networks: shareNets }),
    });
    setSharing(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: null }));
      toast(error ?? "Erreur lors de la diffusion");
      return;
    }
    const { results } = (await res.json()) as { results: SocialShare[] };
    const failed = results.filter((r) => r.status === "FAILED");
    const names = results
      .filter((r) => r.status !== "FAILED")
      .map((r) => SOCIAL_NETWORKS.find((n) => n.id === r.network)?.label)
      .join(", ");
    if (failed.length === results.length) {
      toast("La diffusion a échoué — voir l'historique");
    } else {
      const simulated = results.some((r) => r.status === "SIMULATED");
      toast(`Diffusé sur ${names}${simulated ? " (simulation)" : ""}`);
    }
    setShareFor(null);
    refresh();
  }

  function edit(a: Article) {
    setDraft({
      id: a.id,
      title: a.title,
      category: a.category,
      excerpt: a.excerpt,
      body: a.body,
      image: a.image,
      video: a.video,
      images: a.images,
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
              style={
                a.image
                  ? { backgroundImage: `url(${a.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: `linear-gradient(135deg,${a.color},${shade(a.color)})` }
              }
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
              {a.shares.length > 0 && (
                <div className="shared-nets">
                  {SOCIAL_NETWORKS.filter((n) => lastShare(a, n.id)).map((n) => {
                    const s = lastShare(a, n.id)!;
                    return (
                      <span
                        key={n.id}
                        title={`${n.label} — ${formatDateFr(s.sharedAt)}${
                          s.status === "SIMULATED" ? " (simulation)" : ""
                        }${s.status === "FAILED" ? " (échec)" : ""}`}
                      >
                        {n.icon}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="acts">
              <button title="Modifier" onClick={() => edit(a)}>✏️</button>
              <button
                title={a.status === "PUBLISHED" ? "Dépublier" : "Publier"}
                onClick={() => togglePublish(a)}
              >
                {a.status === "PUBLISHED" ? "⏸" : "🚀"}
              </button>
              <button title="Diffuser sur les réseaux" onClick={() => openShare(a)}>
                📣
              </button>
              <button title="Supprimer" onClick={() => remove(a)}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {shareFor && (
        <div className="modal-veil" onClick={() => setShareFor(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Diffuser sur les réseaux</h3>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 18 }}>
              «&nbsp;{shareFor.title}&nbsp;» sera partagé avec son résumé et le
              lien vers l&apos;article.
            </p>
            {SOCIAL_NETWORKS.map((n) => {
              const on = shareNets.includes(n.id);
              const last = lastShare(shareFor, n.id);
              return (
                <div
                  key={n.id}
                  className={`netrow${on ? " on" : ""}`}
                  onClick={() =>
                    setShareNets(
                      on
                        ? shareNets.filter((x) => x !== n.id)
                        : [...shareNets, n.id]
                    )
                  }
                >
                  <span className="ni">{n.icon}</span>
                  <span>
                    <span className="nl">{n.label}</span>
                    <span className="nd">
                      {last
                        ? `Dernière diffusion : ${formatDateFr(last.sharedAt)}${
                            last.status === "SIMULATED" ? " (simulation)" : ""
                          }${last.status === "FAILED" ? " (échec)" : ""}`
                        : "Jamais diffusé"}
                    </span>
                  </span>
                  <span className="ck">{on ? "✓" : ""}</span>
                </div>
              );
            })}
            <p className="ihint" style={{ margin: "14px 0 0" }}>
              Sans clés API configurées (Meta, LinkedIn), la diffusion est
              simulée et tracée dans l&apos;historique — mode démonstration.
            </p>
            <div className="actions">
              <button className="abtn ghost" onClick={() => setShareFor(null)}>
                Annuler
              </button>
              <button className="abtn primary" onClick={doShare} disabled={sharing}>
                {sharing ? "Diffusion…" : "📣 Diffuser"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              <label>Image de couverture</label>
              <ImageUpload
                value={draft.image}
                onChange={(url) => setDraft({ ...draft, image: url })}
              />
            </div>
            <div className="field">
              <label>Vidéo (optionnelle)</label>
              <ImageUpload
                kind="video"
                value={draft.video}
                onChange={(url) => setDraft({ ...draft, video: url })}
              />
              <p className="ihint">
                Affichée dans l&apos;article. MP4 ou WebM, 25 Mo maximum.
              </p>
            </div>
            <div className="field">
              <label>
                Galerie d&apos;images
                {draft.images.length > 0 && ` (${draft.images.length})`}
              </label>
              <div className="gal-edit">
                {draft.images.map((src, i) => (
                  <ImageUpload
                    key={i}
                    value={src}
                    onChange={(url) =>
                      setDraft({
                        ...draft,
                        images: url
                          ? draft.images.map((g, idx) => (idx === i ? url : g))
                          : draft.images.filter((_, idx) => idx !== i),
                      })
                    }
                  />
                ))}
              </div>
              <ImageUpload
                value={null}
                onChange={(url) =>
                  url && setDraft({ ...draft, images: [...draft.images, url] })
                }
              />
              <p className="ihint">
                Photos supplémentaires affichées en bas de l&apos;article (au
                cas où plusieurs images sont nécessaires).
              </p>
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
