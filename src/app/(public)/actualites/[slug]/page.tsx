import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticle, formatDateFr } from "@/lib/articles";
import { shade, CATEGORY_ICONS } from "@/lib/colors";

export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || article.status !== "PUBLISHED") notFound();

  return (
    <main>
      <section
        className="hero"
        style={
          article.image
            ? {
                backgroundImage: `linear-gradient(160deg,rgba(27,34,69,.78),rgba(27,34,69,.55)),url(${article.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: `linear-gradient(160deg,${shade(article.color)},${article.color})`,
              }
        }
      >
        <div className="hero-in" style={{ padding: "72px 30px", gridTemplateColumns: "1fr" }}>
          <div className="reveal in">
            <span className="pill">
              <span className="dot" /> {CATEGORY_ICONS[article.category] ?? "📰"}{" "}
              {article.category} · {formatDateFr(article.publishedAt)}
            </span>
            <h1 className="serif" style={{ fontSize: "clamp(32px,4.6vw,54px)" }}>
              {article.title}
            </h1>
            <p className="sub">{article.excerpt}</p>
          </div>
        </div>
      </section>
      <section className="wrap section" style={{ maxWidth: 860 }}>
        {article.video && (
          <video
            className="article-video"
            src={article.video}
            controls
            playsInline
            preload="metadata"
          />
        )}
        <article style={{ fontSize: 17, whiteSpace: "pre-line" }}>
          {article.body || article.excerpt}
        </article>
        {article.images.length > 0 && (
          <div className="pub-gal" style={{ marginTop: 36 }}>
            {article.images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" />
            ))}
          </div>
        )}
        <p style={{ marginTop: 40 }}>
          <Link className="btn btn-ghost" style={{ borderColor: "var(--line)", color: "var(--royal)" }} href="/actualites">
            ← Toutes les actualités
          </Link>
        </p>
      </section>
    </main>
  );
}
