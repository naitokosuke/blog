// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "./modules/content-assets.ts",
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

  components: {
    dirs: [
      { path: "~/components/content/prose/heading", prefix: "Prose", pathPrefix: false },
      { path: "~/components/OgImage", prefix: "OgImage", pathPrefix: false },
      { path: "~/components", pathPrefix: true },
    ],
  },
  devtools: { enabled: true },

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
  css: ["~/assets/css/main.css"],

  site: {
    url: "https://blog.naito.dev",
    name: "naitokosuke blog",
  },
  colorMode: {
    classSuffix: "",
  },
  content: {
    experimental: {
      sqliteConnector: "native",
    },
  },
  compatibilityDate: "2024-09-19",

  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      wrangler: {
        compatibility_date: "2024-09-19",
        routes: [
          { pattern: "blog.naito.dev", custom_domain: true },
        ],
        d1_databases: [
          {
            binding: "DB",
            database_name: "blog-content",
            database_id: "ebfd80fa-49a3-43ca-9a27-0d37a66ef98b",
          },
        ],
      },
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
      "Zen Old Mincho",
    ],
  },
});
