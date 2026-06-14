import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

// Protège l'interface d'administration :
//  - /admin/login reste public (redirige si déjà connecté)
//  - le reste de /admin exige une session valide
//  - l'éditeur de pages et la gestion des comptes sont réservés au rôle ADMIN
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

  const adminOnly =
    pathname.startsWith("/admin/editeur") ||
    pathname.startsWith("/admin/utilisateurs");
  if (adminOnly && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/actus", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
