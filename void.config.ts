import { defineConfig } from "void/config";

export default defineConfig({
  worker: {
    compatibility_date: "2026-10-01",
    compatibility_flags: ["nodejs_compat"],
  },
  cloudflare: {
    name: "flair",
    observability: { enabled: true },
    d1_databases: [
      {
        binding: "DB",
        database_name: "flair",
        database_id: "7a97b37f-3a08-4703-bce8-3c8db7009669",
        migrations_dir: "./db/migrations",
      },
    ],
  },
});
