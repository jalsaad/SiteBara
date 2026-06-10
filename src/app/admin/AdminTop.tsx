"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminTop() {
  const pathname = usePathname();
  const crumb = pathname.startsWith("/admin/editeur")
    ? "Pages › Accueil"
    : "Actualités";

  return (
    <div className="admin-top">
      <span className="t">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-dark.png" alt="Jules Bara" style={{ height: 26, width: "auto" }} />
      </span>
      <span className="crumb">{crumb}</span>
      <div className="right">
        <Link
          className={`abtn ${pathname.startsWith("/admin/editeur") ? "save" : "ghost"}`}
          href="/admin/editeur"
        >
          🧩 Éditeur de page
        </Link>
        <Link
          className={`abtn ${pathname.startsWith("/admin/actus") ? "save" : "ghost"}`}
          href="/admin/actus"
        >
          📰 Actualités
        </Link>
        <Link className="abtn ghost" href="/" target="_blank">
          👁 Voir le site
        </Link>
      </div>
    </div>
  );
}
