import { NextRequest } from "next/server";
import { spawn } from "child_process";

// Webhook de déploiement — appelé par GitHub Actions après chaque push.
// Lance git pull + build + pm2 restart en processus détaché (survit au redémarrage PM2).
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-deploy-secret");
  if (!secret || secret !== process.env.DEPLOY_SECRET) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const cmd =
    "cd /var/www/bara" +
    " && git pull origin main >> /var/www/bara/deploy.log 2>&1" +
    " && npx prisma generate >> /var/www/bara/deploy.log 2>&1" +
    " && npx prisma db push --accept-data-loss >> /var/www/bara/deploy.log 2>&1" +
    " && npm run build >> /var/www/bara/deploy.log 2>&1" +
    " && pm2 restart bara >> /var/www/bara/deploy.log 2>&1";

  const child = spawn("bash", ["-c", cmd], { detached: true, stdio: "ignore" });
  child.unref();

  return Response.json({ ok: true, message: "Deploy started" });
}
