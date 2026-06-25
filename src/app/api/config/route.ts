import { requireRole } from "@/lib/auth";
import { getGroqApiKey, maskKey, setGroqApiKey } from "@/lib/config";

export async function GET(request: Request) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;

  const key = getGroqApiKey();
  return Response.json({
    groqKeySet: !!key,
    groqKeyMasked: key ? maskKey(key) : "",
  });
}

export async function PUT(request: Request) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;

  const body = await request.json().catch(() => ({}));
  if (typeof body?.groqApiKey === "string") {
    setGroqApiKey(body.groqApiKey);
  }
  return Response.json({ ok: true });
}
