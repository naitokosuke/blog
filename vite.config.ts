// Vite+ only. Nuxt does not read this file — Vite options for the app live in
// nuxt.config.ts under `vite`. This exists so `vp lint` / `vp fmt` have their
// config blocks, which are the only Oxlint/Oxfmt config Vite+ reads (it ignores
// .oxlintrc.json).
import { createVizeLintConfig } from "oxlint-plugin-vize";
import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    ...createVizeLintConfig({
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

  // Oxfmt defaults already match the style this repo had under eslint-stylistic
  // (2 spaces, double quotes, semicolons), so only the ignores are spelled out.
  fmt: {
    ignorePatterns: [".nuxt/**", ".output/**", "dist/**", "node_modules/**"],
  },
});
