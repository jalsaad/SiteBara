"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavLink = { href: string; label: string };

export default function Nav({ pages = [] }: { pages?: NavLink[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [juliaOpen, setJuliaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openContact() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setContactOpen(true);
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setContactOpen(false), 200);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onOpen = () => setJuliaOpen(true);
    const onClose = () => setJuliaOpen(false);
    window.addEventListener("julia:opened", onOpen);
    window.addEventListener("julia:closed", onClose);
    return () => {
      window.removeEventListener("julia:opened", onOpen);
      window.removeEventListener("julia:closed", onClose);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  function openJulia() {
    try { new Audio("/universfield-level-up-191997.mp3").play(); } catch {}
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
          <div
            className={`nav-dropdown${contactOpen ? " open" : ""}`}
            onMouseEnter={openContact}
            onMouseLeave={scheduleClose}
          >
            <button
              className="nav-dropdown-trigger"
              onClick={() => setContactOpen((o) => !o)}
              aria-expanded={contactOpen}
            >
              Contact <span className="nav-chevron">▾</span>
            </button>
            <div className="nav-submenu">
              <Link href="/contact" onClick={close}>Contact</Link>
              <Link href="/preinscription" onClick={close}>Préinscription</Link>
            </div>
          </div>
        </nav>

        {!juliaOpen && (
          <button className="nav-julia-btn" onClick={openJulia}>
            <span className="julia-spark">✦</span>
            Demandez à Jules
          </button>
        )}

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
            Demandez à Jules
          </button>
        </nav>
      )}
    </header>
  );
}
