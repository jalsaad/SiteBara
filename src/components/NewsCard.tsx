import Link from "next/link";
import type { Article } from "@/lib/article-types";
import { formatDateFr } from "@/lib/article-types";
import { shade, CATEGORY_ICONS } from "@/lib/colors";

export default function NewsCard({ article }: { article: Article }) {
  return (
    <Link href={`/actualites/${article.slug}`}>
      <article className="ncard reveal">
        <div
          className="ph"
          style={
            article.image
              ? { backgroundImage: `url(${article.image})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: `linear-gradient(135deg,${article.color},${shade(article.color)})` }
          }
        >
          {!article.image && (
            <div className="ic">{CATEGORY_ICONS[article.category] ?? "📰"}</div>
          )}
          <span className="cat">{article.category}</span>
        </div>
        <div className="bd">
          <span className="date">{formatDateFr(article.publishedAt)}</span>
          <h3 className="serif">{article.title}</h3>
          <p>{article.excerpt}</p>
          <span className="more">Lire l&apos;article →</span>
        </div>
      </article>
    </Link>
  );
}
