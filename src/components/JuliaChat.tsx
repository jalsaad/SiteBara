"use client";

// Julia — widget de discussion flottant sur le site public.
// Appelle POST /api/julia et affiche la réponse en streaming.

import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GREETING =
  "Bonjour ! Je suis Julia, l'assistante de l'Athénée Royal Jules Bara. Posez-moi vos questions sur les inscriptions, les filières, le calendrier, le restaurant…";

export default function JuliaChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch("/api/julia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) throw new Error("réseau");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Désolée, la connexion a échoué. Réessayez ou contactez le secrétariat au 069 89 06 02.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className="julia-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer Julia" : "Ouvrir Julia, l'assistante"}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="julia-panel" role="dialog" aria-label="Julia, assistante de l'école">
          <div className="julia-head">
            <span className="julia-avatar">J</span>
            <div>
              <b>Julia</b>
              <span>Assistante · Jules Bara</span>
            </div>
          </div>

          <div className="julia-body" ref={scrollRef}>
            <div className="julia-msg bot">{GREETING}</div>
            {messages.map((m, i) => (
              <div key={i} className={`julia-msg ${m.role === "user" ? "me" : "bot"}`}>
                {m.content || (busy && i === messages.length - 1 ? "…" : "")}
              </div>
            ))}
          </div>

          <form
            className="julia-input"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre question…"
              aria-label="Votre question"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Envoyer">
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
