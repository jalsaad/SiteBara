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
//  - MAIL_TO                  destinataire des notifications (secrétariat).
//    Plusieurs adresses séparées par des virgules sont acceptées.

import "server-only";
import type { ContactMessage, PreRegistration } from "./messages";

export type MailStatus = "SENT" | "SIMULATED" | "FAILED";

export interface MailResult {
  status: MailStatus;
  detail: string;
}

const MAIL_TO = process.env.MAIL_TO;
const SMTP_HOST = process.env.SMTP_HOST;

/** L'envoi réel n'est tenté que si le serveur SMTP et un destinataire existent. */
const configured = !!SMTP_HOST && !!MAIL_TO;

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
      to: MAIL_TO!.split(",").map((a) => a.trim()),
      replyTo,
      subject,
      text: content.text,
      html: content.html,
    });
    return { status: "SENT", detail: `Notification envoyée à ${MAIL_TO}.` };
  } catch (e) {
    console.error("[email] échec de l'envoi :", e);
    return { status: "FAILED", detail: String(e).slice(0, 180) };
  }
}

/* ------------------------------ notifications ------------------------------ */

export async function notifyContactMessage(
  msg: ContactMessage
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
  return send(`Contact — ${msg.subject}`, content, msg.email);
}

export async function notifyPreRegistration(
  reg: PreRegistration
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
    `Préinscription — ${reg.firstName} ${reg.lastName}`,
    content,
    reg.email
  );
}

/**
 * Envoie le code de double authentification à l'utilisateur qui se connecte.
 * Adressé à sa propre boîte (indépendant de MAIL_TO) : ne dépend que de SMTP.
 * Sans SMTP (mode démo), le code est tracé dans la console serveur.
 */
export async function sendLoginCode(
  to: string,
  code: string
): Promise<MailResult> {
  const subject = "Votre code de connexion — Athénée Royal Jules Bara";
  const text =
    `Votre code de connexion à l'espace d'administration est : ${code}\n\n` +
    `Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette ` +
    `tentative de connexion, ignorez ce message.`;
  const html =
    `<p>Votre code de connexion à l'espace d'administration est :</p>` +
    `<p style="font-size:30px;font-weight:700;letter-spacing:6px;color:#1b2245">${esc(code)}</p>` +
    `<p style="color:#667085">Ce code expire dans 10 minutes. Si vous n'êtes pas ` +
    `à l'origine de cette tentative de connexion, ignorez ce message.</p>`;

  if (!SMTP_HOST) {
    console.info(`[email] (démo) code de connexion pour ${to} : ${code}`);
    return {
      status: "SIMULATED",
      detail: "Mode démo : code tracé dans la console serveur.",
    };
  }
  try {
    const transport = await transporter();
    await transport.sendMail({
      from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    return { status: "SENT", detail: `Code envoyé à ${to}.` };
  } catch (e) {
    console.error("[email] échec de l'envoi du code :", e);
    return { status: "FAILED", detail: String(e).slice(0, 180) };
  }
}
