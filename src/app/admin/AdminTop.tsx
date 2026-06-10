"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface Me {
  email: string;
  role: "ADMIN" | "COMM";
}

export default function AdminTop() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => {});
  }, [pathname]);

  if (pathname === "/admin/login") return null;

  const crumb = pathname.startsWith("/admin/editeur")
    ? "Pages › Accueil"
    : pathname.startsWith("/admin/messages")
      ? "Messages reçus"
      : "Actualités";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-top">
      <span className="t">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-dark.png" alt="Jules Bara" style={{ height: 26, width: "auto" }} />
      </span>
      <span className="crumb">{crumb}</span>
      <div className="right">
        {me?.role === "ADMIN" && (
          <Link
            className={`abtn ${pathname.startsWith("/admin/editeur") ? "save" : "ghost"}`}
            href="/admin/editeur"
          >
            🧩 Éditeur de page
          </Link>
        )}
        <Link
          className={`abtn ${pathname.startsWith("/admin/actus") ? "save" : "ghost"}`}
          href="/admin/actus"
        >
          📰 Actualités
        </Link>
        <Link
          className={`abtn ${pathname.startsWith("/admin/messages") ? "save" : "ghost"}`}
          href="/admin/messages"
        >
          📬 Messages
        </Link>
        <Link className="abtn ghost" href="/" target="_blank">
          👁 Voir le site
        </Link>
        {me && (
          <button className="abtn ghost" onClick={logout} title={me.email}>
            ⎋ Déconnexion
          </button>
        )}
      </div>
    </div>
  );
}
