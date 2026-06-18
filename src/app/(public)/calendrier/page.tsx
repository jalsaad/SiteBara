import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import PageBlocks from "@/components/PageBlocks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendrier scolaire 2026-2027",
  description:
    "Congés, vacances et dates clés de l'année scolaire 2026-2027 à l'Athénée Royal Jules Bara, selon le calendrier officiel de la Fédération Wallonie-Bruxelles. PDF à consulter et ajout des vacances à votre agenda.",
};

// Page éditable via l'éditeur (page composée « calendrier »).
export default async function CalendrierPage() {
  const page = await getPage("calendrier");
  if (!page || page.blocks.length === 0) {
    return (
      <main className="wrap section">
        <div className="shead">
          <h1 className="serif">Calendrier scolaire</h1>
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
