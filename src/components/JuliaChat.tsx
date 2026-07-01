"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "julia-history";

const GREETING =
  "Bonjour ! Je suis Julia, l'assistante de l'Athénée Royal Jules Bara. Posez-moi vos questions sur les inscriptions, les filières, le calendrier, le restaurant…";

const GREETING_SUGGS = [
  "Comment s'inscrire à l'école ?",
  "Quelles options sont disponibles ?",
  "Comment contacter l'école ?",
];

const PAGE_ANCHORS: Record<string, string> = {
  "Préinscription": "/preinscription",
  "Préinscriptions": "/preinscription",
  "Grilles": "/grilles",
  "Options": "/grilles",
  "Filières": "/grilles",
  "Calendrier": "/calendrier",
  "Restaurant": "/restaurant",
  "Contact": "/contact",
  "Actualités": "/actualites",
  "Applis": "/applis",
};

function renderMsg(raw: string): React.ReactNode {
  // Strip [SUGG] block si pas encore extrait (filet de sécurité)
  const text = raw.split("[SUGG]")[0].trimEnd();
  const parts: React.ReactNode[] = [];
  const re = /«\s*([^»]+?)\s*»/g;
  let last = 0, k = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const name = m[1].trim();
    const href = PAGE_ANCHORS[name];
    parts.push(
      href
        ? <a key={k++} href={href} className="julia-link">« {name} »</a>
        : m[0]
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 0 ? text : parts.length === 1 ? parts[0] : <>{parts}</>;
}

function extractSuggs(raw: string): { display: string; suggs: string[] } {
  const idx = raw.indexOf("[SUGG]");
  if (idx === -1) return { display: raw, suggs: [] };
  const end = raw.indexOf("[/SUGG]");
  const display = raw.slice(0, idx).trimEnd();
  if (end === -1) return { display, suggs: [] };
  const suggs = raw.slice(idx + 6, end).split("|").map(s => s.trim()).filter(Boolean).slice(0, 3);
  return { display, suggs };
}

export default function JuliaChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [suggs, setSuggs] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Ouverture depuis le bouton nav "Demandez à Julia"
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("julia:open", handler);
    return () => window.removeEventListener("julia:open", handler);
  }, []);

  // Notifier la nav de l'état ouvert/fermé
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(open ? "julia:opened" : "julia:closed"));
  }, [open]);

  // Restaurer l'historique depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Msg[] = JSON.parse(saved);
        // Strip défensif [SUGG] pour les messages existants
        const cleaned = parsed.map(m =>
          m.role === "assistant"
            ? { ...m, content: m.content.split("[SUGG]")[0].trimEnd() }
            : m
        );
        setMessages(cleaned);
      }
    } catch {}
  }, []);

  // Sauvegarder l'historique à chaque changement
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  // Scroll vers le bas
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, suggs]);

  function reset() {
    setMessages([]);
    setSuggs([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  async function send(txt?: string) {
    const text = (txt ?? input).trim();
    if (!text || busy) return;
    setInput("");
    setSuggs([]);
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
        // Masquer [SUGG] pendant le streaming
        setMessages([...next, { role: "assistant", content: acc.split("[SUGG]")[0] }]);
      }
      const { display, suggs: newSuggs } = extractSuggs(acc);
      setMessages([...next, { role: "assistant", content: display }]);
      setSuggs(newSuggs);
    } catch {
      setMessages([...next, {
        role: "assistant",
        content: "Désolée, la connexion a échoué. Réessayez ou contactez le secrétariat au 069 89 06 02.",
      }]);
    } finally {
      setBusy(false);
    }
  }

  const lastIsBot = messages.length > 0 && messages[messages.length - 1].role === "assistant";

  return (
    <>
      <button
        className="julia-fab"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Fermer Julia" : "Ouvrir Julia"}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="julia-panel" role="dialog" aria-label="Julia, assistante de l'école">
          <div className="julia-head">
            <span className="julia-avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon.ico" alt="Julia" className="julia-avatar-img" />
            </span>
            <div className="julia-head-info">
              <b>Julia</b>
              <span>Assistante IA</span>
            </div>
            <button className="julia-reset-btn" onClick={reset} title="Nouvelle conversation">
              ↺
            </button>
          </div>

          <div className="julia-body" ref={scrollRef}>
            <div className="julia-msg bot">{GREETING}</div>

            {messages.map((m, i) => (
              <div key={i} className={`julia-msg ${m.role === "user" ? "me" : "bot"}`}>
                {m.role === "assistant"
                  ? renderMsg(m.content || (busy && i === messages.length - 1 ? "…" : ""))
                  : m.content}
              </div>
            ))}

            {!busy && suggs.length > 0 && lastIsBot && (
              <div className="julia-suggs">
                {suggs.map((s, i) => (
                  <button key={i} className="julia-sugg" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}

            {!busy && messages.length === 0 && (
              <div className="julia-suggs">
                {GREETING_SUGGS.map((s, i) => (
                  <button key={i} className="julia-sugg" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <form className="julia-input" onSubmit={e => { e.preventDefault(); send(); }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Votre question…"
              aria-label="Votre question"
              disabled={busy}
              autoComplete="off"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Envoyer">➤</button>
          </form>
        </div>
      )}
    </>
  );
}
