import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE, type Role } from "@/lib/auth";

// Page d'accueil de l'admin selon le rôle (cible des redirections d'accès).
function homeFor(role: Role): string {
  if (role === "CUISINE") return "/admin/menu";
  return "/admin/actus";
}

// Protège l'interface d'administration :
//  - /admin/login reste public (redirige si déjà connecté)
//  - le reste de /admin exige une session valide
//  - éditeur de pages et gestion des comptes → ADMIN
//  - actualités et messages → ADMIN ou COMM
//  - menu de la semaine → ADMIN ou CUISINE
// Les API d'écriture sont protégées dans les route handlers (requireRole).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );

  if (pathname === "/admin/login") {
    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const allowed: Record<string, Role[]> = {
    "/admin/editeur": ["ADMIN"],
    "/admin/utilisateurs": ["ADMIN"],
    "/admin/actus": ["ADMIN", "COMM"],
    "/admin/messages": ["ADMIN", "COMM"],
    "/admin/menu": ["ADMIN", "CUISINE"],
  };
  const section = Object.keys(allowed).find((p) => pathname.startsWith(p));
  if (section && !allowed[section].includes(session.role)) {
    return NextResponse.redirect(new URL(homeFor(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
