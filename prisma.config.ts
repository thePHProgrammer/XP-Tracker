import "dotenv/config";
import { defineConfig } from "prisma/config";

// The Prisma CLI (migrate/studio/db pull) connects with the direct
// (unpooled) database URL. The app itself connects separately at runtime
// via a driver adapter using the pooled DATABASE_URL - see lib/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
