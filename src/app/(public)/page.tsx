import { getPage } from "@/lib/pages";
import PageBlocks from "@/components/PageBlocks";

export const dynamic = "force-dynamic";

// La page d'accueil est désormais ÉDITABLE : son contenu vient de la page
// composée « accueil » (éditeur de pages) et est rendu via PageBlocks.
export default async function HomePage() {
  const page = await getPage("accueil");

  if (!page || page.blocks.length === 0) {
    return (
      <main className="wrap section">
        <div className="shead">
          <h1 className="serif">Athénée Royal Jules Bara</h1>
          <p className="lead">
            La page d&apos;accueil n&apos;est pas encore configurée. Rendez-vous
            dans l&apos;éditeur de pages pour la composer.
          </p>
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
