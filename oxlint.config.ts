import base from "@canac/oxc-config/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  plugins: ["node", "react", "vitest"],
  ignorePatterns: ["src/routeTree.gen.ts"],
});
