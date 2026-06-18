import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import PageBlocks from "@/components/PageBlocks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nos options",
  description:
    "Du premier au troisième degré, enseignement général de transition, DASPA et 7ᵉ préparatoire : découvrez les options de l'Athénée Royal Jules Bara à Tournai.",
};

// Page éditable via l'éditeur (page composée « filieres »).
export default async function FilieresPage() {
  const page = await getPage("filieres");
  if (!page || page.blocks.length === 0) {
    return (
      <main className="wrap section">
        <div className="shead">
          <h1 className="serif">Nos options</h1>
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
