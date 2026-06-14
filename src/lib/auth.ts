// Session par cookie signé (HMAC-SHA256, Web Crypto : fonctionne dans le proxy
// edge comme dans les route handlers).
//
// La vérification des identifiants et la gestion des comptes vivent dans
// `@/lib/users` (server-only, hachage scrypt) — volontairement séparées d'ici
// pour que ce module reste importable par le proxy edge.

export type Role = "ADMIN" | "COMM" | "CUISINE";

export interface Session {
  email: string;
  role: Role;
  exp: number; // epoch ms
}

export const SESSION_COOKIE = "bara_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 h (session classique)
const REMEMBER_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 j (« se souvenir de moi »)

const SECRET =
  process.env.AUTH_SECRET ?? "bara-dev-secret-a-changer-en-production";

function b64url(bytes: Uint8Array): string {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  return atob(s.replace(/-/g, "+").replace(/_/g, "/"));
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return b64url(new Uint8Array(sig));
}

export async function createSessionToken(
  email: string,
  role: Role,
  remember = false
): Promise<string> {
  const ttl = remember ? REMEMBER_TTL_MS : SESSION_TTL_MS;
  const payload = b64url(
    new TextEncoder().encode(
      JSON.stringify({ email, role, exp: Date.now() + ttl })
    )
  );
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(
  token: string | undefined
): Promise<Session | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if ((await hmac(payload)) !== sig) return null;
  try {
    const session = JSON.parse(b64urlDecode(payload)) as Session;
    if (session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

/** Lit et vérifie la session depuis l'en-tête Cookie d'une requête. */
export async function getSession(request: Request): Promise<Session | null> {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return verifySessionToken(match?.[1]);
}

/** Garde pour route handler : renvoie la session ou une Response 401/403. */
export async function requireRole(
  request: Request,
  ...roles: Role[]
): Promise<Session | Response> {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: "Authentification requise" }, { status: 401 });
  }
  if (roles.length > 0 && !roles.includes(session.role)) {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }
  return session;
}

export function sessionCookie(token: string, remember = false): string {
  const ttl = remember ? REMEMBER_TTL_MS : SESSION_TTL_MS;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ttl / 1000}${secure}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
