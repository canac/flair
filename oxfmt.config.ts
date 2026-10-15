import base from "@canac/oxc-config/oxfmt";
import { defineConfig } from "oxfmt";

export default defineConfig({
  ...base,
  ignorePatterns: ["src/routeTree.gen.ts"],
});
