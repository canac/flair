import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import process from "node:process";

export default defineConfig({
  plugins: [fresh()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  ssr: {
    external: [
      "@libsql/client",
      "cheerio",
      "encoding-sniffer",
      "iconv-lite",
      "whatwg-encoding",
    ],
  },
  build: {
    rollupOptions: {
      external: [
        "@libsql/client",
        "cheerio",
        "encoding-sniffer",
        "iconv-lite",
        "whatwg-encoding",
      ],
    },
  },
});
