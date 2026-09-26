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
  // font-subset.css must stay last: its @font-face rules override the Google
  // subsets @nuxt/fonts injects into main.css, and a later rule wins
  css: ["~/assets/css/main.css", "~/assets/css/font-subset.css"],

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
  hooks: {
    // nuxt-studio's editing host is 745 KB (201 KB gzipped) and is imported
    // only after the session endpoint confirms an editor, but Nuxt still emits
    // a <link rel="prefetch"> for it, so every reader downloads it in the
    // background. Drop the hint; the chunk is still there when Studio asks.
    // The bundler sometimes emits the host as a shared chunk, and a shared
    // chunk keeps no source path - only the "host" name survives, so match on
    // that too. If a future version renames the file the prefetch comes back,
    // which costs bandwidth but breaks nothing.
    "build:manifest"(manifest) {
      for (const [key, entry] of Object.entries(manifest)) {
        const studio =
          key.includes("nuxt-studio") ||
          entry.src?.includes("nuxt-studio") ||
          entry.name === "host" ||
          entry.name === "host.dev";
        if (studio) {
          entry.prefetch = false;
          entry.preload = false;
        }
      }
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
