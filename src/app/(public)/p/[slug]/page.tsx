import { notFound } from "next/navigation";
import { getPage } from "@/lib/pages";
import PageBlocks from "@/components/PageBlocks";

export const dynamic = "force-dynamic";

// Rendu public des pages composées dans l'éditeur drag-and-drop.
export default async function ComposedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page || !page.published) notFound();

  return (
    <main>
      <PageBlocks blocks={page.blocks} />
    </main>
  );
}
