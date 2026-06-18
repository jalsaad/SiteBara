"use client";

// Éditeur de pages « drag-and-drop » — port React de la maquette validée.
// Les blocs sont stockés en l'état dans le composant ; la persistance
// (modèles Page/Block en base) se branche sur les boutons Enregistrer/Publier.

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Article } from "@/lib/article-types";
import type {
  Block,
  BlockData,
  BlockType,
  GridRow,
  HeroStat,
  PillarItem,
  CardItem,
  CheckItem,
  DownloadItem,
} from "@/lib/page-types";
import {
  BLOCK_LABELS as LABELS,
  BLOCK_TEMPLATES as TEMPLATES,
  blockId as bid,
  CORE_PAGE_SLUGS,
} from "@/lib/page-types";
import { shade, hexA, ACCENT_COLORS, TEXT_COLORS } from "@/lib/colors";
import {
  overlayStyle,
  borderPath,
  OVERLAY_OPTIONS,
  BORDER_OPTIONS,
} from "@/lib/hero";
import { useToast } from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";

interface PageMeta {
  slug: string;
  title: string;
  published: boolean;
}

const PALETTE: { type: BlockType; icon: string; desc: string }[] = [
  { type: "hero", icon: "🖼️", desc: "Bannière + stats" },
  { type: "banner", icon: "🏷️", desc: "En-tête de page" },
  { type: "pillars", icon: "🏛️", desc: "Intro + piliers" },
  { type: "cards", icon: "🧩", desc: "Cartes d'accès" },
  { type: "split", icon: "↔️", desc: "Deux colonnes" },
  { type: "text", icon: "📝", desc: "Paragraphe riche" },
  { type: "grid", icon: "🗂️", desc: "Tableau" },
  { type: "gallery", icon: "🏞️", desc: "Photos" },
  { type: "quote", icon: "❝", desc: "Citation" },
  { type: "cta", icon: "📣", desc: "Appel à l'action" },
  { type: "downloads", icon: "📥", desc: "Boutons fichiers" },
  { type: "news", icon: "📰", desc: "Auto, 3 articles" },
  { type: "newslist", icon: "🗞️", desc: "Toutes les actus" },
  { type: "menu", icon: "🍽️", desc: "Menu du resto" },
  { type: "contact", icon: "📍", desc: "Coordonnées" },
];

/* ---------------- rendu d'un bloc dans le canvas ---------------- */

function renderTitle(title: string) {
  // *mot* => accent orange italique
  const parts = title.split(/\*(.+?)\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <em key={i} style={{ color: "var(--orange)" }}>
        {p}
      </em>
    ) : (
      p
    )
  );
}

function BlockPreview({ block, news }: { block: Block; news: Article[] }) {
  const d = block.data;
  if (block.type === "hero") {
    const color = d.color ?? "#284193";
    const bg =
      d.bg === "solid"
        ? color
        : d.bg === "texture"
          ? `radial-gradient(120% 120% at 80% 0%,${hexA(color, 0.55)},transparent 55%),radial-gradient(90% 90% at 0% 100%,rgba(245,122,32,.22),transparent 50%),linear-gradient(160deg,${shade(color)},${color})`
          : `linear-gradient(135deg,${shade(color)},${color})`;
    const ov = overlayStyle(d.overlay, d.overlayOpacity);
    const bp = borderPath(d.border);
    const hasVideo = !!d.video;
    return (
      <div
        className={`r-hero${d.anim ? " r-anim" : ""}`}
        style={{ background: bg, ...(d.textColor ? { color: d.textColor } : {}) }}
      >
        {hasVideo && (
          <video
            key={d.video}
            className="rv"
            src={d.video}
            autoPlay
            muted
            loop
            playsInline
          />
        )}
        {hasVideo && (
          <span
            className="rv-scrim"
            style={{
              background: `linear-gradient(160deg,${hexA(shade(color), 0.62)},${hexA(color, 0.5)})`,
            }}
          />
        )}
        {d.effects && (
          <>
            <span className="rb rb1" />
            <span className="rb rb2" />
          </>
        )}
        {ov && <span className="rov" style={ov} />}
        {bp && (
          <svg
            className="r-border"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {d.borderBg && (
              <rect x="0" y="0" width="1200" height="120" fill={d.borderBg} />
            )}
            <path d={bp} fill={d.borderColor || "var(--cream)"} />
          </svg>
        )}
        <div className="rh-in">
          <span className="p">{d.pill}</span>
          <h3>{renderTitle(d.title ?? "")}</h3>
          <div className="s">{d.sub}</div>
          <div className="rbtns">
            <a className="b">{d.btn1} →</a>
            {d.btn2 && <a className="b2">{d.btn2}</a>}
          </div>
          {d.stats && d.stats.length > 0 && (
            <div className="rstats">
              {d.stats.map((s, i) => (
                <div key={i}>
                  <b>{s.n}</b>
                  <span>{s.l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  if (block.type === "pillars") {
    const items = d.pillars ?? [];
    return (
      <div className="r-text">
        <p style={{ fontWeight: 600, marginBottom: 14 }}>
          {renderTitle(d.intro ?? "")}
        </p>
        <div className="r-cards">
          {items.map((p, i) => (
            <div className="rc" key={i}>
              <div className="rc-ic">{String(i + 1).padStart(2, "0")}</div>
              <b>{p.title}</b>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (block.type === "cards") {
    const items = d.cards ?? [];
    return (
      <div className="r-text">
        <h3>{renderTitle(d.title ?? "")}</h3>
        <div className="r-cards">
          {items.map((c, i) => (
            <div className="rc" key={i} style={{ "--c": c.color } as React.CSSProperties}>
              <div className="rc-ic">{c.icon}</div>
              <b>{c.title}</b>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (block.type === "split") {
    const items = d.checks ?? [];
    return (
      <div className="r-text">
        <h3>{renderTitle(d.title ?? "")}</h3>
        <div className="r-tags">
          {(d.tags ?? []).map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
        <ul className="r-checks">
          {items.map((c, i) => (
            <li key={i}>
              <b>✓ {c.title}</b> — {c.desc}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (block.type === "quote") {
    return (
      <div className="r-text">
        <blockquote style={{ fontStyle: "italic", fontSize: 18 }}>
          « {d.quote} »
        </blockquote>
        <p style={{ marginTop: 8, color: "var(--ink-soft)" }}>{d.who}</p>
      </div>
    );
  }
  if (block.type === "banner") {
    return (
      <div
        className="r-hero"
        style={{
          background: `linear-gradient(160deg,${shade(d.color ?? "#284193")},${d.color ?? "#284193"})`,
          ...(d.textColor ? { color: d.textColor } : {}),
        }}
      >
        <div className="rh-in">
          <span className="p">{d.eyebrow}</span>
          <h3>{renderTitle(d.title ?? "")}</h3>
          <div className="s">{d.sub}</div>
        </div>
      </div>
    );
  }
  if (block.type === "downloads") {
    const items = d.downloads ?? [];
    return (
      <div className="r-text">
        {d.title && <h3>{renderTitle(d.title)}</h3>}
        <div className="rbtns">
          {items.map((it, i) => (
            <a key={i} className={it.primary ? "b" : "b2"}>
              {it.label}
            </a>
          ))}
        </div>
        {d.hint && <p style={{ marginTop: 8 }}>{d.hint}</p>}
      </div>
    );
  }
  if (block.type === "newslist") {
    return (
      <div className="r-text">
        <h3>{renderTitle(d.title ?? "")}</h3>
        <p>🗞️ Liste automatique de toutes les actualités publiées (gérées dans « Actus »).</p>
      </div>
    );
  }
  if (block.type === "menu") {
    return (
      <div className="r-text">
        <h3>{renderTitle(d.title ?? "")}</h3>
        <p>🍽️ Menu de la semaine — affiché automatiquement (géré dans « Menu »).</p>
        {d.btn && <div className="rbtns"><a className="b">{d.btn} →</a></div>}
      </div>
    );
  }
  if (block.type === "cta") {
    return (
      <div className="r-cta">
        <div>
          <b>{d.title}</b>
          <p>{d.body}</p>
        </div>
        <a className="b">{d.btn} →</a>
      </div>
    );
  }
  if (block.type === "text") {
    return (
      <div className="r-text">
        <h3>{d.title}</h3>
        <p>{d.body}</p>
      </div>
    );
  }
  if (block.type === "news") {
    return (
      <div className="r-news">
        <div className="h">{d.title}</div>
        <div className="row">
          {news.slice(0, 3).map((n) => (
            <div className="c" key={n.id}>
              <div
                className="im"
                style={{
                  background: `linear-gradient(135deg,${n.color},${shade(n.color)})`,
                }}
              />
              <div className="tx">
                <span>
                  {n.publishedAt
                    ? new Date(n.publishedAt).toLocaleDateString("fr-BE")
                    : ""}
                </span>
                <b>{n.title}</b>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (block.type === "grid") {
    const rows = d.rows ?? [];
    return (
      <div className="r-grid">
        <div className="h">{d.title}</div>
        <table>
          <thead>
            <tr>
              <th>{d.th1 || "Cours"}</th>
              <th>{d.th2 || "Périodes"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.c}</td>
                <td>{r.p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "gallery") {
    const cols = ["#284193", "#f57a20", "#0f9e75", "#1b2245", "#7c4dff", "#284193", "#0f9e75", "#f57a20"];
    const images = d.images ?? [];
    return (
      <div className="r-gal">
        <div className="h">{d.title}</div>
        <div className="g">
          {images.length > 0
            ? images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" />
              ))
            : cols.map((c, i) => (
                <div key={i} style={{ background: `linear-gradient(135deg,${c},${shade(c)})` }} />
              ))}
        </div>
      </div>
    );
  }
  return (
    <div className="r-contact">
      <div className="h">{d.title}</div>
      <div className="rowc"><i>📍</i>{d.addr}</div>
      <div className="rowc"><i>📞</i>{d.tel}</div>
      <div className="rowc"><i>✉️</i>{d.mail}</div>
    </div>
  );
}

/* ----------------------------- éditeur ----------------------------- */

function Editor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const slug = pageParam ?? "";

  const [pages, setPages] = useState<PageMeta[]>([]);
  const [pageTitle, setPageTitle] = useState("");
  const [published, setPublished] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [news, setNews] = useState<Article[]>([]);
  const [saving, setSaving] = useState(false);
  const dragType = useRef<BlockType | null>(null);
  const dragId = useRef<string | null>(null);
  const dropzone = useRef<HTMLDivElement>(null);
  // Modifications non enregistrées sur la page courante.
  const dirty = useRef(false);
  const toast = useToast();

  useEffect(() => {
    fetch("/api/articles?published=1")
      .then((r) => r.json())
      .then(setNews)
      .catch(() => {});
  }, []);

  async function refreshPages() {
    const res = await fetch("/api/pages");
    if (res.ok) setPages(await res.json());
  }

  useEffect(() => {
    // Liste des pages (panneau de gauche). Sans page sélectionnée, on bascule
    // sur la première page disponible.
    fetch("/api/pages")
      .then((r) => (r.ok ? r.json() : null))
      .then((list: PageMeta[] | null) => {
        if (!list) return;
        setPages(list);
        if (!pageParam && list.length) {
          router.replace(`/admin/editeur?page=${list[0].slug}`);
        }
      })
      .catch(() => {});
  }, [pageParam, router]);

  useEffect(() => {
    // Contenu de la page courante.
    if (!slug) return;
    fetch(`/api/pages/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((page) => {
        setBlocks(page?.blocks ?? []);
        setPageTitle(page?.title ?? slug);
        setPublished(page?.published ?? false);
        setSelectedId(null);
        dirty.current = false;
      })
      .catch(() => {});
  }, [slug]);

  function switchPage(target: string) {
    if (target === slug) return;
    if (
      dirty.current &&
      !confirm("Des modifications ne sont pas enregistrées. Changer de page quand même ?")
    ) {
      return;
    }
    router.replace(`/admin/editeur?page=${target}`);
  }

  async function createNewPage() {
    const title = prompt("Titre de la nouvelle page :");
    if (!title?.trim()) return;
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (res.ok) {
      toast(`Page « ${data.title} » créée`);
      await refreshPages();
      router.replace(`/admin/editeur?page=${data.slug}`);
    } else {
      toast(data.error ?? "Création impossible");
    }
  }

  async function removePage(target: string) {
    if (!confirm(`Supprimer définitivement la page « ${target} » ?`)) return;
    const res = await fetch(`/api/pages/${target}`, { method: "DELETE" });
    if (res.ok) {
      toast("Page supprimée");
      await refreshPages();
      // Si on supprime la page courante, on laisse l'effet rebasculer sur la
      // première page disponible.
      if (target === slug) router.replace("/admin/editeur");
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Suppression impossible");
    }
  }

  async function persist(publish: boolean) {
    if (!slug) {
      toast("Créez ou sélectionnez une page d'abord");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/pages/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blocks,
        title: pageTitle,
        ...(publish ? { publish: true } : {}),
      }),
    });
    setSaving(false);
    if (res.ok) {
      dirty.current = false;
      if (publish) setPublished(true);
      toast(publish ? "Page publiée en ligne ✓" : "Brouillon enregistré");
      refreshPages();
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Erreur lors de l'enregistrement");
    }
  }

  const selected = blocks.find((b) => b.id === selectedId) ?? null;

  function indexFromY(y: number): number {
    const els = dropzone.current?.querySelectorAll<HTMLElement>(".blk") ?? [];
    let i = 0;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (y < r.top + r.height / 2) return i;
      i++;
    }
    return blocks.length;
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDropIndex(indexFromY(e.clientY));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dirty.current = true;
    let idx = indexFromY(e.clientY);
    if (dragType.current) {
      const nb: Block = {
        id: bid(),
        type: dragType.current,
        data: structuredClone(TEMPLATES[dragType.current]),
      };
      const next = [...blocks];
      next.splice(idx, 0, nb);
      setBlocks(next);
      setSelectedId(nb.id);
      toast(`${LABELS[nb.type]} ajouté`);
    } else if (dragId.current) {
      const from = blocks.findIndex((b) => b.id === dragId.current);
      if (from !== -1) {
        const next = [...blocks];
        const [moved] = next.splice(from, 1);
        if (from < idx) idx--;
        next.splice(idx, 0, moved);
        setBlocks(next);
      }
    }
    dragType.current = null;
    dragId.current = null;
    setDropIndex(null);
  }

  function del(id: string) {
    dirty.current = true;
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast("Bloc supprimé");
  }

  function dup(id: string) {
    const i = blocks.findIndex((b) => b.id === id);
    if (i === -1) return;
    dirty.current = true;
    const copy: Block = {
      id: bid(),
      type: blocks[i].type,
      data: structuredClone(blocks[i].data),
    };
    const next = [...blocks];
    next.splice(i + 1, 0, copy);
    setBlocks(next);
    toast("Bloc dupliqué");
  }

  function upd(key: string, value: unknown) {
    if (!selected) return;
    dirty.current = true;
    setBlocks(
      blocks.map((b) =>
        b.id === selected.id ? { ...b, data: { ...b.data, [key]: value } } : b
      )
    );
  }

  /* galerie : liste d'images du bloc sélectionné */
  const gallery = (selected?.data.images as string[] | undefined) ?? [];
  const galAdd = (url: string | null) => {
    if (url) upd("images", [...gallery, url]);
  };
  const galSet = (i: number, url: string | null) => {
    // url null => l'image a été retirée
    upd(
      "images",
      url ? gallery.map((g, idx) => (idx === i ? url : g)) : gallery.filter((_, idx) => idx !== i)
    );
  };

  /* grille horaire : lignes éditables du bloc sélectionné */
  const gridRows = (selected?.data.rows as GridRow[] | undefined) ?? [];
  const gridSetCell = (i: number, key: "c" | "p", value: string) =>
    upd("rows", gridRows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  const gridAddRow = () => upd("rows", [...gridRows, { c: "", p: "" }]);
  const gridRemoveRow = (i: number) =>
    upd("rows", gridRows.filter((_, idx) => idx !== i));

  /* listes d'objets éditables (piliers, cartes, points, stats…) */
  const listOf = <T,>(key: keyof BlockData): T[] =>
    (selected?.data[key] as T[] | undefined) ?? [];
  const listSet = <T,>(key: string, list: T[], i: number, patch: Partial<T>) =>
    upd(key, list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const listAdd = <T,>(key: string, list: T[], item: T) =>
    upd(key, [...list, item]);
  const listDel = <T,>(key: string, list: T[], i: number) =>
    upd(key, list.filter((_, idx) => idx !== i));

  const heroStats = listOf<HeroStat>("stats");
  const pillarItems = listOf<PillarItem>("pillars");
  const cardItems = listOf<CardItem>("cards");
  const splitChecks = listOf<CheckItem>("checks");
  const splitTags = listOf<string>("tags");
  const downloadItems = listOf<DownloadItem>("downloads");

  /* champs de l'inspecteur */
  const txt = (k: keyof BlockData, label: string, area = false) => (
    <div className="field" key={k}>
      <label>{label}</label>
      {area ? (
        <textarea
          value={(selected?.data[k] as string) ?? ""}
          onChange={(e) => upd(k, e.target.value)}
        />
      ) : (
        <input
          value={(selected?.data[k] as string) ?? ""}
          onChange={(e) => upd(k, e.target.value)}
        />
      )}
    </div>
  );

  // Champ couleur : pastilles + sélecteur libre (n'importe quelle couleur).
  const colorField = (
    k: keyof BlockData,
    label: string,
    palette: string[] = ACCENT_COLORS
  ) => (
    <div className="field" key={k}>
      <label>{label}</label>
      <div className="swatches">
        {palette.map((c) => (
          <span
            key={c}
            className={`swatch${selected?.data[k] === c ? " on" : ""}`}
            style={{ background: c }}
            onClick={() => upd(k, c)}
          />
        ))}
        <input
          type="color"
          className="swatch-pick"
          title="Couleur personnalisée"
          value={(selected?.data[k] as string) || "#284193"}
          onChange={(e) => upd(k, e.target.value)}
        />
      </div>
    </div>
  );

  const tog = (k: keyof BlockData, label: string) => (
    <div className="field tog" key={k}>
      <label>{label}</label>
      <button
        className={`switch${selected?.data[k] ? " on" : ""}`}
        onClick={() => upd(k, !selected?.data[k])}
        aria-label={label}
      >
        <span></span>
      </button>
    </div>
  );

  const info = (text: string) => (
    <div
      className="field"
      style={{
        fontSize: 12.5,
        color: "#98a2b3",
        background: "#f8fafc",
        padding: 11,
        borderRadius: 9,
      }}
    >
      ℹ️ {text}
    </div>
  );

  return (
    <div className="editor">
      {/* palette */}
      <aside className="palette">
        <div className="lbl">Pages du site</div>
        <div className="pglist">
          {pages.map((p) => (
            <div
              key={p.slug}
              className={`pgitem${p.slug === slug ? " on" : ""}`}
              onClick={() => switchPage(p.slug)}
            >
              <span
                className={`st ${p.published ? "pub" : "draft"}`}
                title={p.published ? "Publiée" : "Brouillon"}
              />
              <span className="pt">{p.title}</span>
              {!CORE_PAGE_SLUGS.includes(p.slug) && (
                <button
                  className="del"
                  title="Supprimer la page"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePage(p.slug);
                  }}
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          className="abtn ghost"
          style={{ width: "100%", justifyContent: "center", marginBottom: 4 }}
          onClick={createNewPage}
        >
          + Nouvelle page
        </button>

        <div className="lbl" style={{ marginTop: 22 }}>Titre de la page</div>
        <div className="field">
          <input
            value={pageTitle}
            onChange={(e) => {
              setPageTitle(e.target.value);
              dirty.current = true;
            }}
            placeholder="Titre de la page"
          />
        </div>

        <div className="lbl" style={{ marginTop: 22 }}>Glissez un bloc →</div>
        {PALETTE.map((p) => (
          <div
            key={p.type}
            className="block-item"
            draggable
            onDragStart={() => {
              dragType.current = p.type;
              dragId.current = null;
            }}
          >
            <span className="bi">{p.icon}</span>
            <div>
              <div className="bt">{LABELS[p.type]}</div>
              <div className="bs">{p.desc}</div>
            </div>
          </div>
        ))}
        <div className="lbl" style={{ marginTop: 22 }}>Actions</div>
        <button
          className="abtn save"
          style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}
          disabled={saving}
          onClick={() => persist(false)}
        >
          {saving ? "…" : "Enregistrer"}
        </button>
        <button
          className="abtn primary"
          style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}
          disabled={saving}
          onClick={() => persist(true)}
        >
          Publier
        </button>
        <a
          className="abtn ghost"
          style={{ width: "100%", justifyContent: "center" }}
          href={`/p/${slug}`}
          target="_blank"
        >
          Aperçu public {published ? "↗" : "(brouillon) ↗"}
        </a>
      </aside>

      {/* canvas */}
      <section className="canvas">
        <div className="canvas-frame">
          <div className="browser">
            <span className="dot" style={{ background: "#f6584f" }} />
            <span className="dot" style={{ background: "#f5b14a" }} />
            <span className="dot" style={{ background: "#42c66a" }} />
            <span className="url">atheneejulesbara.be / {slug}</span>
          </div>
          <div
            ref={dropzone}
            className={`dropzone${dropIndex !== null && blocks.length === 0 ? " dz-active" : ""}`}
            onDragOver={onDragOver}
            onDragLeave={(e) => {
              if (e.target === dropzone.current) setDropIndex(null);
            }}
            onDrop={onDrop}
          >
            {blocks.length === 0 && (
              <div className="empty">
                <span className="big">🎨</span>
                <div>
                  <b>Page vide</b>
                  <br />
                  Glissez un bloc depuis la gauche pour commencer
                </div>
              </div>
            )}
            {blocks.map((b, i) => (
              <div key={b.id}>
                {dropIndex === i && <div className="drop-line" />}
                <div
                  className={`blk${b.id === selectedId ? " sel" : ""}`}
                  draggable
                  onClick={() => setSelectedId(b.id)}
                  onDragStart={(e) => {
                    dragId.current = b.id;
                    dragType.current = null;
                    (e.currentTarget as HTMLElement).style.opacity = "0.4";
                  }}
                  onDragEnd={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "1";
                    dragId.current = null;
                    setDropIndex(null);
                  }}
                >
                  <span className="grip" title="Déplacer">⠿</span>
                  <span className="tag">{LABELS[b.type]}</span>
                  <div className="tools">
                    <button
                      title="Dupliquer"
                      onClick={(e) => {
                        e.stopPropagation();
                        dup(b.id);
                      }}
                    >
                      ⧉
                    </button>
                    <button
                      title="Supprimer"
                      onClick={(e) => {
                        e.stopPropagation();
                        del(b.id);
                      }}
                    >
                      🗑
                    </button>
                  </div>
                  <BlockPreview block={b} news={news} />
                </div>
              </div>
            ))}
            {dropIndex === blocks.length && blocks.length > 0 && (
              <div className="drop-line" />
            )}
          </div>
        </div>
      </section>

      {/* inspecteur */}
      <aside className="inspector">
        {!selected && (
          <div className="no-sel">
            <i>⚙️</i>Sélectionnez un bloc
            <br />
            pour modifier son contenu
          </div>
        )}
        {selected && (
          <>
            <div className="ih">{LABELS[selected.type]} · Propriétés</div>
            {selected.type === "hero" && (
              <>
                <div className="isub">Contenu</div>
                {txt("pill", "Étiquette")}
                {txt("title", "Titre")}
                <div className="ihint">
                  Astuce : entourez un mot d&apos;*astérisques* pour le mettre
                  en accent orange.
                </div>
                {txt("sub", "Sous-titre", true)}
                <div className="isub">Bouton principal</div>
                {txt("btn1", "Texte du bouton")}
                {txt("link1", "Lien (URL)")}
                <div className="isub">Bouton secondaire</div>
                {txt("btn2", "Texte (vide = masqué)")}
                {txt("link2", "Lien (URL)")}
                <div className="isub">Arrière-plan</div>
                {colorField("color", "Couleur d'accent / fond")}
                {colorField("textColor", "Couleur du texte", TEXT_COLORS)}
                <div className="field">
                  <label>Style</label>
                  <div className="seg">
                    {(
                      [
                        ["gradient", "Dégradé"],
                        ["solid", "Uni"],
                        ["texture", "Texturé"],
                      ] as const
                    ).map(([v, l]) => (
                      <button
                        key={v}
                        className={selected.data.bg === v ? "on" : ""}
                        onClick={() => upd("bg", v)}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Vidéo d&apos;arrière-plan</label>
                  <ImageUpload
                    kind="video"
                    value={(selected.data.video as string) || null}
                    onChange={(url) => upd("video", url ?? "")}
                  />
                  <div className="ihint">
                    MP4 ou WebM (25 Mo max). Sans vidéo, l&apos;arrière-plan
                    utilise la couleur et le style ci-dessus.
                  </div>
                </div>
                <div className="isub">Effet graphique (premier plan)</div>
                <div className="field">
                  <div className="seg wrap">
                    {OVERLAY_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        className={
                          (selected.data.overlay ?? "none") === value ? "on" : ""
                        }
                        onClick={() => upd("overlay", value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {(selected.data.overlay ?? "none") !== "none" && (
                  <div className="field">
                    <label>
                      Transparence ·{" "}
                      {(selected.data.overlayOpacity as number) ?? 35}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={(selected.data.overlayOpacity as number) ?? 35}
                      onChange={(e) =>
                        upd("overlayOpacity", Number(e.target.value))
                      }
                    />
                  </div>
                )}
                <div className="isub">Bordure inférieure</div>
                <div className="field">
                  <div className="seg wrap">
                    {BORDER_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        className={
                          (selected.data.border ?? "none") === value ? "on" : ""
                        }
                        onClick={() => upd("border", value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {(selected.data.border ?? "none") !== "none" && (
                  <>
                    <div className="field colorrow">
                      <label>Couleur de la bordure</label>
                      <input
                        type="color"
                        value={(selected.data.borderColor as string) || "#f7f2e9"}
                        onChange={(e) => upd("borderColor", e.target.value)}
                      />
                    </div>
                    <div className="field colorrow">
                      <label>Arrière-plan de la bordure</label>
                      <span className="colorrow-ctl">
                        <input
                          type="color"
                          value={(selected.data.borderBg as string) || "#ffffff"}
                          onChange={(e) => upd("borderBg", e.target.value)}
                        />
                        {selected.data.borderBg ? (
                          <button
                            type="button"
                            className="abtn ghost sm"
                            onClick={() => upd("borderBg", "")}
                          >
                            Transparent
                          </button>
                        ) : (
                          <span className="ihint" style={{ margin: 0 }}>
                            Transparent (laisse voir la bannière)
                          </span>
                        )}
                      </span>
                    </div>
                  </>
                )}
                <div className="isub">Statistiques</div>
                {heroStats.map((s, i) => (
                  <div className="field rowedit" key={i}>
                    <input
                      value={s.n}
                      placeholder="430+"
                      onChange={(e) =>
                        listSet<HeroStat>("stats", heroStats, i, { n: e.target.value })
                      }
                    />
                    <input
                      value={s.l}
                      placeholder="Ans d'histoire"
                      onChange={(e) =>
                        listSet<HeroStat>("stats", heroStats, i, { l: e.target.value })
                      }
                    />
                    <button
                      className="del"
                      title="Retirer"
                      onClick={() => listDel<HeroStat>("stats", heroStats, i)}
                    >
                      🗑
                    </button>
                  </div>
                ))}
                <button
                  className="abtn ghost sm"
                  onClick={() => listAdd<HeroStat>("stats", heroStats, { n: "", l: "" })}
                >
                  + Statistique
                </button>
                <div className="isub">Effets &amp; animations</div>
                {tog("effects", "Halos décoratifs")}
                {tog("anim", "Animations d'apparition")}
              </>
            )}
            {selected.type === "pillars" && (
              <>
                {txt("intro", "Phrase d'introduction", true)}
                <div className="isub">Piliers</div>
                {pillarItems.map((p, i) => (
                  <div className="itemcard" key={i}>
                    <div className="itemcard-head">
                      <span>Pilier {i + 1}</span>
                      <button
                        className="del"
                        title="Retirer"
                        onClick={() => listDel<PillarItem>("pillars", pillarItems, i)}
                      >
                        🗑
                      </button>
                    </div>
                    <input
                      value={p.title}
                      placeholder="Titre"
                      onChange={(e) =>
                        listSet<PillarItem>("pillars", pillarItems, i, { title: e.target.value })
                      }
                    />
                    <textarea
                      value={p.desc}
                      placeholder="Description"
                      onChange={(e) =>
                        listSet<PillarItem>("pillars", pillarItems, i, { desc: e.target.value })
                      }
                    />
                  </div>
                ))}
                <button
                  className="abtn ghost sm"
                  onClick={() =>
                    listAdd<PillarItem>("pillars", pillarItems, { title: "", desc: "" })
                  }
                >
                  + Pilier
                </button>
              </>
            )}
            {selected.type === "cards" && (
              <>
                {txt("eyebrow", "Sur-titre")}
                {txt("title", "Titre")}
                {txt("lead", "Phrase d'introduction", true)}
                <div className="isub">Cartes</div>
                {cardItems.map((c, i) => (
                  <div className="itemcard" key={i}>
                    <div className="itemcard-head">
                      <span>Carte {i + 1}</span>
                      <button
                        className="del"
                        title="Retirer"
                        onClick={() => listDel<CardItem>("cards", cardItems, i)}
                      >
                        🗑
                      </button>
                    </div>
                    <div className="rowedit">
                      <input
                        style={{ maxWidth: 60 }}
                        value={c.icon}
                        placeholder="🎓"
                        onChange={(e) =>
                          listSet<CardItem>("cards", cardItems, i, { icon: e.target.value })
                        }
                      />
                      <input
                        value={c.title}
                        placeholder="Titre"
                        onChange={(e) =>
                          listSet<CardItem>("cards", cardItems, i, { title: e.target.value })
                        }
                      />
                    </div>
                    <textarea
                      value={c.desc}
                      placeholder="Description"
                      onChange={(e) =>
                        listSet<CardItem>("cards", cardItems, i, { desc: e.target.value })
                      }
                    />
                    <input
                      value={c.href}
                      placeholder="Lien (ex. /filieres)"
                      onChange={(e) =>
                        listSet<CardItem>("cards", cardItems, i, { href: e.target.value })
                      }
                    />
                    <div className="swatches" style={{ marginTop: 6 }}>
                      {ACCENT_COLORS.map((cc) => (
                        <span
                          key={cc}
                          className={`swatch${c.color === cc ? " on" : ""}`}
                          style={{ background: cc }}
                          onClick={() =>
                            listSet<CardItem>("cards", cardItems, i, { color: cc })
                          }
                        />
                      ))}
                      <input
                        type="color"
                        className="swatch-pick"
                        title="Couleur personnalisée"
                        value={/^#/.test(c.color) ? c.color : "#284193"}
                        onChange={(e) =>
                          listSet<CardItem>("cards", cardItems, i, { color: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ))}
                <button
                  className="abtn ghost sm"
                  onClick={() =>
                    listAdd<CardItem>("cards", cardItems, {
                      icon: "✨",
                      title: "Nouvelle carte",
                      desc: "",
                      href: "#",
                      color: "var(--royal)",
                    })
                  }
                >
                  + Carte
                </button>
              </>
            )}
            {selected.type === "split" && (
              <>
                {txt("eyebrow", "Sur-titre")}
                {txt("title", "Titre")}
                {txt("icon", "Icône (emoji)")}
                <div className="isub">Étiquettes</div>
                {splitTags.map((t, i) => (
                  <div className="field rowedit" key={i}>
                    <input
                      value={t}
                      placeholder="Étiquette"
                      onChange={(e) =>
                        upd(
                          "tags",
                          splitTags.map((x, idx) => (idx === i ? e.target.value : x))
                        )
                      }
                    />
                    <button
                      className="del"
                      title="Retirer"
                      onClick={() =>
                        upd("tags", splitTags.filter((_, idx) => idx !== i))
                      }
                    >
                      🗑
                    </button>
                  </div>
                ))}
                <button
                  className="abtn ghost sm"
                  onClick={() => upd("tags", [...splitTags, ""])}
                >
                  + Étiquette
                </button>
                <div className="isub">Points clés</div>
                {splitChecks.map((c, i) => (
                  <div className="itemcard" key={i}>
                    <div className="itemcard-head">
                      <span>Point {i + 1}</span>
                      <button
                        className="del"
                        title="Retirer"
                        onClick={() => listDel<CheckItem>("checks", splitChecks, i)}
                      >
                        🗑
                      </button>
                    </div>
                    <input
                      value={c.title}
                      placeholder="Titre"
                      onChange={(e) =>
                        listSet<CheckItem>("checks", splitChecks, i, { title: e.target.value })
                      }
                    />
                    <textarea
                      value={c.desc}
                      placeholder="Description"
                      onChange={(e) =>
                        listSet<CheckItem>("checks", splitChecks, i, { desc: e.target.value })
                      }
                    />
                  </div>
                ))}
                <button
                  className="abtn ghost sm"
                  onClick={() =>
                    listAdd<CheckItem>("checks", splitChecks, { title: "", desc: "" })
                  }
                >
                  + Point clé
                </button>
              </>
            )}
            {selected.type === "quote" && (
              <>
                {txt("quote", "Citation", true)}
                {txt("who", "Auteur")}
              </>
            )}
            {selected.type === "cta" && (
              <>
                {txt("title", "Titre")}
                {txt("body", "Texte", true)}
                {txt("btn", "Texte du bouton")}
                {txt("link", "Lien du bouton")}
              </>
            )}
            {selected.type === "banner" && (
              <>
                {txt("eyebrow", "Sur-titre")}
                {txt("title", "Titre")}
                <div className="ihint">
                  Astuce : entourez un mot d&apos;*astérisques* pour l&apos;accent.
                </div>
                {txt("sub", "Sous-titre", true)}
                {colorField("color", "Couleur de fond")}
                {colorField("textColor", "Couleur du texte", TEXT_COLORS)}
              </>
            )}
            {selected.type === "newslist" && (
              <>
                {info("La liste des articles est automatique (gérée dans « Actus »). Laissez l'en-tête vide pour utiliser un bloc « En-tête de page » à la place.")}
                {txt("eyebrow", "Sur-titre (facultatif)")}
                {txt("title", "Titre (facultatif)")}
                {txt("lead", "Phrase d'introduction (facultatif)", true)}
              </>
            )}
            {selected.type === "menu" && (
              <>
                {txt("eyebrow", "Sur-titre")}
                {txt("title", "Titre")}
                {txt("lead", "Phrase d'introduction", true)}
                {info("Le menu de la semaine est automatique (géré dans « Menu »).")}
                <div className="isub">Réservation</div>
                {txt("note", "Phrase au-dessus du bouton", true)}
                {txt("btn", "Texte du bouton (vide = masqué)")}
                {txt("link", "Lien du bouton")}
              </>
            )}
            {selected.type === "downloads" && (
              <>
                {txt("title", "Titre (facultatif)")}
                <div className="isub">Boutons</div>
                {downloadItems.map((it, i) => (
                  <div className="itemcard" key={i}>
                    <div className="itemcard-head">
                      <span>Bouton {i + 1}</span>
                      <button
                        className="del"
                        title="Retirer"
                        onClick={() => listDel<DownloadItem>("downloads", downloadItems, i)}
                      >
                        🗑
                      </button>
                    </div>
                    <input
                      value={it.label}
                      placeholder="Texte du bouton"
                      onChange={(e) =>
                        listSet<DownloadItem>("downloads", downloadItems, i, { label: e.target.value })
                      }
                    />
                    <input
                      value={it.href}
                      placeholder="Lien / fichier (ex. /calendrier-2026-2027.pdf)"
                      onChange={(e) =>
                        listSet<DownloadItem>("downloads", downloadItems, i, { href: e.target.value })
                      }
                    />
                    <div className="field tog" style={{ margin: 0 }}>
                      <label>Bouton principal (orange)</label>
                      <button
                        className={`switch${it.primary ? " on" : ""}`}
                        onClick={() =>
                          listSet<DownloadItem>("downloads", downloadItems, i, { primary: !it.primary })
                        }
                        aria-label="Bouton principal"
                      >
                        <span></span>
                      </button>
                    </div>
                    <div className="field tog" style={{ margin: 0 }}>
                      <label>Téléchargement direct (.ics, .pdf…)</label>
                      <button
                        className={`switch${it.download ? " on" : ""}`}
                        onClick={() =>
                          listSet<DownloadItem>("downloads", downloadItems, i, { download: !it.download })
                        }
                        aria-label="Téléchargement direct"
                      >
                        <span></span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  className="abtn ghost sm"
                  onClick={() =>
                    listAdd<DownloadItem>("downloads", downloadItems, {
                      label: "Nouveau bouton",
                      href: "#",
                      download: false,
                      primary: false,
                    })
                  }
                >
                  + Bouton
                </button>
                {txt("hint", "Note sous les boutons", true)}
              </>
            )}
            {selected.type === "text" && (
              <>
                {txt("title", "Titre")}
                {txt("body", "Contenu", true)}
              </>
            )}
            {selected.type === "news" && (
              <>
                {txt("title", "Titre de section")}
                {info("Ce bloc affiche automatiquement les 3 dernières actualités publiées.")}
              </>
            )}
            {selected.type === "grid" && (
              <>
                {txt("title", "Titre du tableau")}
                <div className="isub">Colonnes</div>
                {txt("th1", "En-tête colonne 1")}
                {txt("th2", "En-tête colonne 2")}
                <div className="isub">
                  Lignes {gridRows.length > 0 && `(${gridRows.length})`}
                </div>
                {gridRows.map((r, i) => (
                  <div className="grid-row-edit" key={i}>
                    <input
                      value={r.c}
                      onChange={(e) => gridSetCell(i, "c", e.target.value)}
                      placeholder="Intitulé"
                    />
                    <input
                      value={r.p}
                      onChange={(e) => gridSetCell(i, "p", e.target.value)}
                      placeholder="Valeur"
                    />
                    <button
                      type="button"
                      className="grid-row-x"
                      onClick={() => gridRemoveRow(i)}
                      aria-label="Supprimer la ligne"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="abtn ghost"
                  style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                  onClick={gridAddRow}
                >
                  + Ajouter une ligne
                </button>
              </>
            )}
            {selected.type === "gallery" && (
              <>
                {txt("title", "Titre")}
                <div className="field">
                  <label>
                    Photos {gallery.length > 0 && `(${gallery.length})`}
                  </label>
                  <div className="gal-edit">
                    {gallery.map((src, i) => (
                      <ImageUpload
                        key={i}
                        value={src}
                        onChange={(url) => galSet(i, url)}
                      />
                    ))}
                  </div>
                  <ImageUpload value={null} onChange={galAdd} />
                  {gallery.length === 0 &&
                    info("Sans photo, la galerie affiche des vignettes colorées par défaut.")}
                </div>
              </>
            )}
            {selected.type === "contact" && (
              <>
                {txt("title", "Titre")}
                {txt("addr", "Adresse")}
                {txt("tel", "Téléphone")}
                {txt("mail", "E-mail")}
              </>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

export default function PageEditor() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  );
}
