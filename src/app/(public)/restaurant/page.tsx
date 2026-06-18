import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import PageBlocks from "@/components/PageBlocks";

// Le menu est éditable à tout moment depuis /admin/menu : rendu à la demande.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Restaurant scolaire",
  description:
    "Menus de la semaine, horaires, tarifs et informations pratiques du restaurant scolaire de l'Athénée Royal Jules Bara à Tournai.",
};

// Page éditable via l'éditeur (page composée « restaurant ») ; le menu de la
// semaine reste alimenté par /admin/menu (bloc « Menu du restaurant »).
export default async function RestaurantPage() {
  const page = await getPage("restaurant");
  if (!page || page.blocks.length === 0) {
    return (
      <main className="wrap section">
        <div className="shead">
          <h1 className="serif">Restaurant scolaire</h1>
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
