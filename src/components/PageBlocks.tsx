// Rendu public (pleine largeur) des blocs composés dans l'éditeur.

import NewsCard from "@/components/NewsCard";
import { listArticles } from "@/lib/articles";
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

export default function PageBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b) => {
        const d = b.data;
        if (b.type === "hero") {
          const color = d.color ?? "#1b2245";
          const ov = overlayStyle(d.overlay, d.overlayOpacity);
          const bp = borderPath(d.border);
          return (
            <section className="hero" key={b.id}>
              {d.video && (
                <video
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
                  <path d={bp} fill="var(--cream)" />
                </svg>
              )}
              <div
                className="hero-in"
                style={{ gridTemplateColumns: "1fr", padding: "84px 30px" }}
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
          return (
            <section className="wrap section" key={b.id}>
              <div className="shead reveal">
                <h2 className="serif">{d.title}</h2>
              </div>
              <div className="pub-gal reveal">
                {images.length > 0
                  ? images.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" />
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
