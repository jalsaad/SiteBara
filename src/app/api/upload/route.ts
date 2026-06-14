// Téléversement de médias (images d'actualités/galeries, vidéo d'arrière-plan
// de bannière) — CÔTÉ SERVEUR.
//
// Les fichiers sont écrits dans `public/uploads/` et servis statiquement par
// Next à l'URL `/uploads/<nom>`. Sur l'hébergement OVH (serveur Node au long
// cours via `next start`), les fichiers ajoutés à l'exécution sont bien servis.

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireRole } from "@/lib/auth";

// Écriture sur disque → exécution Node obligatoire (jamais sur l'edge).
export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 Mo (images)
const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25 Mo (vidéo d'arrière-plan)

// Type MIME → extension de fichier autorisée.
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(request: Request) {
  const auth = await requireRole(request, "ADMIN", "COMM");
  if (auth instanceof Response) return auth;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Aucun fichier reçu" }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return Response.json(
      {
        error:
          "Format non supporté (image JPEG/PNG/WebP/GIF ou vidéo MP4/WebM attendue)",
      },
      { status: 415 }
    );
  }
  const isVideo = file.type.startsWith("video/");
  const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > max) {
    return Response.json(
      {
        error: isVideo
          ? "Vidéo trop volumineuse (25 Mo maximum)"
          : "Image trop volumineuse (5 Mo maximum)",
      },
      { status: 413 }
    );
  }

  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, name),
    Buffer.from(await file.arrayBuffer())
  );

  return Response.json({ url: `/uploads/${name}` }, { status: 201 });
}
