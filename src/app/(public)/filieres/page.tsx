import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import PageBlocks from "@/components/PageBlocks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Grilles horaires",
  description:
    "Du premier au troisième degré, enseignement général de transition, DASPA et 7ᵉ préparatoire : toutes les grilles horaires de l'Athénée Royal Jules Bara à Tournai.",
};

// Page éditable via l'éditeur (page composée « filieres »).
export default async function FilieresPage() {
  const page = await getPage("filieres");
  if (!page || page.blocks.length === 0) {
    return (
      <main className="wrap section">
        <div className="shead">
          <h1 className="serif">Grilles horaires</h1>
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
