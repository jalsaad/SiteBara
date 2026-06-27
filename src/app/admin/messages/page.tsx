"use client";

import { useEffect, useState } from "react";

type MessageStatus = "active" | "archived" | "trash";
type MainTab = "prereg" | "contact" | "trash";
type SubFilter = "active" | "archived";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: MessageStatus;
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
  status: MessageStatus;
}

type AnyMsg = (ContactMessage | PreRegistration) & { _type: "contact" | "prereg" };

function dateFr(iso: string) {
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function patchContact(id: string, status: MessageStatus) {
  await fetch("/api/contact", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
}

async function patchPrereg(id: string, status: MessageStatus) {
  await fetch("/api/preinscriptions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
}

async function deleteContact(id: string) {
  await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
}

async function deletePrereg(id: string) {
  await fetch(`/api/preinscriptions?id=${id}`, { method: "DELETE" });
}

export default function MessagesPage() {
  const [tab, setTab] = useState<MainTab>("prereg");
  const [sub, setSub] = useState<SubFilter>("active");
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [preregs, setPreregs] = useState<PreRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [c, p] = await Promise.all([
      fetch("/api/contact").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/preinscriptions").then((r) => (r.ok ? r.json() : [])),
    ]);
    setContacts(c);
    setPreregs(p);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  /* ── helpers de mutation ── */

  async function archive(type: "contact" | "prereg", id: string) {
    if (type === "contact") await patchContact(id, "archived");
    else await patchPrereg(id, "archived");
    await load();
  }

  async function moveToTrash(type: "contact" | "prereg", id: string) {
    if (type === "contact") await patchContact(id, "trash");
    else await patchPrereg(id, "trash");
    await load();
  }

  async function restore(type: "contact" | "prereg", id: string) {
    if (type === "contact") await patchContact(id, "active");
    else await patchPrereg(id, "active");
    await load();
  }

  async function destroyForever(type: "contact" | "prereg", id: string) {
    if (!confirm("Supprimer définitivement ce message ? Cette action est irréversible.")) return;
    if (type === "contact") await deleteContact(id);
    else await deletePrereg(id);
    await load();
  }

  /* ── listes filtrées ── */

  const visContacts = contacts.filter((m) =>
    tab === "trash" ? m.status === "trash" : m.status === sub
  );
  const visPreregs = preregs.filter((m) =>
    tab === "trash" ? m.status === "trash" : m.status === sub
  );

  const trashItems: AnyMsg[] = [
    ...contacts.filter((m) => m.status === "trash").map((m) => ({ ...m, _type: "contact" as const })),
    ...preregs.filter((m) => m.status === "trash").map((m) => ({ ...m, _type: "prereg" as const })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const countActive = (arr: { status: MessageStatus }[]) =>
    arr.filter((m) => m.status === "active").length;
  const countTrash = contacts.filter((m) => m.status === "trash").length +
    preregs.filter((m) => m.status === "trash").length;

  /* ── cartes de contenu ── */

  function ContactCard({ c }: { c: ContactMessage }) {
    return (
      <div className="msg-card">
        <div className="msg-sender">
          <span className="msg-name">{c.name}</span>
          <a className="msg-email" href={`mailto:${c.email}`}>{c.email}</a>
        </div>
        <div className="msg-subject">{c.subject}</div>
        <p className="msg-text">{c.message}</p>
      </div>
    );
  }

  function PreregCard({ p }: { p: PreRegistration }) {
    return (
      <div className="msg-card">
        <div className="msg-sender">
          <span className="msg-name">{p.firstName} {p.lastName}</span>
          <a className="msg-email" href={`mailto:${p.email}`}>{p.email}</a>
          {p.phone && <span className="msg-phone">{p.phone}</span>}
        </div>
        <div className="msg-subject">
          Année souhaitée : <span className="badge pub" style={{ fontSize: 11, padding: "2px 8px" }}>{p.level}</span>
        </div>
        {p.message && <p className="msg-text">{p.message}</p>}
      </div>
    );
  }

  /* ── boutons d'action ── */

  function ActionBtns({ type, id, status }: { type: "contact" | "prereg"; id: string; status: MessageStatus }) {
    if (status === "trash") {
      return (
        <div className="msg-actions">
          <button className="abtn ghost sm" title="Restaurer" onClick={() => restore(type, id)}>↩ Restaurer</button>
          <button className="abtn danger sm" title="Supprimer définitivement" onClick={() => destroyForever(type, id)}>✕</button>
        </div>
      );
    }
    return (
      <div className="msg-actions">
        {status === "active" && (
          <button className="abtn ghost sm" title="Archiver" onClick={() => archive(type, id)}>📁 Archiver</button>
        )}
        {status === "archived" && (
          <button className="abtn ghost sm" title="Restaurer dans Actifs" onClick={() => restore(type, id)}>↩</button>
        )}
        <button className="abtn ghost sm" title="Mettre à la corbeille" onClick={() => moveToTrash(type, id)}>🗑</button>
      </div>
    );
  }

  return (
    <div className="actus-wrap">
      <div className="actus-head">
        <div>
          <h2 className="serif">Messages reçus</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            Demandes de préinscription et messages envoyés depuis le site public.
          </p>
        </div>

        {/* ── onglets principaux ── */}
        <div className="seg" style={{ minWidth: 360 }}>
          <button className={tab === "prereg" ? "on" : ""} onClick={() => { setTab("prereg"); setSub("active"); }}>
            Préinscriptions ({countActive(preregs)})
          </button>
          <button className={tab === "contact" ? "on" : ""} onClick={() => { setTab("contact"); setSub("active"); }}>
            Contact ({countActive(contacts)})
          </button>
          <button className={tab === "trash" ? "on" : ""} onClick={() => setTab("trash")} style={{ position: "relative" }}>
            🗑 Corbeille{countTrash > 0 && <span className="trash-badge">{countTrash}</span>}
          </button>
        </div>
      </div>

      {/* ── sous-filtre actifs / archivés ── */}
      {tab !== "trash" && (
        <div style={{ display: "flex", gap: 8, padding: "8px 0 4px" }}>
          <button
            className={`abtn ${sub === "active" ? "save" : "ghost"} sm`}
            onClick={() => setSub("active")}
          >
            Actifs
          </button>
          <button
            className={`abtn ${sub === "archived" ? "save" : "ghost"} sm`}
            onClick={() => setSub("archived")}
          >
            Archivés
          </button>
        </div>
      )}

      {/* ── contenu ── */}
      <div className="atable">
        {loading && (
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>Chargement…</div>
        )}

        {/* Corbeille */}
        {!loading && tab === "trash" && trashItems.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>La corbeille est vide.</div>
        )}
        {tab === "trash" && trashItems.map((item) => {
          if (item._type === "contact") {
            const c = item as ContactMessage & { _type: "contact" };
            return (
              <div className="msg-row" key={c.id}>
                <div className="msg-body">
                  <ContactCard c={c} />
                </div>
                <div className="msg-meta">
                  <span className="dt">{dateFr(c.createdAt)}</span>
                  <ActionBtns type="contact" id={c.id} status={c.status} />
                </div>
              </div>
            );
          }
          const p = item as PreRegistration & { _type: "prereg" };
          return (
            <div className="msg-row" key={p.id}>
              <div className="msg-body">
                <PreregCard p={p} />
              </div>
              <div className="msg-meta">
                <span className="dt">{dateFr(p.createdAt)}</span>
                <ActionBtns type="prereg" id={p.id} status={p.status} />
              </div>
            </div>
          );
        })}

        {/* Préinscriptions */}
        {!loading && tab === "prereg" && visPreregs.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>
            {sub === "active" ? "Aucune demande de préinscription." : "Aucune préinscription archivée."}
          </div>
        )}
        {tab === "prereg" && visPreregs.map((p) => (
          <div className="msg-row" key={p.id}>
            <div className="msg-body">
              <PreregCard p={p} />
            </div>
            <div className="msg-meta">
              <span className="dt">{dateFr(p.createdAt)}</span>
              <ActionBtns type="prereg" id={p.id} status={p.status} />
            </div>
          </div>
        ))}

        {/* Contact */}
        {!loading && tab === "contact" && visContacts.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: "#959cb3" }}>
            {sub === "active" ? "Aucun message de contact." : "Aucun message archivé."}
          </div>
        )}
        {tab === "contact" && visContacts.map((c) => (
          <div className="msg-row" key={c.id}>
            <div className="msg-body">
              <ContactCard c={c} />
            </div>
            <div className="msg-meta">
              <span className="dt">{dateFr(c.createdAt)}</span>
              <ActionBtns type="contact" id={c.id} status={c.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
