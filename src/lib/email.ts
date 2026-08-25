// Notifications e-mail (réception d'un message de contact ou d'une
// préinscription) — CÔTÉ SERVEUR UNIQUEMENT.
//
// Deux modes, comme la diffusion réseaux sociaux :
//  - SMTP configuré (SMTP_HOST…) → envoi réel via nodemailer
//  - sans configuration          → envoi SIMULÉ (mode démo) : le contenu est
//    tracé dans la console serveur, rien n'est envoyé.
//
// Variables d'environnement attendues :
//  - SMTP_HOST, SMTP_PORT     serveur SMTP (OVH : ssl0.ovh.net / 465)
//  - SMTP_USER, SMTP_PASS     identifiants de la boîte d'envoi
//  - SMTP_SECURE              "true" pour TLS implicite (port 465)
//  - MAIL_FROM                expéditeur affiché (défaut : SMTP_USER)
//
// Les notifications de contact et de préinscription ne sont plus stockées
// dans l'espace admin : elles sont transmises directement par e-mail aux
// destinataires ci-dessous (CONTACT_TO / PREREG_TO).

import "server-only";
import type { ContactMessage, PreRegistration } from "./messages";

export type MailStatus = "SENT" | "SIMULATED" | "FAILED";

export interface MailResult {
  status: MailStatus;
  detail: string;
}

const CONTACT_TO = "direction@atheneejulesbara.be";
const PREREG_TO = "lecomte.d@atheneejulesbara.be";
const SMTP_HOST = process.env.SMTP_HOST;

/** L'envoi réel n'est tenté que si le serveur SMTP est configuré. */
const configured = !!SMTP_HOST;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Construit un corps texte + HTML à partir de lignes « libellé / valeur ». */
function body(intro: string, rows: [string, string | null | undefined][]) {
  const kept = rows.filter(([, v]) => v != null && v !== "");
  const text =
    intro + "\n\n" + kept.map(([k, v]) => `${k} : ${v}`).join("\n");
  const html =
    `<p>${esc(intro)}</p><table cellpadding="6" style="border-collapse:collapse">` +
    kept
      .map(
        ([k, v]) =>
          `<tr><td style="color:#667085;vertical-align:top"><b>${esc(k)}</b></td>` +
          `<td style="white-space:pre-line">${esc(String(v))}</td></tr>`
      )
      .join("") +
    `</table>`;
  return { text, html };
}

/** Construit le transport nodemailer à partir des variables SMTP_*. */
async function transporter() {
  const nodemailer = (await import("nodemailer")).default;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: (process.env.SMTP_SECURE ?? "true") !== "false",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

/** Envoi bas-niveau : nodemailer si configuré, sinon trace console (démo). */
async function send(
  to: string,
  subject: string,
  content: { text: string; html: string },
  replyTo?: string
): Promise<MailResult> {
  if (!configured) {
    console.info(
      `[email] (démo) notification non envoyée — SMTP non configuré.\n` +
        `Sujet : ${subject}\n${content.text}`
    );
    return {
      status: "SIMULATED",
      detail: "Mode démo : SMTP non configuré, notification non envoyée.",
    };
  }
  try {
    const transport = await transporter();
    await transport.sendMail({
      from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
      to: to.split(",").map((a) => a.trim()),
      replyTo,
      subject,
      text: content.text,
      html: content.html,
    });
    return { status: "SENT", detail: `Notification envoyée à ${to}.` };
  } catch (e) {
    console.error("[email] échec de l'envoi :", e);
    return { status: "FAILED", detail: String(e).slice(0, 180) };
  }
}

/* ------------------------------ notifications ------------------------------ */

export async function notifyContactMessage(
  msg: Pick<ContactMessage, "name" | "email" | "subject" | "message">
): Promise<MailResult> {
  const content = body(
    "Un nouveau message a été reçu via le formulaire de contact du site.",
    [
      ["Nom", msg.name],
      ["E-mail", msg.email],
      ["Sujet", msg.subject],
      ["Message", msg.message],
    ]
  );
  return send(CONTACT_TO, `Contact — ${msg.subject}`, content, msg.email);
}

export async function notifyPreRegistration(
  reg: Pick<PreRegistration, "lastName" | "firstName" | "email" | "phone" | "level" | "message">
): Promise<MailResult> {
  const content = body(
    "Une nouvelle demande de préinscription a été reçue via le site.",
    [
      ["Nom", reg.lastName],
      ["Prénom", reg.firstName],
      ["E-mail", reg.email],
      ["Téléphone", reg.phone],
      ["Année souhaitée", reg.level],
      ["Message", reg.message],
    ]
  );
  return send(
    PREREG_TO,
    `Préinscription — ${reg.firstName} ${reg.lastName}`,
    content,
    reg.email
  );
}

/* ------------------------------ connexion admin ------------------------------ */

export async function sendLoginCode(to: string, code: string): Promise<MailResult> {
  const content = body(
    "Voici votre code de connexion à l'espace d'administration du site (valable 10 minutes).",
    [["Code de connexion", code]]
  );
  return send(to, `Code de connexion — ${code}`, content);
}

