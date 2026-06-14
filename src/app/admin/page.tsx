import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

// Renvoie chaque rôle vers sa page d'accueil (le proxy a déjà garanti la session).
export default async function AdminIndex() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  redirect(session?.role === "CUISINE" ? "/admin/menu" : "/admin/actus");
}
