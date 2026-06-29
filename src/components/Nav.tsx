"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string };

export default function Nav({ pages = [] }: { pages?: NavLink[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  function openJulia() {
    window.dispatchEvent(new CustomEvent("julia:open"));
    close();
  }

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}${menuOpen ? " open" : ""}`}>
      <div className="nav-in">
        <Link href="/" onClick={close}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="nav-logo"
            src="/logo-dark.png"
            alt="Athénée Royal Jules Bara"
          />
        </Link>

        <nav className="nav-links">
          {pages.map((l) => (
            <Link key={l.label} href={l.href}>{l.label}</Link>
          ))}
          {/* Dropdown Contact / Préinscription */}
          <div className="nav-dropdown">
            <button className="nav-dropdown-trigger">
              Contact <span className="nav-chevron">▾</span>
            </button>
            <div className="nav-submenu">
              <Link href="/contact">Contact</Link>
              <Link href="/preinscription">Préinscription</Link>
            </div>
          </div>
        </nav>

        <button className="nav-julia-btn" onClick={openJulia}>
          <span className="julia-spark">✦</span>
          Demandez à Julia
        </button>

        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <nav className="nav-mobile" aria-label="Navigation mobile">
          {pages.map((l) => (
            <Link key={l.label} href={l.href} onClick={close}>{l.label}</Link>
          ))}
          <Link href="/contact" onClick={close}>Contact</Link>
          <Link href="/preinscription" onClick={close}>Préinscription</Link>
          <button className="nav-julia-btn nav-mobile-julia" onClick={openJulia}>
            <span className="julia-spark">✦</span>
            Demandez à Julia
          </button>
        </nav>
      )}
    </header>
  );
}
