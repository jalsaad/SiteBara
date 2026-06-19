import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import PageBlocks from "@/components/PageBlocks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Applis & outils",
  description:
    "Accès rapides aux espaces numériques de l'Athénée Royal Jules Bara (Google Classroom, APSchool, École en ligne) et outils pratiques : générateur de QR code, conversion d'images en PDF.",
};

// Page éditable via l'éditeur (page composée « applis ») ; la section « Outils
// pratiques » (QR code, images→PDF) est un bloc verrouillé non éditable.
export default async function ApplisPage() {
  const page = await getPage("applis");
  if (!page || page.blocks.length === 0) {
    return (
      <main className="wrap section">
        <div className="shead">
          <h1 className="serif">Applis &amp; outils</h1>
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
