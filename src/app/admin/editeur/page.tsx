"use client";

// Éditeur de pages « drag-and-drop » — port React de la maquette validée.
// Les blocs sont stockés en l'état dans le composant ; la persistance
// (modèles Page/Block en base) se branche sur les boutons Enregistrer/Publier.

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Article } from "@/lib/article-types";
import type { Block, BlockData, BlockType } from "@/lib/page-types";
import {
  BLOCK_LABELS as LABELS,
  BLOCK_TEMPLATES as TEMPLATES,
  blockId as bid,
} from "@/lib/page-types";
import { shade, hexA, ACCENT_COLORS } from "@/lib/colors";
import { useToast } from "@/components/Toast";

interface PageMeta {
  slug: string;
  title: string;
  published: boolean;
}

const PALETTE: { type: BlockType; icon: string; desc: string }[] = [
  { type: "hero", icon: "🖼️", desc: "Image + titre" },
  { type: "text", icon: "📝", desc: "Paragraphe riche" },
  { type: "news", icon: "📰", desc: "Auto, 3 articles" },
  { type: "grid", icon: "🗂️", desc: "Tableau" },
  { type: "gallery", icon: "🏞️", desc: "Photos" },
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
    return (
      <div className={`r-hero${d.anim ? " r-anim" : ""}`} style={{ background: bg }}>
        {d.effects && <span className="rgrain" />}
        {d.effects && (
          <>
            <span className="rb rb1" />
            <span className="rb rb2" />
          </>
        )}
        <div className="rh-in">
          <span className="p">{d.pill}</span>
          <h3>{renderTitle(d.title ?? "")}</h3>
          <div className="s">{d.sub}</div>
          <div className="rbtns">
            <a className="b">{d.btn1} →</a>
            {d.btn2 && <a className="b2">{d.btn2}</a>}
          </div>
        </div>
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
    return (
      <div className="r-grid">
        <div className="h">{d.title}</div>
        <table>
          <thead>
            <tr>
              <th>Cours</th>
              <th>Périodes</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Français</td><td>5</td></tr>
            <tr><td>Mathématiques</td><td>4</td></tr>
            <tr><td>Sciences</td><td>3</td></tr>
            <tr><td>Langues modernes</td><td>4</td></tr>
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "gallery") {
    const cols = ["#284193", "#f57a20", "#0f9e75", "#1b2245", "#7c4dff", "#284193", "#0f9e75", "#f57a20"];
    return (
      <div className="r-gal">
        <div className="h">{d.title}</div>
        <div className="g">
          {cols.map((c, i) => (
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
  const slug = searchParams.get("page") ?? "accueil";

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
    refreshPages();
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
      if (target === slug) router.replace("/admin/editeur?page=accueil");
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Suppression impossible");
    }
  }

  async function persist(publish: boolean) {
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
              {p.slug !== "accueil" && (
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
                <div className="field">
                  <label>Couleur d&apos;accent</label>
                  <div className="swatches">
                    {ACCENT_COLORS.map((c) => (
                      <span
                        key={c}
                        className={`swatch${selected.data.color === c ? " on" : ""}`}
                        style={{ background: c }}
                        onClick={() => upd("color", c)}
                      />
                    ))}
                  </div>
                </div>
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
                <div className="isub">Effets &amp; animations</div>
                {tog("effects", "Effets visuels (halos, grain)")}
                {tog("anim", "Animations d'apparition")}
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
                {info("Les lignes du tableau s'éditeront directement dans une prochaine version.")}
              </>
            )}
            {selected.type === "gallery" && (
              <>
                {txt("title", "Titre")}
                <div className="field">
                  <label>Photos</label>
                  <div
                    style={{
                      border: "2px dashed #d4dae3",
                      borderRadius: 10,
                      padding: 18,
                      textAlign: "center",
                      color: "#98a2b3",
                      fontSize: 13,
                    }}
                  >
                    📤 Déposez des images
                  </div>
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
