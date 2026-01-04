// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "~/modules/content-assets",
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/hints",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxtjs/color-mode",
    "@nuxtjs/seo",
  ],
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  colorMode: {
    classSuffix: "",
  },
  content: {
    experimental: {
      sqliteConnector: "native",
    },
  },
  compatibilityDate: "2024-09-19",

  site: {
    url: "https://blog.naito.dev",
    name: "naitokosuke blog",
  },

  app: {
    head: {
      htmlAttrs: { lang: "ja" },
      meta: [
        { name: "author", content: "naitokosuke" },
        { name: "theme-color", content: "#1a1a1a" },
      ],
      link: [
        { rel: "icon", href: "/favicon.ico" },
      ],
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: false,
    },
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
  image: {
    quality: 80,
    format: ["avif", "webp"],
  },
  ogImage: {
    fonts: [
      {
        name: "Tsunagi Gothic",
        path: "/fonts/TsunagiGothic.ttf",
        weight: 400,
      },
    ],
  },
});
