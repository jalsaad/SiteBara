// Configuration du site — CÔTÉ SERVEUR UNIQUEMENT.
// Stocke les paramètres éditables (clé Groq, identifiants réseaux sociaux, etc.) dans data/config.json.
// Même pattern que pages.ts : cache globalThis + écriture async.

import "server-only";
import fs from "fs";
import path from "path";

interface SiteConfig {
  groqApiKey?: string;
  facebookPageId?: string;
  facebookPageToken?: string;
  instagramAccountId?: string;
  linkedinOrgId?: string;
  linkedinAccessToken?: string;
}

const CONFIG_FILE = path.join(process.cwd(), "data", "config.json");

const gc = globalThis as unknown as { __baraConfig?: SiteConfig };

function loadConfig(): SiteConfig {
  if (!gc.__baraConfig) {
    try {
      gc.__baraConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    } catch {
      gc.__baraConfig = {};
    }
  }
  return gc.__baraConfig!;
}

function persistConfig(cfg: SiteConfig): void {
  gc.__baraConfig = cfg;
  const data = JSON.stringify(cfg, null, 2);
  fs.promises
    .mkdir(path.dirname(CONFIG_FILE), { recursive: true })
    .then(() => fs.promises.writeFile(CONFIG_FILE, data, "utf8"))
    .catch((e) => console.error("[config] Impossible de sauvegarder config.json :", e));
}

/** Clé Groq active : priorité à data/config.json, fallback sur l'env var. */
export function getGroqApiKey(): string | undefined {
  return loadConfig().groqApiKey || process.env.GROQ_API_KEY || undefined;
}

export function setGroqApiKey(key: string): void {
  const cfg = { ...loadConfig(), groqApiKey: key.trim() || undefined };
  persistConfig(cfg);
}

/** Identifiants réseaux sociaux : priorité config.json, fallback env vars. */
export function getSocialConfig() {
  const c = loadConfig();
  return {
    facebookPageId:      c.facebookPageId      || process.env.FACEBOOK_PAGE_ID      || "",
    facebookPageToken:   c.facebookPageToken   || process.env.FACEBOOK_PAGE_TOKEN   || "",
    instagramAccountId:  c.instagramAccountId  || process.env.INSTAGRAM_ACCOUNT_ID  || "",
    linkedinOrgId:       c.linkedinOrgId       || process.env.LINKEDIN_ORG_ID       || "",
    linkedinAccessToken: c.linkedinAccessToken || process.env.LINKEDIN_ACCESS_TOKEN || "",
  };
}

export function setSocialConfig(fields: Partial<Pick<SiteConfig,
  "facebookPageId" | "facebookPageToken" | "instagramAccountId" |
  "linkedinOrgId" | "linkedinAccessToken"
>>): void {
  const cfg: SiteConfig = { ...loadConfig() };
  for (const [k, v] of Object.entries(fields) as [keyof typeof fields, string][]) {
    (cfg as Record<string, string | undefined>)[k] = v.trim() || undefined;
  }
  persistConfig(cfg);
}

/** Version masquée de la clé pour l'affichage (ex. gsk_A···Xdbw). */
export function maskKey(key: string): string {
  if (key.length <= 8) return "·".repeat(key.length);
  return key.slice(0, 5) + "···" + key.slice(-4);
}
