"use client";

import { useEffect, useState } from "react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface PreRegistration {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string | null;
  level: string;
  message: string | null;
  createdAt: string;
}

function dateFr(iso: string) {
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesPage() {
  const [tab, setTab] = useState<"prereg" | "contact">("prereg");
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [preregs, setPreregs] = useState<PreRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/contact").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/preinscriptions").then((r) => (r.ok ? r.json() : [])),
    ]).then(([c, p]) => {
      setContacts(c);
      setPreregs(p);
      setLoading(false);
    });
  }, []);

  return (
    <div className="actus-wrap">
      <div className="actus-head">
        <div>
          <h2 className="serif">Messages reçus</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            Demandes de préinscription et messages envoyés depuis le site
            public.
          </p>
        </div>
        <div className="seg" style={{ minWidth: 320 }}>
          <button
            className={tab === "prereg" ? "on" : ""}
            onClick={() => setTab("prereg")}
          >
            Préinscriptions ({preregs.length})
          </button>
          <button
            className={tab === "contact" ? "on" : ""}
            onClick={() => setTab("contact")}
          >
            Contact ({contacts.length})
          </button>
        </div>
      </div>

      <div className="atable">
        {loading && (
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>
            Chargement…
          </div>
        )}
        {!loading && tab === "prereg" && preregs.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>
            Aucune demande de préinscription pour le moment.
          </div>
        )}
        {!loading && tab === "contact" && contacts.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>
            Aucun message de contact pour le moment.
          </div>
        )}
        {tab === "prereg" &&
          preregs.map((p) => (
            <div
              className="arow"
              key={p.id}
              style={{ gridTemplateColumns: "1fr 170px 200px" }}
            >
              <div>
                <div className="ti2">
                  {p.firstName} {p.lastName}
                </div>
                <div className="ds">
                  {p.email}
                  {p.phone ? ` · ${p.phone}` : ""}
                  {p.message ? ` — ${p.message}` : ""}
                </div>
              </div>
              <div>
                <span className="badge pub">{p.level}</span>
              </div>
              <div className="dt">{dateFr(p.createdAt)}</div>
            </div>
          ))}
        {tab === "contact" &&
          contacts.map((c) => (
            <div
              className="arow"
              key={c.id}
              style={{ gridTemplateColumns: "1fr 200px" }}
            >
              <div>
                <div className="ti2">
                  {c.subject} — {c.name}
                </div>
                <div className="ds">
                  {c.email} · {c.message}
                </div>
              </div>
              <div className="dt">{dateFr(c.createdAt)}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
