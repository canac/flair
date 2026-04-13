import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";

export default defineConfig({
  plugins: [fresh()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
});
