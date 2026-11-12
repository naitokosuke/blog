// Vite+ and the Vize CLI only. Nuxt does not read this file — Vite options for
// the app live in nuxt.config.ts under `vite`. `vue:` is what `vize lint`,
// `vize fmt` and `vize check` read; `fmt` is Oxfmt's config for everything
// that is not a .vue file.
import { vitePlusConfig } from "@vizejs/vite-plugin/vite-plus";
import { defineConfig } from "vite-plus";

const vize = await vitePlusConfig(
  {
    vue: {
      // `vize lint` is the whole linter; Oxlint is not used.
      linter: {
        preset: "opinionated",
        // type/* rules (strict-boolean-expressions and friends) run on the
        // native TypeScript checker, the same one `vize check` uses.
        typeAware: true,
        // provide/inject, reactivity flow, SSR and async races across files.
        crossFile: true,
        rules: {
          // Not in any preset; opted into on its own.
          "type/strict-boolean-expressions": "warn",
          // Component state reaches CSS through v-bind() in <style> on
          // purpose, instead of :style attributes; the few bindings are cheap.
          "css/no-v-bind-performance": "off",
          // Nuxt registers components from `components.dirs` in nuxt.config.
          "vue/require-component-registration": "off",
          // Nuxt names pages, layouts and error.vue by file, and the
          // `components.dirs` prefixes turn h2.vue into <ProseH2>.
          "vue/multi-word-component-names": "off",
          // An optional prop left out is `undefined` on purpose here: the
          // templates branch on it (`v-if="date !== undefined"`).
          "script/require-default-prop": "off",
        },
      },
      entries: [
        {
          // nuxt-og-image resolves OG components by the `<Name>.takumi.vue`
          // filename, so this one cannot be renamed.
          files: ["components/OgImage/*.takumi.vue"],
          linter: { rules: { "vue/component-definition-name-casing": "off" } },
        },
        {
          // The icon bodies are string literals in the same file, copied from
          // Iconify's own sets. v-html is how they reach the <svg>, and no
          // untrusted value can reach it.
          files: ["app/primitives/app-icon.vue"],
          linter: { rules: { "vue/no-v-html": "off" } },
        },
        {
          // The stage renders one absolutely-positioned cell per grapheme. The
          // index is the cell's identity, and reusing the node by index is
          // what lets the transition animate from its previous position.
          files: ["app/features/tategaki/tategaki.vue"],
          linter: { rules: { "vue/no-array-index-key": "off" } },
        },
        {
          // The canvases render inside <ClientOnly>, and every browser API sits
          // in a function only onMounted or a frame callback reaches; the
          // analysis does not follow those calls.
          files: [
            "app/primitives/overlay/background-texture.vue",
            "app/primitives/overlay/fog-overlay.vue",
          ],
          linter: { rules: { "croquis/cf/browser-api-ssr": "off" } },
        },
        {
          // navigator.clipboard is only touched from the click handler. A later
          // click bumps `copyRun`, so a stale clipboard write never sets
          // `copied`; the analysis only recognises the watcher onCleanup form.
          files: ["app/primitives/share-buttons.vue"],
          linter: {
            rules: {
              "croquis/cf/browser-api-ssr": "off",
              "croquis/cf/async-boundary": "off",
            },
          },
        },
      ],
    },

    // Oxfmt's defaults are the style this repo already used (2 spaces, double
    // quotes, semicolons), so only the ignores are spelled out.
    fmt: {
      ignorePatterns: [
        // SFCs belong to `vize fmt` (see the fmt script). The two formatters
        // disagree on some templates, so only one of them may own .vue files.
        "**/*.vue",
        ".nuxt/**",
        ".output/**",
        "dist/**",
        "node_modules/**",
        // Vendored from pbakaus/impeccable; kept byte-identical so upstream
        // updates diff cleanly. See .claude/skills/impeccable/VENDORED.md.
        ".claude/skills/impeccable/**",
        ".claude/agents/impeccable-*.md",
        // Generated at build time and gitignored; see modules/font-subset.ts.
        "app/assets/css/font-subset.css",
      ],
    },
  },
  // The compiler runs inside Nuxt (@vizejs/nuxt), so the helper adds no plugin.
  { plugin: false },
);

// Vite+ owns the outer call and `run.tasks` stays a literal here, so `vp run`
// can read the tasks without evaluating this file. The Vize commands are
// package scripts, not tasks.
export default defineConfig({
  ...vize,

  run: {
    tasks: {
      // Rebuilds the Zen Old Mincho subset from the text the site renders,
      // into public/fonts + app/assets/css/font-subset.css. Every build
      // already does this (modules/font-subset.ts); this is the manual
      // trigger, e.g. to refresh it in a running `nuxt dev`.
      //
      // Uncached on purpose: it calls the Google Fonts API, and the source
      // directories it scans are listed inside the script, so an `input` glob
      // here would be a second copy of that list waiting to drift.
      "font:subset": {
        command: "node scripts/build-font-subset.mjs",
        cache: false,
      },
    },
  },
});
