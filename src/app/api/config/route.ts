import { requireRole } from "@/lib/auth";
import { getGroqApiKey, maskKey, setGroqApiKey, getSocialConfig, setSocialConfig } from "@/lib/config";

export async function GET(request: Request) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;

  const key = getGroqApiKey();
  const sc = getSocialConfig();

  return Response.json({
    groqKeySet: !!key,
    groqKeyMasked: key ? maskKey(key) : "",
    social: {
      facebookPageId:      sc.facebookPageId      ? maskKey(sc.facebookPageId)      : "",
      facebookPageIdSet:   !!sc.facebookPageId,
      facebookPageToken:   sc.facebookPageToken   ? maskKey(sc.facebookPageToken)   : "",
      facebookPageTokenSet: !!sc.facebookPageToken,
      instagramAccountId:  sc.instagramAccountId  ? maskKey(sc.instagramAccountId)  : "",
      instagramAccountIdSet: !!sc.instagramAccountId,
      linkedinOrgId:       sc.linkedinOrgId       ? maskKey(sc.linkedinOrgId)       : "",
      linkedinOrgIdSet:    !!sc.linkedinOrgId,
      linkedinAccessToken: sc.linkedinAccessToken ? maskKey(sc.linkedinAccessToken) : "",
      linkedinAccessTokenSet: !!sc.linkedinAccessToken,
    },
  });
}

export async function PUT(request: Request) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;

  const body = await request.json().catch(() => ({}));

  if (typeof body?.groqApiKey === "string") {
    setGroqApiKey(body.groqApiKey);
  }

  const socialFields = [
    "facebookPageId", "facebookPageToken", "instagramAccountId",
    "linkedinOrgId", "linkedinAccessToken",
  ] as const;
  const socialUpdate: Record<string, string> = {};
  for (const f of socialFields) {
    if (typeof body[f] === "string") socialUpdate[f] = body[f];
  }
  if (Object.keys(socialUpdate).length > 0) {
    setSocialConfig(socialUpdate as Parameters<typeof setSocialConfig>[0]);
  }

  return Response.json({ ok: true });
}
