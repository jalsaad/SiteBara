import { streamJulia, type ChatMessage } from "@/lib/julia";

// SDK Anthropic → exécution Node.
export const runtime = "nodejs";

const MAX_MESSAGES = 12;
const MAX_LEN = 2000;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const raw = Array.isArray(body?.messages) ? body.messages : null;
  if (!raw || raw.length === 0) {
    return Response.json({ error: "messages requis" }, { status: 400 });
  }

  // Validation / normalisation : rôles attendus, longueur bornée, historique
  // limité, et la conversation doit commencer (et finir) par un message user.
  const messages: ChatMessage[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (
      (m?.role === "user" || m?.role === "assistant") &&
      typeof m?.content === "string" &&
      m.content.trim()
    ) {
      messages.push({ role: m.role, content: m.content.slice(0, MAX_LEN) });
    }
  }
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json(
      { error: "Le dernier message doit provenir de l'utilisateur" },
      { status: 400 }
    );
  }

  const stream = await streamJulia(messages);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
