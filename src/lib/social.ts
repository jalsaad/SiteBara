// Diffusion des actualités vers les réseaux sociaux — CÔTÉ SERVEUR UNIQUEMENT.
//
// Deux modes, par réseau :
//  - clés API configurées → publication réelle via l'API du réseau
//  - sans clés            → publication SIMULÉE (mode démo) : le résultat est
//    tracé dans l'historique de l'article mais rien n'est envoyé.
//
// Variables d'environnement attendues :
//  - SITE_URL                 URL publique du site (liens partagés)
//  - FACEBOOK_PAGE_ID         + FACEBOOK_PAGE_TOKEN   → page Facebook
//  - INSTAGRAM_ACCOUNT_ID     + FACEBOOK_PAGE_TOKEN   → compte Instagram pro
//    (API Graph Meta ; Instagram exige une image : l'image Open Graph de
//    l'article est utilisée)
//  - LINKEDIN_ORG_ID          + LINKEDIN_ACCESS_TOKEN → page LinkedIn

import "server-only";
import type { Article, SocialNetwork, SocialShare } from "./article-types";
import { SOCIAL_NETWORKS } from "./article-types";

const SITE_URL = (process.env.SITE_URL ?? "https://atheneejulesbara.be").replace(
  /\/$/,
  ""
);

function articleUrl(article: Article): string {
  return `${SITE_URL}/actualites/${article.slug}`;
}

function message(article: Article): string {
  return `${article.title}\n\n${article.excerpt}\n\n${articleUrl(article)}`;
}

function result(
  network: SocialNetwork,
  status: SocialShare["status"],
  detail?: string
): SocialShare {
  return { network, sharedAt: new Date().toISOString(), status, detail };
}

const simulated = (network: SocialNetwork) =>
  result(
    network,
    "SIMULATED",
    "Mode démo : aucune clé API configurée, publication simulée."
  );

/* --------------------------- connecteurs --------------------------- */

async function toFacebook(article: Article): Promise<SocialShare> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_TOKEN;
  if (!pageId || !token) return simulated("facebook");
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message(article),
        link: articleUrl(article),
        access_token: token,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return result("facebook", "FAILED", `API Facebook : ${err.slice(0, 180)}`);
    }
    return result("facebook", "SENT", "Publié sur la page Facebook.");
  } catch (e) {
    return result("facebook", "FAILED", String(e).slice(0, 180));
  }
}

async function toInstagram(article: Article): Promise<SocialShare> {
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const token = process.env.FACEBOOK_PAGE_TOKEN;
  if (!accountId || !token) return simulated("instagram");
  try {
    // L'API Instagram exige un média : on publie l'image Open Graph de l'article.
    const create = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: `${articleUrl(article)}/opengraph-image`,
          caption: message(article),
          access_token: token,
        }),
      }
    );
    if (!create.ok) {
      const err = await create.text();
      return result("instagram", "FAILED", `API Instagram : ${err.slice(0, 180)}`);
    }
    const { id } = (await create.json()) as { id: string };
    const publish = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: id, access_token: token }),
      }
    );
    if (!publish.ok) {
      const err = await publish.text();
      return result("instagram", "FAILED", `API Instagram : ${err.slice(0, 180)}`);
    }
    return result("instagram", "SENT", "Publié sur le compte Instagram.");
  } catch (e) {
    return result("instagram", "FAILED", String(e).slice(0, 180));
  }
}

async function toLinkedIn(article: Article): Promise<SocialShare> {
  const orgId = process.env.LINKEDIN_ORG_ID;
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!orgId || !token) return simulated("linkedin");
  try {
    const res = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "LinkedIn-Version": "202405",
      },
      body: JSON.stringify({
        author: `urn:li:organization:${orgId}`,
        commentary: message(article),
        visibility: "PUBLIC",
        distribution: { feedDistribution: "MAIN_FEED" },
        content: {
          article: {
            source: articleUrl(article),
            title: article.title,
            description: article.excerpt,
          },
        },
        lifecycleState: "PUBLISHED",
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return result("linkedin", "FAILED", `API LinkedIn : ${err.slice(0, 180)}`);
    }
    return result("linkedin", "SENT", "Publié sur la page LinkedIn.");
  } catch (e) {
    return result("linkedin", "FAILED", String(e).slice(0, 180));
  }
}

/* ------------------------------- API ------------------------------- */

const CONNECTORS: Record<SocialNetwork, (a: Article) => Promise<SocialShare>> = {
  facebook: toFacebook,
  instagram: toInstagram,
  linkedin: toLinkedIn,
};

/** Diffuse un article vers les réseaux demandés ; renvoie un résultat par réseau. */
export async function diffuse(
  article: Article,
  networks: SocialNetwork[]
): Promise<SocialShare[]> {
  const valid = networks.filter((n) =>
    SOCIAL_NETWORKS.some((s) => s.id === n)
  );
  return Promise.all(valid.map((n) => CONNECTORS[n](article)));
}
