// Authentification par cookie de session signé (HMAC-SHA256, Web Crypto :
// fonctionne dans le proxy comme dans les route handlers).
//
// Mode démo : deux comptes intégrés, mots de passe surchargés par les
// variables d'environnement ADMIN_PASSWORD / COMM_PASSWORD. À remplacer par
// les comptes en base (modèle User) lors du branchement PostgreSQL.

export type Role = "ADMIN" | "COMM";

export interface Session {
  email: string;
  role: Role;
  exp: number; // epoch ms
}

export const SESSION_COOKIE = "bara_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 h

const SECRET =
  process.env.AUTH_SECRET ?? "bara-dev-secret-a-changer-en-production";

const DEMO_USERS: { email: string; role: Role; password: string }[] = [
  {
    email: "admin@atheneejulesbara.be",
    role: "ADMIN",
    password: process.env.ADMIN_PASSWORD ?? "admin2026",
  },
  {
    email: "communication@atheneejulesbara.be",
    role: "COMM",
    password: process.env.COMM_PASSWORD ?? "comm2026",
  },
];

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

export function checkCredentials(
  email: string,
  password: string
): { email: string; role: Role } | null {
  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!user || user.password !== password) return null;
  return { email: user.email, role: user.role };
}

export async function createSessionToken(
  email: string,
  role: Role
): Promise<string> {
  const payload = b64url(
    new TextEncoder().encode(
      JSON.stringify({ email, role, exp: Date.now() + SESSION_TTL_MS })
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

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}${secure}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
