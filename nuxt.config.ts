// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/hints",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxtjs/color-mode",
  ],
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  fonts: {
    families: [
      { name: "Noto Sans JP", provider: "google", weights: [400, 500, 700] },
    ],
  },
  content: {
    experimental: {
      nativeSqlite: true,
    },
  },
  compatibilityDate: "2024-04-03",
  colorMode: {
    classSuffix: "",
  },
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: "double",
        semi: true,
      },
    },
  },
});
