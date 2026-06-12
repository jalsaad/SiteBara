import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { listPages } from "@/lib/pages";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Pages composées publiées → entrées du menu (l'accueil a déjà son lien).
  const pages = (await listPages())
    .filter((p) => p.published && p.slug !== "accueil")
    .map((p) => ({ href: `/p/${p.slug}`, label: p.title }));

  return (
    <>
      <Nav pages={pages} />
      {children}
      <Footer />
      <Reveal />
    </>
  );
}
