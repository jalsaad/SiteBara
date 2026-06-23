// Rendu public (pleine largeur) des blocs composés dans l'éditeur.

function ytId(raw: string): string {
  if (!raw) return "";
  const m = raw.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : raw.trim();
}

import NewsCard from "@/components/NewsCard";
import ContentHero from "@/components/ContentHero";
import MenuWeeks from "@/components/MenuWeeks";
import ToolLauncher from "@/components/ToolLauncher";
import LivePlayer from "@/components/LivePlayer";
import { listArticles } from "@/lib/articles";
import { getPublicMenus } from "@/lib/menu";
import type { Block } from "@/lib/page-types";
import { shade, hexA } from "@/lib/colors";
import { overlayStyle, borderPath } from "@/lib/hero";

function renderTitle(title: string) {
  const parts = title.split(/\*(.+?)\*/g);
  return parts.map((p, i) => (i % 2 === 1 ? <em key={i}>{p}</em> : p));
}

function heroVeil(color: string, bg?: string, hasVideo?: boolean): string {
  const cs = shade(color);
  // Sur une vidéo, le voile reste translucide pour la laisser transparaître
  // tout en gardant le texte lisible.
  if (hasVideo) {
    return `linear-gradient(160deg,${hexA(cs, 0.62)},${hexA(color, 0.5)})`;
  }
  if (bg === "solid") return `linear-gradient(160deg,${cs},${color})`;
  if (bg === "texture") {
    return `radial-gradient(120% 120% at 80% 0%,${hexA(color, 0.42)},transparent 58%),radial-gradient(90% 90% at 0% 100%,rgba(245,122,32,.26),transparent 52%),linear-gradient(160deg,${hexA(cs, 0.92)},${hexA(color, 0.85)})`;
  }
  return `linear-gradient(160deg,${hexA(cs, 0.95)},${hexA(color, 0.88)})`;
}

async function NewsBlock({ title }: { title?: string }) {
  const news = await listArticles({ publishedOnly: true, limit: 3 });
  return (
    <section className="news-band">
      <div className="wrap section">
        <div className="shead" style={{ marginBottom: 42 }}>
          <span className="eyebrow">Vie de l&apos;école</span>
          <h2 className="serif">{title}</h2>
        </div>
        <div className="news-grid">
          {news.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Liste complète des actualités publiées (page /actualites). Contenu géré dans
// /admin/actus — seuls les intitulés de la section sont éditables.
async function NewsListBlock({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title?: string;
  lead?: string;
}) {
  const news = await listArticles({ publishedOnly: true });
  // En-tête optionnel : s'il est vide, on n'affiche que la grille (l'en-tête
  // peut alors être un bloc « En-tête de page » distinct, comme les autres pages).
  const hasHead = !!(eyebrow || title || lead);
  return (
    <section className="news-band">
      <div className="wrap section">
        {hasHead && (
          <div className="shead reveal in">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2 className="serif">{renderTitle(title)}</h2>}
            {lead && <p className="lead">{lead}</p>}
          </div>
        )}
        <div className="news-grid" style={hasHead ? { marginTop: 42 } : undefined}>
          {news.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Menu de la semaine du restaurant (page /restaurant). Contenu géré dans
// /admin/menu — seuls les intitulés et le bouton de réservation sont éditables.
async function MenuBlock({
  eyebrow,
  title,
  lead,
  note,
  btn,
  link,
}: {
  eyebrow?: string;
  title?: string;
  lead?: string;
  note?: string;
  btn?: string;
  link?: string;
}) {
  const weeks = await getPublicMenus();
  return (
    <section className="wrap section">
      <div className="shead reveal">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="serif">{renderTitle(title ?? "")}</h2>
        {lead && <p className="lead">{lead}</p>}
      </div>
      <div className="reveal">
        <MenuWeeks weeks={weeks} />
      </div>
      {(note || btn) && (
        <div className="resto-reserve reveal">
          {note && <p>{note}</p>}
          {btn && (
            <a
              className="btn btn-orange"
              href={link || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              {btn} →
            </a>
          )}
        </div>
      )}
    </section>
  );
}

export default function PageBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b) => {
        const d = b.data;
        if (b.type === "banner") {
          return (
            <ContentHero
              key={b.id}
              eyebrow={d.eyebrow ?? ""}
              title={renderTitle(d.title ?? "")}
              sub={d.sub}
              color={d.color || "#284193"}
              textColor={d.textColor}
            />
          );
        }
        if (b.type === "newslist") {
          return (
            <NewsListBlock
              key={b.id}
              eyebrow={d.eyebrow}
              title={d.title}
              lead={d.lead}
            />
          );
        }
        if (b.type === "menu") {
          return (
            <MenuBlock
              key={b.id}
              eyebrow={d.eyebrow}
              title={d.title}
              lead={d.lead}
              note={d.note}
              btn={d.btn}
              link={d.link}
            />
          );
        }
        if (b.type === "tools") {
          // Bloc verrouillé : section « Outils pratiques » (QR code + images→PDF),
          // entièrement côté navigateur. Non éditable dans l'éditeur.
          return (
            <section className="news-band" key={b.id}>
              <div className="wrap section">
                <div className="shead reveal">
                  <span className="eyebrow">Outils pratiques</span>
                  <h2 className="serif">
                    À utiliser <em>en un clic</em>
                  </h2>
                  <p className="lead">
                    Ces outils fonctionnent entièrement dans votre navigateur :
                    aucune donnée n&apos;est envoyée sur un serveur.
                  </p>
                </div>
                <ToolLauncher />
              </div>
            </section>
          );
        }
        if (b.type === "downloads") {
          const items = d.downloads ?? [];
          return (
            <section className="wrap section" key={b.id} style={{ paddingBottom: 0 }}>
              {d.title && (
                <div className="shead reveal">
                  <h2 className="serif">{renderTitle(d.title)}</h2>
                </div>
              )}
              <div className="cal-actions reveal">
                {items.map((it, i) => (
                  <a
                    key={i}
                    className={`btn ${it.primary ? "btn-orange" : "btn-ghost"}`}
                    style={
                      it.primary
                        ? undefined
                        : { borderColor: "var(--line)", color: "var(--royal)" }
                    }
                    href={it.href || "#"}
                    {...(it.download
                      ? { download: true }
                      : { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    {it.label}
                  </a>
                ))}
              </div>
              {d.hint && <p className="cal-actions-hint">{d.hint}</p>}
            </section>
          );
        }
        if (b.type === "hero") {
          const color = d.color ?? "#1b2245";
          const ov = overlayStyle(d.overlay, d.overlayOpacity);
          const bp = borderPath(d.border);
          return (
            <section className="hero" key={b.id}>
              {d.video && (
                <video
                  key={d.video}
                  className="hero-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  src={d.video}
                />
              )}
              <div
                className="hero-veil"
                style={{ background: heroVeil(color, d.bg, !!d.video) }}
              />
              {ov && <div className="hero-overlay" style={ov} />}
              {bp && (
                <svg
                  className="hero-border"
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
              <div
                className="hero-in"
                style={{
                  gridTemplateColumns: "1fr",
                  padding: "84px 30px",
                  ...(d.textColor ? { color: d.textColor } : {}),
                }}
              >
                <div className="reveal in">
                  {d.pill && (
                    <span className="pill">
                      <span className="dot" /> {d.pill}
                    </span>
                  )}
                  <h1
                    className="serif"
                    style={{ fontSize: "clamp(34px,5vw,58px)" }}
                  >
                    {renderTitle(d.title ?? "")}
                  </h1>
                  {d.sub && <p className="sub">{d.sub}</p>}
                  <div className="hero-btns">
                    {d.btn1 && (
                      <a className="btn btn-orange" href={d.link1 || "#"}>
                        {d.btn1} →
                      </a>
                    )}
                    {d.btn2 && (
                      <a className="btn btn-ghost" href={d.link2 || "#"}>
                        {d.btn2}
                      </a>
                    )}
                  </div>
                  {d.stats && d.stats.length > 0 && (
                    <div className="hero-stats">
                      {d.stats.map((s, i) => (
                        <div key={i}>
                          <div className="n serif">{s.n}</div>
                          <div className="l">{s.l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }
        if (b.type === "text") {
          return (
            <section className="wrap section" key={b.id}>
              <div className="shead reveal">
                <h2 className="serif">{d.title}</h2>
              </div>
              <p
                className="reveal"
                style={{
                  fontSize: 17,
                  color: "var(--ink-soft)",
                  maxWidth: 760,
                  whiteSpace: "pre-line",
                }}
              >
                {d.body}
              </p>
            </section>
          );
        }
        if (b.type === "news") {
          return <NewsBlock key={b.id} title={d.title} />;
        }
        if (b.type === "grid") {
          const rows = d.rows ?? [];
          return (
            <section className="wrap section" key={b.id}>
              <div className="shead reveal">
                <h2 className="serif">{d.title}</h2>
              </div>
              <table className="pub-table reveal">
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
            </section>
          );
        }
        if (b.type === "gallery") {
          const cols = ["#284193", "#f57a20", "#0f9e75", "#1b2245", "#7c4dff", "#284193", "#0f9e75", "#f57a20"];
          const images = d.images ?? [];
          const galClass = d.portrait ? "pub-gal pub-gal-portrait" : "pub-gal";
          return (
            <section className="wrap section" key={b.id}>
              <div className="shead reveal">
                <h2 className="serif">{d.title}</h2>
              </div>
              <div className={`${galClass} reveal`}>
                {images.length > 0
                  ? images.map((src, i) => (
                      <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" />
                      </a>
                    ))
                  : cols.map((c, i) => (
                      <div
                        key={i}
                        style={{ background: `linear-gradient(135deg,${c},${shade(c)})` }}
                      />
                    ))}
              </div>
            </section>
          );
        }
        if (b.type === "pillars") {
          const items = d.pillars ?? [];
          return (
            <section className="mission" key={b.id}>
              <div className="mission-in">
                {d.intro && (
                  <p className="big serif reveal">{renderTitle(d.intro)}</p>
                )}
                {items.map((p, i) => (
                  <div className="pillar reveal" key={i}>
                    <div className="num">{String(i + 1).padStart(2, "0")}</div>
                    <h3 className="serif">{p.title}</h3>
                    <p>{p.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        }
        if (b.type === "cards") {
          const items = d.cards ?? [];
          return (
            <section className="wrap section" key={b.id}>
              <div className="shead reveal">
                {d.eyebrow && <span className="eyebrow">{d.eyebrow}</span>}
                <h2 className="serif">{renderTitle(d.title ?? "")}</h2>
                {d.lead && <p className="lead">{d.lead}</p>}
              </div>
              <div className="access">
                {items.map((c, i) => (
                  <a
                    className="acard reveal"
                    key={i}
                    style={{ "--c": c.color || "var(--royal)" } as React.CSSProperties}
                    href={c.href || "#"}
                  >
                    <div className="ic">{c.icon}</div>
                    <h3 className="serif">{c.title}</h3>
                    <p>{c.desc}</p>
                    <span className="go">Découvrir →</span>
                  </a>
                ))}
              </div>
            </section>
          );
        }
        if (b.type === "split") {
          const items = d.checks ?? [];
          const tags = d.tags ?? [];
          return (
            <section className="wrap section" key={b.id}>
              <div className="split">
                <div className="split-visual reveal">
                  <div className="ic">{d.icon || "💡"}</div>
                  <div className="tags">
                    {tags.map((t, i) => (
                      <span key={i}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="reveal">
                  {d.eyebrow && <span className="eyebrow">{d.eyebrow}</span>}
                  <h2
                    className="serif"
                    style={{ fontSize: "clamp(28px,3.6vw,40px)", lineHeight: 1.1 }}
                  >
                    {renderTitle(d.title ?? "")}
                  </h2>
                  <ul className="flist">
                    {items.map((c, i) => (
                      <li key={i}>
                        <span className="ck">✓</span>
                        <div>
                          <b>{c.title}</b>
                          <span>{c.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        }
        if (b.type === "quote") {
          return (
            <section className="wrap section" key={b.id}>
              <div className="quote reveal">
                <div className="mark serif">&ldquo;</div>
                <blockquote>{d.quote}</blockquote>
                <div className="who">{d.who}</div>
              </div>
            </section>
          );
        }
        if (b.type === "cta") {
          return (
            <section className="wrap cta-band" key={b.id}>
              <div className="banner reveal">
                <div className="bc">
                  <h2 className="serif">{d.title}</h2>
                  {d.body && <p>{d.body}</p>}
                </div>
                {d.btn && (
                  <a
                    className="btn btn-light"
                    style={{ position: "relative", zIndex: 2 }}
                    href={d.link || "#"}
                  >
                    {d.btn} →
                  </a>
                )}
              </div>
            </section>
          );
        }
        if (b.type === "live") {
          if (!d.liveActive) return null;
          const videoId = ytId(d.liveVideoId ?? "");
          if (!videoId) return null;
          return (
            <section className="live-band" key={b.id}>
              <div className="live-inner">
                <div className="live-head">
                  <span className="live-badge">En direct</span>
                  {d.liveTitle && <h2 className="serif live-title">{d.liveTitle}</h2>}
                  {d.liveDesc && <p className="live-desc">{d.liveDesc}</p>}
                </div>
                <LivePlayer videoId={videoId} title={d.liveTitle} />
              </div>
            </section>
          );
        }
        // contact
        return (
          <section className="wrap section" key={b.id}>
            <div className="pub-contact reveal">
              <h2 className="serif">{d.title}</h2>
              <div className="rowc"><i>📍</i>{d.addr}</div>
              <div className="rowc"><i>📞</i>{d.tel}</div>
              <div className="rowc">
                <i>✉️</i>
                <a href={`mailto:${d.mail}`}>{d.mail}</a>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
