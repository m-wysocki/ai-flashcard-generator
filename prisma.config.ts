import "dotenv/config";
import { defineConfig } from "prisma/config";
import { normalizePgConnectionString } from "./src/server/db/normalize-connection-string";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: normalizePgConnectionString(
      process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "",
    ),
  },
});
