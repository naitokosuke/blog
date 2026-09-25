// Vite+ only. Nuxt does not read this file — Vite options for the app live in
// nuxt.config.ts under `vite`. This exists so `vp lint` / `vp fmt` have their
// config blocks, which are the only Oxlint/Oxfmt config Vite+ reads (it ignores
// .oxlintrc.json).
import { createVizeLintConfig } from "oxlint-plugin-vize";
import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: createVizeLintConfig({
    preset: "nuxt",
    plugins: ["unicorn", "oxc", "typescript"],
    rules: {
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
    },
    settings: {
      helpLevel: "short",
    },
    ignorePatterns: [".nuxt/**", ".output/**", "dist/**", "node_modules/**"],
  }),

  // Oxfmt defaults already match the style this repo had under eslint-stylistic
  // (2 spaces, double quotes, semicolons), so only the ignores are spelled out.
  fmt: {
    ignorePatterns: [".nuxt/**", ".output/**", "dist/**", "node_modules/**"],
  },
});
