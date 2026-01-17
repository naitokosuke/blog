// https://nuxt.com/docs/api/configuration/nuxt-config
console.log("[nuxt.config] POSTGRES_URL:", process.env.POSTGRES_URL ? "SET" : "NOT SET");

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
    "nuxt-studio",
  ],

  components: {
    dirs: [
      { path: "~/components/content/prose/heading", prefix: "Prose", pathPrefix: false },
      { path: "~/components/content/prose", prefix: "Prose", pathPrefix: false },
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
        { rel: "alternate", type: "application/rss+xml", title: "RSS Feed", href: "/feed.xml" },
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
    ...(process.env.POSTGRES_URL && {
      database: {
        type: "postgresql",
        url: process.env.POSTGRES_URL,
      },
    }),
    experimental: {
      sqliteConnector: "native",
    },
  },

  runtimeConfig: {
    studio: {
      auth: {
        github: {
          clientId: "",
          clientSecret: "",
        },
      },
    },
  },

  compatibilityDate: "2024-09-19",

  nitro: {
    prerender: {
      routes: ["/", "/feed.xml"],
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
      "Zen+Old+Mincho:400",
    ],
    zeroRuntime: true,
  },

  studio: {
    repository: {
      provider: "github",
      owner: "naitokosuke",
      repo: "blog",
      branch: "main",
    },
  },
});
