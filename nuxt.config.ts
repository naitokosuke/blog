// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "./modules/content-assets.ts",
    "./modules/glsl-minify.ts",
    "@nuxt/content",
    "@nuxt/fonts",
    "@nuxt/hints",
    "@nuxtjs/color-mode",
    "@nuxtjs/seo",
    "nuxt-studio",
  ],

  components: {
    dirs: [
      { path: "~/content/prose/heading", prefix: "Prose", pathPrefix: false },
      { path: "~/content/prose", prefix: "Prose", pathPrefix: false },
      { path: "~/content", pathPrefix: false },
      { path: "~/features", pathPrefix: false },
      { path: "~/primitives", pathPrefix: false },
    ],
  },

  imports: {
    dirs: ["primitives/overlay"],
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
    database: {
      type: "postgresql",
      url: process.env.POSTGRES_URL || "",
    },
    experimental: {
      sqliteConnector: "native",
    },
  },

  runtimeConfig: {
    content: {
      integrityCheck: true,
    },
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
  vite: {
    css: {
      transformer: "lightningcss",
    },
    build: {
      cssMinify: "lightningcss",
    },
  },
  ogImage: {
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
