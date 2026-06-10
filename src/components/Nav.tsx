"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/#mission", label: "L'école" },
  { href: "/#grilles", label: "Grilles" },
  { href: "/actualites", label: "Actus" },
  { href: "/#restaurant", label: "Restaurant" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

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
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link className="nav-cta" href="/#contact">
          Préinscription
        </Link>
      </div>
    </header>
  );
}
