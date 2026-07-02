import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Activé uniquement si LAUNCH_DATE est défini dans .env (ex: 2025-09-01T08:00:00)
// Quand la date est passée, le middleware s'efface et le vrai site apparaît.
const LAUNCH = process.env.LAUNCH_DATE ? new Date(process.env.LAUNCH_DATE) : null;

const BYPASS = [
  "/coming-soon",
  "/admin",
  "/api",
  "/_next",
  "/favicon",
  "/icons",
  "/uploads",
  "/google",   // fichiers de vérification Google
];

export function middleware(req: NextRequest) {
  // Pas de date configurée → site visible normalement
  if (!LAUNCH) return NextResponse.next();

  // Date de lancement passée → site visible normalement (auto-destruction)
  if (Date.now() >= LAUNCH.getTime()) return NextResponse.next();

  const path = req.nextUrl.pathname;

  // Chemins exemptés
  if (BYPASS.some((p) => path.startsWith(p))) return NextResponse.next();

  // Extensions de fichiers statiques
  if (/\.(ico|png|jpg|jpeg|svg|webp|mp4|mp3|html|pdf|ics|txt|json)$/.test(path)) {
    return NextResponse.next();
  }

  // Tout le reste → page temporaire
  return NextResponse.redirect(new URL("/coming-soon", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
