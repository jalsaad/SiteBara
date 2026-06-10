import type { Metadata } from "next";
import NewsCard from "@/components/NewsCard";
import { listArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Actualités",
  description:
    "Toute la vie de l'école : événements, projets, sorties et informations pratiques de l'Athénée Royal Jules Bara.",
};

export const dynamic = "force-dynamic";

export default async function ActualitesPage() {
  const news = await listArticles({ publishedOnly: true });

  return (
    <main className="news-band">
      <div className="wrap section">
        <div className="shead reveal in">
          <span className="eyebrow">Vie de l&apos;école</span>
          <h2 className="serif">
            Toutes les <em>actualités</em>
          </h2>
          <p className="lead">
            Événements, projets et informations pratiques de l&apos;Athénée
            Royal Jules Bara.
          </p>
        </div>
        <div className="news-grid" style={{ marginTop: 42 }}>
          {news.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      </div>
    </main>
  );
}
