import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import JuliaChat from "@/components/JuliaChat";
import { listPages } from "@/lib/pages";
import { CORE_PAGE_SLUGS } from "@/lib/page-types";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Menu de navigation : toutes les pages publiées, dans l'ordre défini par
  // glisser-déposer dans l'éditeur. Chaque slug pointe vers sa route (les pages
  // « cœur » ont une route dédiée, les autres sont rendues sur /p/[slug]).
  const pageHref = (slug: string) =>
    slug === "accueil"
      ? "/"
      : CORE_PAGE_SLUGS.includes(slug)
        ? `/${slug}`
        : `/p/${slug}`;
  const pages = (await listPages())
    .filter((p) => p.published)
    .map((p) => ({ href: pageHref(p.slug), label: p.title }));

  return (
    <>
      <Nav pages={pages} />
      {children}
      <Footer pages={pages} />
      <Reveal />
      <JuliaChat />
    </>
  );
}
