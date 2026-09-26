// Vite+ only. Nuxt does not read this file — Vite options for the app live in
// nuxt.config.ts under `vite`. The blocks below are the only Oxlint/Oxfmt
// config Vite+ reads: `vp lint` and `vp fmt` ignore .oxlintrc.json and
// .oxfmtrc.json, which is why this repo has neither.
import { createVizeLintConfig } from "oxlint-plugin-vize";
import { defineConfig } from "vite-plus";

export default defineConfig({
  // This is the whole linter. ESLint is gone, so `import` joins the plugin
  // list to keep the `import/*` rules @nuxt/eslint used to contribute.
  lint: {
    ...createVizeLintConfig({
      preset: "nuxt",
      plugins: ["unicorn", "oxc", "typescript", "import"],
      rules: {
        "unicorn/filename-case": ["error", { case: "kebabCase" }],
      },
      settings: {
        helpLevel: "short",
      },
      ignorePatterns: [".nuxt/**", ".output/**", "dist/**", "node_modules/**"],
    }),

    // Vize rules are reported by a JS plugin against the whole SFC, so
    // `oxlint-disable` comments cannot reach them; per-file exemptions have to
    // live here.
    overrides: [
      {
        // nuxt-og-image resolves OG components by the `<Name>.satori.vue`
        // filename, so this one cannot be renamed.
        files: ["components/OgImage/*.satori.vue"],
        rules: {
          "vize/vue/component-definition-name-casing": "off",
        },
      },
      {
        // The icon bodies are string literals in the same file, copied from
        // Iconify's own sets. v-html is how they reach the <svg>, and no
        // untrusted value can reach it.
        files: ["app/primitives/app-icon.vue"],
        rules: {
          "vize/vue/no-v-html": "off",
        },
      },
      {
        // The stage renders one absolutely-positioned cell per grapheme. The
        // index is the cell's identity, and reusing the node by index is what
        // lets the transition animate from its previous position.
        files: ["app/features/tategaki/tategaki.vue"],
        rules: {
          "vize/vue/no-array-index-key": "off",
        },
      },
    ],
  },

  // Oxfmt's defaults are the style this repo already used (2 spaces, double
  // quotes, semicolons), so only the ignores are spelled out.
  fmt: {
    ignorePatterns: [".nuxt/**", ".output/**", "dist/**", "node_modules/**"],
  },
});
