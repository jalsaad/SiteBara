import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import JuliaChat from "@/components/JuliaChat";
import { listPages } from "@/lib/pages";
import { CORE_PAGE_SLUGS } from "@/lib/page-types";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Pages composées publiées → entrées du menu. On exclut les pages « cœur »
  // (accueil, options, calendrier, actualités, restaurant) : elles ont déjà
  // leur lien fixe dans la nav et leur propre route.
  const pages = (await listPages())
    .filter((p) => p.published && !CORE_PAGE_SLUGS.includes(p.slug))
    .map((p) => ({ href: `/p/${p.slug}`, label: p.title }));

  return (
    <>
      <Nav pages={pages} />
      {children}
      <Footer />
      <Reveal />
      <JuliaChat />
    </>
  );
}
