import {
  checkCredentials,
  createSessionToken,
  sessionCookie,
} from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return Response.json(
      { error: "E-mail et mot de passe requis" },
      { status: 400 }
    );
  }
  const user = checkCredentials(email, password);
  if (!user) {
    return Response.json(
      { error: "Identifiants incorrects" },
      { status: 401 }
    );
  }
  const token = await createSessionToken(user.email, user.role);
  return Response.json(
    { email: user.email, role: user.role },
    { headers: { "Set-Cookie": sessionCookie(token) } }
  );
}
