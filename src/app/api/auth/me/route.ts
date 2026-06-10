import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: "Non connecté" }, { status: 401 });
  }
  return Response.json({ email: session.email, role: session.role });
}
