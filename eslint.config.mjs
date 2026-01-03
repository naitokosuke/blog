// @ts-check
/// <reference path="./.nuxt/eslint-typegen.d.ts" />
import withNuxt from "./.nuxt/eslint.config.mjs";
import oxlint from "eslint-plugin-oxlint";
import tsParser from "@typescript-eslint/parser";

export default withNuxt(
  {
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  {
    files: ["app/modules/**/*.ts"],
    languageOptions: {
      parser: tsParser,
    },
  },
  // oxlint rules disabling must come after nuxt config to not override parser settings
  oxlint.configs["flat/recommended"].at(-1),
);
