import { defineConfig } from "prisma/config";

// La connexion PostgreSQL (migrations) est lue depuis DATABASE_URL.
// Côté application, l'adaptateur pg est passé au constructeur PrismaClient
// dans src/lib/articles.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  ...(process.env.DATABASE_URL
    ? {
        async adapter() {
          const { PrismaPg } = await import("@prisma/adapter-pg");
          return new PrismaPg({ connectionString: process.env.DATABASE_URL! });
        },
      }
    : {}),
});
