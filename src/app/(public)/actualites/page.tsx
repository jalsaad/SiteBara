import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import PageBlocks from "@/components/PageBlocks";

export const metadata: Metadata = {
  title: "Actualités",
  description:
    "Toute la vie de l'école : événements, projets, sorties et informations pratiques de l'Athénée Royal Jules Bara.",
};

export const dynamic = "force-dynamic";

// Page éditable via l'éditeur (page composée « actualites ») ; la liste des
// articles reste alimentée par /admin/actus (bloc « Liste des actualités »).
export default async function ActualitesPage() {
  const page = await getPage("actualites");
  if (!page || page.blocks.length === 0) {
    return (
      <main className="wrap section">
        <div className="shead">
          <h1 className="serif">Actualités</h1>
        </div>
      </main>
    );
  }
  return (
    <main>
      <PageBlocks blocks={page.blocks} />
    </main>
  );
}
