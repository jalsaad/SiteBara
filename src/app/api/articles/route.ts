import { NextRequest } from "next/server";
import { createArticle, listArticles } from "@/lib/articles";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const publishedOnly = request.nextUrl.searchParams.get("published") === "1";
  const articles = await listArticles({ publishedOnly });
  return Response.json(articles);
}

export async function POST(request: Request) {
  const auth = await requireRole(request, "ADMIN", "COMM");
  if (auth instanceof Response) return auth;
  const body = await request.json();
  if (!body?.title || !body?.category || !body?.excerpt) {
    return Response.json(
      { error: "title, category et excerpt sont requis" },
      { status: 400 }
    );
  }
  const article = await createArticle(body);
  return Response.json(article, { status: 201 });
}
