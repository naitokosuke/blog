// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      wrangler: {
        compatibility_date: "2024-09-19",
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
  colorMode: {
    classSuffix: "",
  },
  content: {
    experimental: {
      nativeSqlite: true,
    },
  },
  compatibilityDate: "2024-04-03",
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
