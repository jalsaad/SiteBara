"use client";

import { useEffect } from "react";

// Anime l'apparition au scroll de tout élément portant la classe .reveal,
// avec un léger décalage en cascade entre voisins (comportement de la maquette).
export default function Reveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.in)");
    els.forEach((el, i) => {
      if (!el.style.transitionDelay) {
        el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
      }
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
