"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string };

// Entrées fixes du menu (routes spéciales non gérées par l'éditeur), ajoutées
// après les pages éditables.
const FIXED_LINKS: NavLink[] = [{ href: "/contact", label: "Contact" }];

export default function Nav({ pages = [] }: { pages?: NavLink[] }) {
  const [scrolled, setScrolled] = useState(false);
  const links = [...pages, ...FIXED_LINKS];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="nav-in">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="nav-logo"
            src="/logo-dark.png"
            alt="Athénée Royal Jules Bara"
          />
        </Link>
        <nav className="nav-links">
          {links.map((l) => (
            <Link key={l.label} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link className="nav-cta" href="/preinscription">
          Préinscription
        </Link>
      </div>
    </header>
  );
}
