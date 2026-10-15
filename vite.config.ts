import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import process from "node:process";
import { defineConfig } from "vite";
import { voidPlugin } from "void";

export default defineConfig({
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [voidPlugin(), tanstackStart(), viteReact()],
});
