import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE, type Role } from "@/lib/auth";

function homeFor(role: Role): string {
  if (role === "CUISINE") return "/admin/menu";
  return "/admin/actus";
}

const LAUNCH = process.env.LAUNCH_DATE ? new Date(process.env.LAUNCH_DATE) : null;

const COMING_SOON_BYPASS = [
  "/coming-soon", "/admin", "/api", "/_next", "/favicon", "/icons", "/uploads", "/google",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Page temporaire avant lancement ───────────────────────────────────────
  // Actif uniquement si LAUNCH_DATE est défini dans .env et date non atteinte.
  // Auto-destruction dès que Date.now() >= LAUNCH.
  if (LAUNCH && Date.now() < LAUNCH.getTime()) {
    const isStatic = /\.(ico|png|jpg|jpeg|svg|webp|mp4|mp3|html|pdf|ics|txt|json)$/.test(pathname);
    if (!COMING_SOON_BYPASS.some((p) => pathname.startsWith(p)) && !isStatic) {
      return NextResponse.redirect(new URL("/coming-soon", request.url));
    }
  }

  // ── Protection admin ──────────────────────────────────────────────────────
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );

  if (pathname === "/admin/login") {
    if (session) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!session) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const allowed: Record<string, Role[]> = {
    "/admin/editeur":      ["ADMIN"],
    "/admin/utilisateurs": ["ADMIN"],
    "/admin/actus":        ["ADMIN", "COMM"],
    "/admin/messages":     ["ADMIN", "COMM"],
    "/admin/menu":         ["ADMIN", "CUISINE"],
  };
  const section = Object.keys(allowed).find((p) => pathname.startsWith(p));
  if (section && !allowed[section].includes(session.role)) {
    return NextResponse.redirect(new URL(homeFor(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
