import { defineConfig } from "prisma/config";

// Use process.env directly with fallbacks instead of prisma/config's env() helper.
// env() throws eagerly at module load time (including during `prisma generate`) which
// breaks Vercel builds when POSTGRES_PRISMA_URL is not yet set in the install phase.
// prisma generate does not need a live DB URL — it only reads the schema file.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.POSTGRES_PRISMA_URL ?? "",
    directUrl: process.env.POSTGRES_URL_NON_POOLING ?? "",
  },
});
